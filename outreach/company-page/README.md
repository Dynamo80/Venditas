# The company page: start here

About 45 minutes, once. After that the page posts twice a week by itself, from
LinkedIn's own scheduler.

Nothing in this folder logs in to LinkedIn, and nothing should (decision 018).
It is text and images to paste.

## Why a page at all

Today's cold emails are signed by Abin Johnson of Venditas. A recruiter who looks
the sender up should find a company with a logo, a clear description and recent
posts, not a name with nothing behind it. That's what this page is for. Followers
are a bonus.

## 1. Create it (15 minutes)

Every field is in [`page.md`](page.md).

- **Create it from Abin's own account if LinkedIn allows it.** If it is created
  from the second account, open **Admin tools → Manage admins** straight away and
  add Abin's own profile as **Super admin**. Otherwise, if that account is
  restricted, the page goes with it, and the page is worth keeping even if the
  account isn't.
- Upload `images/logo-400.png` and `images/cover-1128x191.png`.
- Paste the tagline, description and specialties, set the custom button, and save.

## 2. Connect Abin's profile to it (2 minutes)

On Abin's profile, edit the Venditas **Experience** entry and pick the new page
from the company dropdown, so the Venditas logo shows beside the role. That's
what a recruiter sees when they look up who emailed them. The rest of the profile
fix (the About that still says Venditas was shut down) is in `../profile.md`.

## 3. The pinned post, then a month of scheduled ones (25 minutes)

From [`posts.md`](posts.md):

1. Publish the **day-one post** now with `images/before-after.png`, then pin it.
2. Schedule posts **1 to 8** in one sitting. For each: start a post as the page,
   paste the text, add its image, then use the clock icon beside **Post** to set
   the date and time given. The last one goes out on Friday 9 October.

## 4. Followers, by hand

- **Invite connections:** on the page, **Grow → Invite to follow**. LinkedIn
  gives a monthly allowance. Use it on Abin's own connections, not on strangers.
- **Finding the person who decides at an agency:** the LinkedIn pack
  (`../linkedin/START-HERE.md`) already gives, for each agency, a search that finds
  them. A person runs the search and decides. Nothing here collects profiles,
  because `ops/build-prospects.mjs` rules LinkedIn out as a source and
  `legal/lia.md` does not cover it.

## Don't

- Connect an automation tool, a scheduler that needs a LinkedIn login, or a
  browser extension that posts or collects. It risks the page, and the page is
  the asset.
- Buy followers, join engagement pods, or ask for reviews in exchange for anything.
- Post a sentence you can't source. `posts.md` has the test.
