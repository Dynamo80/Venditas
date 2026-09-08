/**
 * Is this a real person at a real agency, or a way of not being one?
 *
 * The trial gate in meter.mjs counts requests and tries to keep one visitor
 * from minting a hundred identities. This is a stricter question asked in a
 * different place: before an account is created for someone who has agreed to a
 * demo, is the address they typed a work address they actually control?
 *
 * Nine layers, cheapest first, network last — though one of them, the consumer
 * mailbox check, is off by default now (decision 012). Each returns a reason a
 * person can act on, because every rejection here happens in front of a prospect
 * who has already spent half an hour on a call, and "invalid email" is an insult
 * when the real answer is "that address forwards somewhere we cannot reach you".
 *
 * WHAT THIS CANNOT DO, AND WHY IT DOES NOT PRETEND TO
 *
 * Every check below is a heuristic about a string. None of them proves the
 * person can read mail at that address — only a clicked link does that, which
 * is why signup issues one and the account stays inert until it is followed.
 * Treat this file as the thing that keeps the verification email from being
 * sent somewhere pointless, not as the thing that establishes identity.
 *
 * DELIBERATELY NOT DONE: SMTP callback verification (connecting to the domain's
 * mail server and issuing RCPT TO to see whether the mailbox exists). It is the
 * obvious next lever and it is a trap: most serious mail servers accept-all and
 * answer yes to everything, several treat the probe as address harvesting and
 * blacklist the source, and doing it from the same IP we send outreach from
 * would risk the one asset this business cannot replace. The verification email
 * answers the same question honestly.
 */

import dns from 'node:dns/promises';
import { canonicalEmail } from './meter.mjs';
import { DISPOSABLE_DOMAINS, FETCHED as BLOCKLIST_FETCHED } from './blocklist-disposable.mjs';

export { BLOCKLIST_FETCHED };

/**
 * Forwarding and masking services. Legitimate products, all of them, and
 * exactly what someone reaches for when they want a working inbox without
 * giving you an address that identifies them. A masked address also breaks the
 * thing an account is for: when the mask is burned the customer is
 * unreachable, and support mail bounces into nowhere.
 */
const ALIAS_RELAYS = new Set([
  'duck.com',                       // DuckDuckGo Email Protection
  'privaterelay.appleid.com',       // Apple Hide My Email
  'mozmail.com', 'relay.firefox.com', // Firefox Relay
  'simplelogin.com', 'simplelogin.co', 'simplelogin.io', 'simplelogin.fr',
  'aleeas.com', 'slmail.me', '8shield.net', 'passmail.net', 'passinbox.com',
  'anonaddy.com', 'anonaddy.me', 'addy.io', 'mailer.me',
  '33mail.com', 'spamgourmet.com', 'improvmx.com', 'forwardemail.net',
  'burnermail.io', 'firefox.com', 'hide-my-email.com',
]);

/**
 * Consumer mailboxes. NOT BLOCKED BY DEFAULT — see decision 012.
 *
 * This layer used to be on, on the reasoning that one Gmail account is an
 * unlimited supply of alice+1, alice+2, a.l.i.c.e. Two things make that the
 * wrong trade now. The demo is five CVs, so the prize for farming aliases is
 * five CVs. And the aliasing it was guarding against is already handled a layer
 * down: `+` tags are refused outright at signup, and canonicalEmail folds Gmail
 * dots, so a.l.i.c.e@gmail.com and alice@gmail.com share one counter however
 * many ways they are spelled.
 *
 * What blocking Gmail actually cost was real customers. A two-person
 * recruitment agency running on Gmail is not rare, and telling one of them
 * their own address is unacceptable — on a signup page, straight after a demo —
 * is an expensive way to protect five CVs.
 *
 * The list stays because the flag stays: `requireWorkEmail: true` turns it back
 * on in one place if the calculation ever changes.
 */
const CONSUMER_MAIL = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.co.uk', 'hotmail.com', 'hotmail.co.uk', 'live.com',
  'live.co.uk', 'msn.com', 'passport.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.in', 'ymail.com', 'rocketmail.com',
  'aol.com', 'aim.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'protonmail.ch', 'pm.me',
  'gmx.com', 'gmx.net', 'gmx.de', 'gmx.co.uk', 'web.de', 'mail.com', 'email.com',
  'yandex.com', 'yandex.ru', 'mail.ru', 'inbox.ru', 'bk.ru', 'list.ru',
  'zoho.com', 'zohomail.com',
  'tutanota.com', 'tutanota.de', 'tuta.com', 'tutamail.com',
  'fastmail.com', 'fastmail.fm', 'hushmail.com',
  'rediffmail.com', 'sify.com', 'indiatimes.com',
  'qq.com', '163.com', '126.com', 'sina.com', 'naver.com', 'daum.net',
  'btinternet.com', 'sky.com', 'virginmedia.com', 'talktalk.net', 'ntlworld.com',
  'blueyonder.co.uk', 'tiscali.co.uk', 'orange.fr', 'free.fr', 'laposte.net',
  't-online.de', 'libero.it', 'seznam.cz', 'wp.pl', 'o2.pl', 'interia.pl',
]);

/**
 * Shared mailboxes. An account is a person: someone to name on an invoice,
 * someone whose demo this was. `info@` is a queue, and a magic link sent to a
 * queue is a magic link four people can click.
 *
 * Recruitment-specific ones are deliberately absent — `recruitment@`,
 * `careers@` and `jobs@` are frequently one recruiter's actual desk at a small
 * agency, and blocking them would reject the customer we are trying to sign.
 */
const ROLE_LOCALPARTS = new Set([
  'admin', 'administrator', 'billing', 'contact', 'enquiries', 'enquiry',
  'finance', 'help', 'hello', 'hi', 'info', 'information', 'mail', 'marketing',
  'no-reply', 'noreply', 'office', 'postmaster', 'sales', 'support', 'team',
  'webmaster', 'accounts', 'abuse', 'security', 'privacy', 'dpo', 'legal',
]);

/** Reserved by RFC 2606/6761 for documentation and testing. Never real mail. */
const UNROUTABLE_TLDS = new Set(['test', 'invalid', 'example', 'local', 'localhost', 'onion']);
const PLACEHOLDER_DOMAINS = new Set([
  'example.com', 'example.org', 'example.net', 'domain.com', 'email.com',
  'test.com', 'testing.com', 'yourcompany.com', 'youragency.com', 'company.com',
]);

/**
 * MX hosts that give the game away regardless of what the domain is called.
 * A throwaway provider selling "use your own domain" changes the domain and
 * cannot change where the mail actually lands.
 *
 * Kept tight on purpose. Apple's relay is not here because real iCloud custom
 * domains share its MX, and blocking a paying customer's own domain to catch a
 * masked address is the wrong trade.
 */
const SUSPECT_MX = [
  'mailinator.com', 'yopmail.com', 'guerrillamail', 'mailnesia',
  'improvmx.com', 'forwardemail.net', 'simplelogin', 'anonaddy', 'addy.io',
  'duck.com', 'mozmail.com', '33mail.com', 'temporary-mail', 'tempmail',
  'trashmail', 'dropmail', 'mail.tm', 'inboxkitten',
];

const deny = (reason, message, extra = {}) => ({ ok: false, reason, message, ...extra });

/** Every parent of a domain, so a blocklist entry catches `x.y.blocked.com`. */
function domainChain(domain) {
  const parts = domain.split('.');
  const out = [];
  for (let i = 0; i < parts.length - 1; i++) out.push(parts.slice(i).join('.'));
  return out;
}

/**
 * The whole verdict.
 *
 * `resolver` is injectable so the rules can be tested without a network and so
 * a DNS outage cannot be mistaken for a bad address.
 */
export async function checkEmail(raw, options = {}) {
  const {
    requireWorkEmail = false,   // decision 012: Gmail is a customer, not an attacker
    allowRoleAddress = false,
    checkDns = true,
    resolver = dns,
    ownDomain = 'venditas.in',
  } = options;

  const typed = String(raw || '').normalize('NFKC').replace(/\s+/g, '').toLowerCase();

  // ---------------------------------------------------------- 1. shape
  if (!typed) return deny('empty', 'Enter your work email address.');
  if (typed.length > 254) return deny('too-long', 'That address is too long to be real.');

  const at = typed.lastIndexOf('@');
  if (at < 1 || at === typed.length - 1) {
    return deny('no-at', "That doesn't look like an email address — it needs a name, an @, and a domain.");
  }
  const local = typed.slice(0, at);
  const domain = typed.slice(at + 1).replace(/\.$/, '');

  if (local.length > 64) return deny('local-too-long', 'The part before the @ is too long to be real.');
  if (typed.includes('"') || typed.includes('\\')) {
    // Quoted local parts are legal and essentially never used outside abuse.
    return deny('exotic', 'Please use a plain work email address, without quotes.');
  }
  if (/^\.|\.$|\.\./.test(local)) {
    return deny('bad-local', 'That address has a stray dot in it — mind checking?');
  }
  if (domain.startsWith('[')) return deny('ip-domain', 'Please use a company domain, not an IP address.');
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return deny('bad-domain', "That domain doesn't look right — mind checking the spelling?");
  }

  const labels = domain.split('.');
  const tld = labels[labels.length - 1];
  if (labels.length < 2) return deny('bad-domain', 'That address is missing a domain.');
  if (tld.length < 2 || /[0-9]/.test(tld)) return deny('bad-tld', "That domain doesn't look right.");

  // --------------------------------------------- 2. never-real domains
  if (UNROUTABLE_TLDS.has(tld)) {
    return deny('unroutable', 'That domain cannot receive mail. Please use your work address.');
  }
  if (PLACEHOLDER_DOMAINS.has(domain)) {
    return deny('placeholder', "That looks like the example address, not yours.");
  }
  if (domain === ownDomain) {
    return deny('own-domain', 'That is our address. Please use your agency’s.');
  }

  // ------------------------------------- 3. sub-addressing, not folded
  // meter.mjs canonicalises `alice+demo@` down to `alice@` for counting. Here
  // it is refused outright and said out loud: a tagged address on a signup form
  // is someone keeping one hand free, and the polite version of noticing that
  // is asking for the plain address.
  if (local.includes('+')) {
    return deny('subaddress', 'Please use your plain work address, without a + tag.');
  }

  // ------------------------------------------------ 4. masking services
  for (const d of domainChain(domain)) {
    if (ALIAS_RELAYS.has(d)) {
      return deny(
        'alias-relay',
        'That is a forwarding or masked address. Please use your agency’s own email — the account and anything we send about it has to reach you later.'
      );
    }
  }

  // ------------------------------------------------- 5. disposable list
  for (const d of domainChain(domain)) {
    if (DISPOSABLE_DOMAINS.has(d)) {
      return deny('disposable', 'That is a temporary email provider. Please use your work address.');
    }
  }

  // ----------------------------------------------- 6. consumer mailbox
  if (requireWorkEmail) {
    for (const d of domainChain(domain)) {
      if (CONSUMER_MAIL.has(d)) {
        return deny(
          'consumer-mail',
          'Please use your agency email rather than a personal one. If your agency genuinely runs on this address, reply to the demo invitation and we will set you up by hand.',
          { appealable: true }
        );
      }
    }
  }

  // --------------------------------------------------- 7. role address
  if (!allowRoleAddress && ROLE_LOCALPARTS.has(local)) {
    return deny(
      'role-address',
      'That is a shared mailbox. Please use your own work address, so the account belongs to a person.'
    );
  }

  // ------------------------------------------------------------ 8. DNS
  // Everything above is a judgement about a string. This is the first question
  // with an answer outside our own opinion: can this domain receive mail at all?
  let mx = [];
  if (checkDns) {
    try {
      mx = await resolver.resolveMx(domain);
    } catch (e) {
      if (e.code === 'ENOTFOUND' || e.code === 'NXDOMAIN') {
        return deny('no-such-domain', `There is no domain called ${domain} — mind checking the spelling?`);
      }
      if (e.code === 'ENODATA') {
        mx = [];
      } else {
        // A resolver timeout is our problem, not theirs. Let it through to the
        // verification email, which settles the question anyway.
        return { ok: true, reason: 'dns-unavailable', canonical: canonicalEmail(typed), domain, local, mx: [] };
      }
    }

    if (!mx.length) {
      return deny(
        'no-mx',
        `${domain} is not set up to receive email, so we could not send you a confirmation link.`
      );
    }

    // ------------------------------------- 9. where the mail actually lands
    const hosts = mx.map((r) => String(r.exchange || '').toLowerCase());
    for (const host of hosts) {
      for (const bad of SUSPECT_MX) {
        if (host.includes(bad)) {
          return deny(
            'disposable-mx',
            'That domain forwards to a temporary email service. Please use your agency’s own email.'
          );
        }
      }
    }
  }

  return {
    ok: true,
    reason: 'ok',
    canonical: canonicalEmail(typed),
    domain,
    local,
    mx: mx.map((r) => r.exchange),
  };
}

/**
 * A one-line summary for logs and the admin view. Never includes the address —
 * a rejected signup is still someone's personal data.
 */
export function describeVerdict(v) {
  return v.ok ? `allowed (${v.reason})` : `refused: ${v.reason}`;
}
