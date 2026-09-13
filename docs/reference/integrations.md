# CRM integrations: which to build first

**Researched:** 13 September 2026. Read directly from each vendor's primary
material: Firefish's Postman collection (the file behind
developer.firefishsoftware.com), JobAdder's `openapi.json`, JobAdder's API help
centre, the Firefish and Tracker help pages, and the API terms. Web search ran
out during this session, so anything only findable by search is listed under
open questions instead.

Tags: **[V]** read on the vendor's own page or spec · **[2H]** second-hand ·
**[I]** our inference. When a vendor's documentation says nothing, this file
says "not documented" and tags it [V]. Saying the feature therefore does not
exist is an [I].

---

## Recommendation

**Build JobAdder first.** Decision 017 set a condition: Firefish first only if
its API can read a candidate's CV file and write a document back. **Firefish's
API fails that condition.**

- **Firefish** can upload a document to a candidate [V].
- **It cannot read one back.**
  - None of its 101 documented requests downloads a candidate document or CV [V].
  - The candidate profile has only a `HasCv` true/false flag [V].
  - Its docs say: *"Where the documentation is silent, no additional capability
    should be presumed"* [V].
- **It has no in-CRM trigger:** no webhooks and no button or extension mechanism are documented [V].
- **It cannot fill the Formatted CV slot.** The upload types are only `CV`, `InterviewNotes` and `Other` [V].
  - Firefish's "Send CVs" step attaches the *formatted* CV by default [V].
  - So a Venditas document written back as `CV` would not be the one sent to the client [I].

**JobAdder does all three steps, with endpoints built for this [V]:**
1. Lists and downloads a candidate's `Resume` attachment.
2. Uploads the result as a `FormattedResume` attachment.
3. Puts a Venditas button on the candidate record through Partner Actions.

**What would change the order:**

1. **Firefish says it will add a document download endpoint and a Formatted CV
   upload type.** Firefish goes back to first. It has fewer competitors
   (no formatting partner listed) and more UK agencies, and it promotes its
   partners.
2. **JobAdder turns down the developer account or the app, or ships its own
   formatter.** Its terms let it revoke access for anything that "may in the
   reasonable opinion of JobAdder compete" [V]. Tracker is next only if a paying
   agency uses Tracker. Its API reads and writes candidate documents and is open
   to all Tracker customers [V].
3. **A paying agency uses a particular CRM.** Build for that CRM. One agency
   actually using an integration is worth more than any ranking here.

**Top blockers for JobAdder:**
- **Approval** of both the developer account and the app. No criteria or timeline is published [V].
- **Three formatting tools already listed:** CVFormatter, Allsorter and CV-Transformer [V].
- **Non-compete and termination terms** that let JobAdder end access at will [V].

---

## Firefish

### What exists

| Item | Detail | Tag |
|---|---|---|
| Developer docs | `https://developer.firefishsoftware.com` (Postman Documenter), linked from the partner page | [V] |
| Base URL | `https://api.firefishsoftware.com` | [V] |
| Auth | OAuth 2.0 **client credentials**. `POST /authorization/token` with `grant_type=client_credentials`, `client_id`, `client_secret` and space-separated `scope`. Tokens last about 10 minutes (`expires_in: 599`). Server-to-server only | [V] |
| Who creates credentials | An agency **Super User**, under Settings → Integrations → Custom API. Scopes are ticked per profile. Editing a profile issues new credentials and breaks the old ones | [V] |
| Scopes | `candidatesAPI-read`, `candidatesAPI-write`, `contactsAPI-read/-write`, `companiesAPI-read/-write`, `jobsAPI-read/-write`, `placementdetailsAPI-read/-write`, `actionsAPI-read`, `advertsAPI-read`, `commsAPI-readWrite`, `usersAPI-read`, `leadsAPI-readWrite` | [V] |
| Marketplace partners | Build with Custom API credentials first. After being "reviewed and accepted into the Firefish Marketplace", switch to credentials from the marketplace's integration entry, with a predefined "behaviour" scope (for example `commsBehaviourAPI-readWrite`) | [V] |
| Predefined behaviours | Only three: Pay & Bill, Communications, Marketing. None covers document processing | [V] |
| Rate limits | Per endpoint: 10 requests a second, 200 a minute, 3,000 an hour. Token endpoint: **10 a minute and 30 an hour per IP address, and separately per `client_id`**. Handle 429 and honour `Retry-After`. Enforced from 12 October 2026 | [V] |
| Sandbox | Sample responses mention an "API Sandbox" database. No way for a partner to get one is documented | [V] |
| Webhooks | Not documented. Each partner behaviour says Firefish "will only provide data and actions on request", so partners poll | [V] |
| In-app button or extension | Not documented | [V] |

### The three steps

| Step | Endpoint | Tag |
|---|---|---|
| (a) Find a candidate | `GET /api/v1.0/candidates/search`: LIKE match on string parameters, two-character minimum. With no parameters it returns candidates changed in the last 7 days. Capped at 1,000, paginated with `Page` and `Page-Size`. Then `GET /api/v1.0/candidates/{CandidateRef}`, which returns `HasCv`, `HasFormattedCv` and `CandidateURL` | [V] |
| (b) Download the CV file | **No endpoint documented.** Nothing in the collection returns document bytes or a document URL | [V] |
| (c) Upload a document | `POST /api/v1.0/candidates/{candidateRef}/documents`, multipart. `type` = `CV` \| `InterviewNotes` \| `Other`; file in `files`. `CV` accepts .docx .doc .rtf .pdf .tif, up to 10 MB. Scope `candidatesAPI-write` | [V] |
| (d) Trigger from inside Firefish | None documented | [V] |

**What a Firefish integration could do today** [I]: half the job. A recruiter
still exports the CV and drops it into Venditas. Venditas then writes the
result back to the candidate found by name or email, as type `CV`. That saves
the download and re-attach step only. The file lands in the original-CV slot,
not the Formatted CV slot that "Send CVs" uses. Not worth building before a
partner conversation.

**Token limit risk on Vercel** [I]: 30 token requests an hour *per IP*.
Vercel's outbound IPs are shared and change. Each agency needs a new token
about every 10 minutes while active, so a handful of agencies working at once
could hit the per-IP cap. Ask Firefish before building.

### Partner programme and terms

- **Cost:** "We don't charge partnership fees to join our marketplace" [V].
- **Partners get:** a dedicated contact, co-marketing, and launch to Firefish's users [V].
- **How to apply:** the docs link to an enquiries page (`/about-us/product-inquiries`), which now returns 404 [V]. The partner page is `/integration/partner-with-us` [V].
- **Security review, insurance, UK entity, timeline:** none of it is published [V].
- **API terms** ([firefishsoftware.com/api-terms](https://www.firefishsoftware.com/api-terms)), as read on the page [V]. Clause numbers came through a summariser, so check them before quoting.
  - Prohibits using the API "to create a competing product" (3.2).
  - Data may only be used "to facilitate your use of the API" (4.5).
  - Report an attack within 24 hours (9.3).
  - The API user is treated as a data controller (9.1–9.2).
    - This clashes with Venditas acting as the agency's processor [I].
  - Delete personal data on termination (13.3).
  - Either side may end the agreement with 3 months' notice (13.1).
  - Scottish law (14.1).

### How good the native formatted CV is

From Firefish's help article *Creating a Formatted CV* [V]:

- **Template:**
  - A Super User uploads the agency's own **Word template** to the Document Library.
  - They add **merge fields**: candidate details, branding, profile picture and compliance fields.
- **Result:** "Create Formatted CV" builds a new document with:
  - the header and footer from the template;
  - "the main body content from both your formatted CV and the candidate's original CV";
  - "All font styles will be pulled from the original CV document".
- **Editing:** the recruiter edits it in an in-browser editor, and it is saved to the candidate record as **PDF**. The 2021 launch post said Word or PDF export.
- **PDF originals:** Firefish warns that formatting from a PDF original "cannot guarantee consistency".
- **Default attachment:** it is what "Send CVs to a Job" attaches: "If your Candidate has no Formatted CV attached to their record, no CV will be attached" [V].
- **Redaction:** the article never mentions removing contact details or anonymising [V].
  - The body is the candidate's own CV, so contact details in it carry through unless the recruiter deletes them by hand [I].

**So:** Firefish agencies already have a template-based formatted CV built in. What
Venditas adds is a rebuilt, consistent layout that works from PDFs, and
redaction that is checked before the file is returned [I]. A customer asked
Firefish for a CV-Transformer integration in June 2025. It had 1 vote, "Open for
Voting", and no Firefish reply [V].

---

## JobAdder

### Account, approval and auth

| Item | Detail | Tag |
|---|---|---|
| Developer portal | `https://developers.jobadder.com` (register), API reference at `https://api.jobadder.com/v2/docs`, spec at `/v2/openapi.json`. Help: `jobadderapi.zendesk.com`, `api@jobadder.com` | [V] |
| Signup form | First and last name, email, phone, company name, company website, integration type, a short description of the integration. You must accept the API Terms. It asks for no country, ABN or company number | [V] |
| Approval | Two steps. The developer account is approved, then an emailed activation link. Then each registered **application** is approved before its client ID and secret appear. "Accessibility will be determined based on the information provided", and access is limited to "specific areas of the JobAdder API" | [V] |
| Timeline | Not published | [V] |
| Test and live | Separate applications are allowed, each with its own credentials | [V] |
| Sandbox | A Sandbox instance exists (release notes: "Sandbox: Apply security and stability updates"). How a partner gets a sandbox account is not documented | [V] |
| OAuth | Authorization code flow. Authorize at `https://id.jobadder.com/connect/authorize`, token at `https://id.jobadder.com/connect/token` (server side only). The code lasts 5 minutes and works once. Access token lasts 60 minutes. A refresh token comes only with `offline_access`, and **expires after 2 weeks unused**. The token response includes `api` (the base URL to use), `instance` and `account` | [V] |
| Who can connect | Only JobAdder admins, or users with the "Grant API access to Integration partners" permission. If that user is deleted, refresh fails with `invalid_grant` and the agency must reconnect | [V] |
| Scopes to request | `read_candidate write_candidate partner_ui_action offline_access`. JobAdder says to avoid the general `read` and `write` | [V] |
| Regions | Release notes name the instances AU1–AU6, EU1–EU3, US1–US2, CA1 and Sandbox. Always call the `api` URL from the token response | [V] |
| Which region a UK agency is on | Not documented. Probably an EU instance | [I] |
| Rate limits | Throttled per JobAdder account: 429 with `Retry-After` in seconds. No numbers published | [V] |
| Fees | None published on the partner page, the signup form or the API terms | [V] |

### Endpoints for the flow

All under the `api` base URL (`https://api.jobadder.com/v2`) [V].

| Step | Endpoint | Tag |
|---|---|---|
| Find a candidate | `GET /candidates` (search), `GET /candidates/{candidateId}`, or `GET /candidates?partnerAction.stage=submitted` | [V] |
| List attachments | `GET /candidates/{candidateId}/attachments`. Query: `Type` (array), `Category`, `Latest` (boolean), `Offset`, `Limit` (up to 1,000). Returns `attachmentId`, `type`, `category`, `fileName`, `fileType`, `createdAt`. Scope `read_candidate` | [V] |
| Download | `GET /candidates/{candidateId}/attachments/{attachmentId}`. "Setting the Accept header will attempt a file conversion" | [V] |
| Upload | `POST /candidates/{candidateId}/attachments/{attachmentType}`, multipart, one field `fileData`, 201 on success. Types: `Other`, `Resume`, `CoverLetter`, **`FormattedResume`**, `Screening`, `Check`, `Reference`, `License`. Scope `write_candidate` | [V] |
| Relabel an attachment | `PUT /candidates/{candidateId}/attachments/{attachmentId}` with `type`, `category`, `expiry` | [V] |
| Job applications | The same four operations under `/applications/{applicationId}/attachments` | [V] |
| File types | Allowlist includes doc, docx, pdf, rtf, odt and txt. Anything else returns 422 | [V] |

### Partner Action Button

Source: help article *Partner Action Button Integration*, plus the spec [V].

**Creating the button**
- **Endpoint:** `POST /partners/actions/Candidate`, scope `partner_ui_action`.
- **Body fields:**
  - `actionName`: up to 100 characters.
  - `reference`
  - `url`: up to 500 characters, with template variables such as `{candidateId}` and `{userId}`.
  - `urlType`: `Popup`, `Page` or `SideDrawer`.
  - `allowResubmit`
  - `actionFilter`: `adminOnly`, or which candidate statuses see the button.
  - `salt`: up to 20 characters.
  - `webhookData`
- **Scope of a button:** the whole agency account, not one user.
- **Where it shows:** as a sub-menu under a parent menu JobAdder creates, about 5 minutes after creation.
- **How many:** JobAdder recommends 10 at most.

**When the button has a URL (Popup, Page or SideDrawer)**
- **Selection:** one record at a time.
- **How JobAdder calls Venditas:**
  - It opens the URL with `_exp` (expiry, 5 minutes) and `_h` appended.
  - `_h` = SHA-256 of the URL with its query keys sorted and `_exp` included, with the salt bytes appended.
  - The hash is Base64 with padding removed, `+`→`-` and `/`→`_`.
- **What Venditas must do:** recompute the hash, and reject if it doesn't match or has expired.
- **Framing:** the popup loads in an iframe, so the page must allow being framed.
- **Knowing which agency clicked:** JobAdder's own tip is to put your account ID in the URL when the button is created.

**When the button has no URL**
- **Selection:** several records at once; the user just sees a "submitted" notice.
- **How Venditas finds the work:** it must poll `GET /partners/actions/{actionId}/candidates?Stage=Submitted`, or subscribe to the `candidate_partner_action` webhook.

**Stages and results**
- **Stages:** `Submitted` → `InProgress` → `Completed`, `Rejected` or `Cancelled`.
- **Updating a stage:** `PUT /partners/actions/{actionId}/candidates/{candidateId}/progress`, `/complete` or `/reject`.
  - Body: `status` (up to 100 characters), plus an optional `result` with `score`, `url` and `urlType`.
  - Agencies see these in a Results column they can switch on.

**Housekeeping**
- **On disconnect:** delete the buttons and webhooks, then the tokens.
- **On reconnect:** creating a button with the same reference or name returns an error.

### Webhooks

- **Setup:** `POST /webhooks` with `name`, `events`, `url`, and an optional `authorization` header value. Needs `offline_access` [V].
- **Relevant event:** `candidate_partner_action`, with scopes `read_candidate` + `partner_ui_action` [V].
- **Delivery rules** [V]:
  - Delivered as an HTTP POST with `x-jobadder-webhookid`.
  - Retried every 5 minutes, with a 100-second timeout.
  - **Suspended after 10 failures in an hour.** Events are then lost until the webhook is re-enabled through the API.
  - Order is not guaranteed, and duplicates can arrive.

### The minimal flow

Every step is [I], built from the [V] pieces above. This design needs no queue
and stores no candidate data, which keeps decision 006 true.

1. **Connect.** An agency admin clicks "Connect JobAdder" in Venditas and completes OAuth.
   - Store the refresh token encrypted, with `instance`, `account` and the `api` URL. No candidate data is stored.
2. **Create the button.** Venditas calls `POST /partners/actions/Candidate`:
   - `actionName`: "Format and redact CV";
   - `urlType`: `SideDrawer`;
   - `url`: `https://venditas.in/jobadder/format?candidateId={candidateId}&a={venditasAccountId}`;
   - a `salt`.
3. **Handle a click.** A recruiter clicks it on a candidate. The side drawer loads, and the server:
   1. checks `_h` and `_exp`;
   2. refreshes the access token;
   3. calls `GET …/attachments?Type=Resume&Latest=true`;
   4. downloads the file;
   5. runs the existing extract → render → redaction check → coverage check;
   6. uploads the result with `POST …/attachments/FormattedResume`;
   7. calls `PUT …/complete`, with `result.url` pointing at a Venditas status page.
4. **Show the result.** The drawer reports success, or the redaction block, in the same words as the upload page.
5. **Keep tokens alive.** A daily cron refreshes each refresh token before its 2-week expiry. The response carries a new refresh token each time.
6. **Disconnect.** Delete the button, then drop the tokens.

This fits inside the current 60-second `maxDuration` of `/api/format`, since
extraction is about 10 seconds [I].

### API terms that could bite

From [jobadder.com/api-terms](https://jobadder.com/api-terms/), read on the
page [V]. Clause numbers came through a summariser, so check them before
quoting.

- **Approval (2.1):** "not publish or make available any Partner Services until they have been approved in writing by JobAdder". The API may only be used for Partner Services JobAdder has approved in writing.
- **Non-compete (2.2):** no building "a product or service which competes with, or may in the reasonable opinion of JobAdder compete with, any product, service or business of JobAdder".
  - JobAdder has no native formatter today [V, `research/growth-2026-09.md` §1] and lists three formatting partners [V], so the risk now is low [I].
  - If JobAdder ships AI formatting, this clause lets it cut Venditas off [I].
- **JobAdder can compete with you:** the agreement "shall not prevent JobAdder from … allowing third parties to develop … products … which may be similar to or compete with You".
- **Indemnity:** Venditas indemnifies JobAdder for all claims "arising out of or in connection with Your use of the JobAdder API". JobAdder excludes consequential loss (7.3).
- **Data:**
  - Use it only for the approved Partner Services, and keep it secure.
  - Delete or return it when an agency asks.
  - Publish a privacy policy URL when registering the app.
  - Both parties must report data breaches.
- **Control and termination:** JobAdder "can revoke or change an API Partner … level of access, at any time and for any reason", and may terminate "at any time without cause" (8.1). It may rate-limit at its sole discretion.
- **Governing law:** New South Wales, Australia (9.6).
- **Who can sign:** "API Partner" means "a natural or legal person" [V], so a sole trader is not ruled out on the page [I]. Nothing on entity type or country was found [V].

### Formatting competitors already listed

- **CVFormatter:** "One-click resume formatting from JobAdder"; files are viewed, edited and downloaded inside JobAdder [V].
- **Allsorter:** send resumes from the Candidates grid; "import the formatted resume back into JobAdder, and it'll display on the candidate's record" [V].
- **CV-Transformer:** "saved straight back to JobAdder with a single click"; links added in both systems [V].
- **Anonymisation:** none of the three listing pages mentions it [V]. CV-Transformer does sell anonymising outside JobAdder [2H, from Firefish's UserVoice post].

---

## Other CRMs

One line each: can a third party read and write candidate documents for free?

- **Tracker:** Yes, as documented.
  - Open API "available immediately to all Tracker customers" [V].
  - Auth: OAuth2, then a JWT exchange [V].
  - Endpoints [V]:
    - `GET /api/v1/Resource/{id}/Documents`;
    - `GET /api/v1/Resource/{resourceId}/Document/{documentId}` (the physical file);
    - `POST /api/v1/Resource/AttachDocument` (base64, `documentType` e.g. resume).
  - Webhooks, 600 requests a minute [V].
  - Partner fees and how to get an OAuth client are not stated; contact `trackerapi@tracker-rms.com` [V].
  - UK share unknown.
- **Itris:** "open API and Webhooks" [V]. Document endpoints, fees and partner terms not published; partner form only [V].
- **Recruit CRM:** API token requires the **Business Plan**, 60 requests a minute per token [V]. File endpoints not checked, because its docs load in the browser. It already has built-in branded CVs with contact removal [V], so there is little for Venditas to add.
- **Manatal:**
  - Token from `support@manatal.com`; base `https://api.manatal.com/open/v3` [V].
  - `GET /candidates/{candidate_pk}/resume/` returns the resume converted to PDF [V].
  - `POST /candidates/{candidate_pk}/attachments/` takes a **file URL**, not bytes [V]. So Venditas would have to host the output, which runs against 006 [I].
  - Plan requirement not stated. Has built-in logo and watermark branding [V].
- **Loxo:**
  - Bearer token from Settings → API Keys [V].
  - `GET /{agency_slug}/people/{person_id}/resumes/{resume_id}/download` and `POST /{agency_slug}/people/{person_id}/documents` (multipart) [V].
  - Plan requirement not stated. Has formatting and redaction built in [V], and about 32 UK sites [2H].
- **Vincere:** API keys "only issued to partners with a formal agreement" [V]. The Access Group owns it and also owns HireAra [V], so a partnership is unlikely [I].

---

## Effort estimate

All figures are **[I]**, in developer-days of focused work. Approval waits are
not included; JobAdder publishes no timeline.

### JobAdder, minimal version (the flow above): about 9–11 days

| Work | Days |
|---|---|
| Move the body of `app/api/format/route.js` into a function the route and the integration share (extract, render, redaction check, coverage). Keep the route's behaviour identical | 1 |
| OAuth connect and callback, encrypted token storage per agency account, refresh with rotation, daily cron against the 2-week expiry, handle `invalid_grant` and reconnect | 2 |
| Create and delete the button, verify `_h`/`_exp`, allow framing from JobAdder only (`frame-ancestors`), disconnect clean-up | 1 |
| The side-drawer page: list Resume attachments, download, format, upload `FormattedResume`, mark complete or rejected, show the same error wording as the upload page | 2 |
| Branding per JobAdder account (name, colour, logo), stored on the server, because the drawer cannot see branding saved in the browser | 1 |
| Metering and trial limits keyed to the connected account instead of email and IP | 1 |
| 401, 429 `Retry-After` and 422 handling; end-to-end test on a sandbox account | 1–2 |
| Privacy policy, DPA and Article 30 record updates for JobAdder data; listing copy | 0.5–1 |

**Branding decision needed:** the pricing page currently says branding is
"saved in the browser, so nothing about the agency is stored on a server". A
CRM integration needs the agency's branding stored on the server. That is
agency data, not candidate data, but the pricing page wording has to change.
Record it as a decision when it is built.

### Firefish

- **Write-back only**, as described above: about 4–5 days. Not recommended; it saves one step and writes to the wrong slot.
- **Full integration:** cannot be estimated until Firefish offers a document download and some trigger.

---

## Open questions only a partner conversation can answer

**Firefish**
1. Is there an undocumented or planned endpoint to download a candidate's CV
   or Formatted CV file? Without one, no automated integration is possible.
2. Can `POST …/documents` accept a Formatted CV type, so the output lands where
   "Send CVs" picks it up?
3. Is there, or will there be, a partner trigger inside Firefish: a button, an
   extension or a webhook? Would Firefish define a document-processing
   "behaviour"?
4. What does the marketplace review involve: security questionnaire, pen test,
   insurance, UK entity, DPA? How long does it take?
5. How does the 30-an-hour per-IP token limit apply to a serverless host whose
   outbound IPs are shared?
6. Does the native formatted CV remove contact details, and which plans
   include it?
7. Terms 9.1–9.2 treat the API user as controller, but Venditas processes for
   the agency. Will Firefish accept a processor role?
8. Is there a sandbox database for partners?

**JobAdder**
1. What are the approval criteria and typical timeline for the developer
   account and the app? Does being an Indian sole trader matter?
2. What does a marketplace listing require (demo, support commitments, security
   review), and does it cost anything?
3. How does a partner get a Sandbox account?
4. Which instance are UK agencies on? Do UK agencies expect data to stay in the
   UK or EU?
5. What are the actual throttling limits per account?
6. Will JobAdder confirm in writing that CV formatting and redaction do not
   "compete" under 2.2? Is a native formatter on its roadmap?
7. Is a `FormattedResume` attachment used by default when a recruiter submits a
   candidate to a client?
8. Can the download endpoint's `Accept` header conversion turn .doc into .docx
   or PDF reliably?

---

## Sources

**Firefish**
- API documentation (Postman collection): https://developer.firefishsoftware.com/ — collection JSON at `https://developer.firefishsoftware.com/api/collections/25381032/2sA2xcaEyw`
- Custom API settings: https://fishtank.firefishsoftware.com/custom-api-settings
- Creating a Formatted CV: https://fishtank.firefishsoftware.com/enrich-packages/recruiter-summary-ai-creating-a-formatted-cv
- Sending CVs to a Job: https://fishtank.firefishsoftware.com/enrich-packages/sending-cvs-to-a-job
- Formatted CV launch post: https://www.firefishsoftware.com/news/formatted-cv
- Partner programme: https://www.firefishsoftware.com/integration/partner-with-us
- API terms: https://www.firefishsoftware.com/api-terms
- Customer request: https://firefishsoftware.uservoice.com/forums/194828-firefish-customer-ideas/suggestions/50069292-integration-with-cv-transformer

**JobAdder**
- API reference: https://api.jobadder.com/v2/docs · spec: https://api.jobadder.com/v2/openapi.json
- Developer registration: https://developers.jobadder.com/register
- Developer Account Applications: https://jobadderapi.zendesk.com/hc/en-us/articles/360023091673-Developer-Account-Applications
- OAuth2 Authentication: https://jobadderapi.zendesk.com/hc/en-us/articles/360022196774-OAuth2-Authentication
- Partner Action Button Integration: https://jobadderapi.zendesk.com/hc/en-us/articles/360022289514-Partner-Action-Button-Integration
- Partner Action Security Hashed URL: https://jobadderapi.zendesk.com/hc/en-us/articles/14042921159823-Partner-Action-Security-Hashed-URL
- Partner Tech Integration: https://jobadderapi.zendesk.com/hc/en-us/articles/7040444063503-Partner-Tech-Integration
- Webhooks: https://jobadderapi.zendesk.com/hc/en-us/articles/360022511513-Webhooks
- API Throttling: https://jobadderapi.zendesk.com/hc/en-us/articles/4410850130713-API-Throttling
- Attachment file types: https://jobadderapi.zendesk.com/hc/en-us/articles/4407420419353-Attachments-File-Type-restrictions
- API terms: https://jobadder.com/api-terms/
- Partnership request: https://jobadder.com/partnership-request/
- Listings: https://jobadder.com/integration/cv-formatter/ · https://jobadder.com/integration/allsorter/ · https://jobadder.com/integration/cv-transformer/

**Others**
- Tracker API: https://evoglapi.tracker-rms.com/swagger/index.html · announcement: https://www.tracker-rms.com/press-releases/tracker-open-api-recruitment-agencies-control/
- Itris partners: https://www.itris.co.uk/partners/
- Recruit CRM API: https://docs.recruitcrm.io/
- Manatal Open API: https://developers.manatal.com/reference/getting-started · https://developers.manatal.com/reference/candidates_attachments_create
- Loxo API: https://loxo.readme.io/reference/person_documentscreate · https://loxo.readme.io/reference/resumesdownload
- Vincere API keys: http://help.vincere.io/en/articles/9618701-understanding-and-requesting-api-keys
