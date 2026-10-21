# CreatorConnect — Requirements

This document describes the requirements that the two implemented modules must
satisfy. It is the source of truth against which the automated tests, the
manual test cases and the JIRA issues are written.

---

## 1. Functional requirements

### 1.1 Module A — Profile Management

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-A-01 | The system shall store a profile with a unique identifier, display name, email, account type, industry, bio, skills, optional portfolio URL, optional social links, and created/updated timestamps. | Must |
| FR-A-02 | The system shall allow a user to create a new profile. | Must |
| FR-A-03 | The system shall allow a user to view the complete details of a single profile. | Must |
| FR-A-04 | The system shall allow a user to edit an existing profile. | Must |
| FR-A-05 | The system shall allow a user to delete a profile, after the user has confirmed the action. | Must |
| FR-A-06 | The system shall allow a user to list all existing profiles. | Must |
| FR-A-07 | The system shall persist profiles in SQLite so that they survive an application restart. | Must |
| FR-A-08 | The system shall be seeded with several realistic demo profiles for demonstration purposes. | Should |
| FR-A-09 | The account type of a profile shall be one of `CREATOR`, `BRAND` or `BUSINESS`. | Must |
| FR-A-10 | The system shall reject a display name that is empty or contains only whitespace. | Must |
| FR-A-11 | The system shall reject an email that is not in a valid email format. | Must |
| FR-A-12 | The system shall reject a create or update request that uses an email already used by another profile. | Must |
| FR-A-13 | The system shall reject a profile whose portfolio URL is not a valid `http` or `https` URL, when one is supplied. | Must |
| FR-A-14 | The system shall return a not-found response when a requested profile does not exist. | Must |
| FR-A-15 | The system shall return a conflict response when a create or update request duplicates an existing email. | Must |
| FR-A-16 | The frontend shall display a useful, field-level validation message next to each invalid field. | Must |
| FR-A-17 | The frontend shall ask the user to confirm before deleting a profile. | Must |
| FR-A-18 | The frontend shall display the updated details of a profile immediately after a successful edit. | Must |

### 1.2 Module B — Creator/Brand Discovery and Search

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-B-01 | The system shall provide a discovery page that displays profiles as responsive cards. | Must |
| FR-B-02 | The system shall search profiles by keyword across the display name, the bio and the skills. | Must |
| FR-B-03 | The system shall match the search keyword regardless of letter case. | Must |
| FR-B-04 | The system shall filter profiles by account type. | Must |
| FR-B-05 | The system shall filter profiles by industry. | Must |
| FR-B-06 | The system shall allow a search term and one or more filters to be combined. | Must |
| FR-B-07 | The system shall clear every search term and filter when the user activates Reset. | Must |
| FR-B-08 | The system shall let the user open the complete details of a profile from the discovery page. | Must |
| FR-B-09 | The system shall show a friendly empty state when no profile matches the current criteria. | Must |
| FR-B-10 | The system shall show a loading state while a request is in flight. | Must |
| FR-B-11 | The system shall show an error state, with a way to retry, when a request fails. | Must |
| FR-B-12 | Search and filter results shall be produced by the database, not by a hardcoded list in the frontend. | Must |

---

## 2. Non-functional requirements

| ID | Requirement | Category |
| --- | --- | --- |
| NFR-01 | The frontend shall be built with Next.js (App Router), TypeScript and Tailwind CSS. | Technology |
| NFR-02 | The backend shall be built with Node.js, Express.js and TypeScript. | Technology |
| NFR-03 | The database shall be SQLite, accessed through the Prisma ORM. | Technology |
| NFR-04 | All request input shall be validated with Zod on the server. | Quality |
| NFR-05 | The frontend shall mirror the server validation rules so that invalid input is reported before a request is sent. | Quality |
| NFR-06 | The API shall return correct HTTP status codes (200, 201, 400, 404, 409, 422, 500). | Quality |
| NFR-07 | The API shall use a single, consistent JSON envelope for both success and failure responses. | Quality |
| NFR-08 | Errors shall be handled by a single centralised error handler. | Quality |
| NFR-09 | Configuration shall be read from environment variables rather than hardcoded values. | Quality |
| NFR-10 | The backend shall allow cross-origin requests from the local frontend origin. | Quality |
| NFR-11 | The frontend shall be usable on desktop and on mobile screen sizes. | Usability |
| NFR-12 | Every form control shall have an associated, programmatically linked label. | Accessibility |
| NFR-13 | Interactive elements shall be reachable and operable by keyboard. | Accessibility |
| NFR-14 | Colour contrast shall meet WCAG AA for text on its background. | Accessibility |
| NFR-15 | The automated test suite shall cover every scenario listed in `docs/test-cases.md` that can be automated. | Testability |
| NFR-16 | The automated tests shall run against an isolated database and shall not modify the demo data. | Testability |
| NFR-17 | The application shall be runnable locally with a single command and without Docker, paid services or external APIs. | Operability |
| NFR-18 | The project shall be documented so that a new developer can install, run, test and extend it. | Maintainability |
| NFR-19 | The code shall pass TypeScript strict type checking and ESLint without errors. | Maintainability |
| NFR-20 | The system shall not store or expose passwords; authentication is out of scope. | Security |

---

## 3. User stories

### Module A — Profile Management

**US-A-01 — Create a profile**
> As a creator, I want to publish my profile so that brands and collaborators can find me.
>
> *Acceptance criteria*
> - I can open "Create profile" from the navigation bar.
> - The form asks for display name, email, account type, industry, bio, skills, and optionally a portfolio URL and social links.
> - I cannot submit the form while a required field is empty, whitespace only, or contains an invalid email or URL; each invalid field shows a message next to it.
> - After a successful submit I am taken to my new profile and the profile is stored in the database.

**US-A-02 — View a profile**
> As a visitor, I want to open a profile and see everything about it.
>
> *Acceptance criteria*
> - The detail view shows the display name, account type, industry, email, bio, skills, links, and the created and updated dates.
> - Opening a profile that does not exist shows a "profile not found" message rather than a blank page.

**US-A-03 — Edit a profile**
> As a creator, I want to correct my profile details.
>
> *Acceptance criteria*
> - The edit form is pre-filled with the current values.
> - Saving persists the changes and the updated details appear immediately, without a manual reload.
> - Saving an email that already belongs to another profile shows a conflict message on the email field.

**US-A-04 — Delete a profile**
> As a creator, I want to remove my profile.
>
> *Acceptance criteria*
> - Clicking Delete opens a confirmation dialog naming the profile.
> - The profile is only removed once the deletion is confirmed.
> - Cancelling the dialog leaves the profile untouched.

**US-A-05 — Browse profiles**
> As an administrator, I want to list all profiles.
>
> *Acceptance criteria*
> - The API returns every profile with its full details.
> - The list is ordered newest first.

### Module B — Discovery and Search

**US-B-01 — Discover profiles**
> As a visitor, I want to browse a directory of creators, brands and businesses.
>
> *Acceptance criteria*
> - The discovery page shows the profiles as responsive cards.
> - Each card shows the name, industry, account type, a short bio and the skills.
> - The layout adapts from a single column on a phone to three columns on a wide screen.

**US-B-02 — Search**
> As a visitor, I want to search for someone by name, by what they write about, or by their skills.
>
> *Acceptance criteria*
> - Typing a keyword narrows the results.
> - The keyword is matched against the display name, the bio and the skills.
> - The keyword matches regardless of the case I type it in.

**US-B-03 — Filter**
> As a visitor, I want to narrow the directory by account type and by industry.
>
> *Acceptance criteria*
> - Selecting an account type shows only profiles of that type.
> - Selecting an industry shows only profiles in that industry.
> - A search term and filters can be used together.

**US-B-04 — Reset**
> As a visitor, I want to clear my search and filters in one action.
>
> *Acceptance criteria*
> - After Reset, the search box is empty, both filters are back to "All …", and the full list is shown again.

**US-B-05 — Understand an empty result**
> As a visitor, I want to know when nothing matches.
>
> *Acceptance criteria*
> - A friendly empty state is shown, explaining that nothing matched.
> - A shortcut to clear the search and filters is offered.

**US-B-06 — Recover from an error**
> As a visitor, I want to know when the directory could not be loaded.
>
> *Acceptance criteria*
> - An error message is shown instead of an empty page.
> - A "Try again" control re-issues the request.

---

## 4. Acceptance criteria for the modules

### 4.1 Module A

| # | Criterion | Verified by |
| --- | --- | --- |
| AC-A-01 | A valid create request returns `201` and the persisted profile. | `TC-A-01`, `tests/profiles.test.ts` |
| AC-A-02 | A create request missing required fields returns `422` and a message per missing field. | `TC-A-02`, `tests/profiles.test.ts` |
| AC-A-03 | A create request with an invalid email returns `422`. | `TC-A-03`, `tests/profiles.test.ts` |
| AC-A-04 | A create request with an email that already exists returns `409`. | `TC-A-04`, `tests/profiles.test.ts` |
| AC-A-05 | A create request with an account type outside the permitted set returns `422`. | `TC-A-05`, `tests/profiles.test.ts` |
| AC-A-06 | A create request with a portfolio URL that is not a valid http/https URL returns `422`. | `TC-A-06`, `tests/profiles.test.ts` |
| AC-A-07 | A whitespace-only display name is rejected. | `TC-A-07`, `tests/profiles.test.ts` |
| AC-A-08 | `GET /api/profiles` returns every profile. | `TC-A-08`, `tests/profiles.test.ts` |
| AC-A-09 | `GET /api/profiles/:id` returns the complete profile. | `TC-A-09`, `tests/profiles.test.ts` |
| AC-A-10 | `GET /api/profiles/:id` for an unknown id returns `404`. | `TC-A-10`, `tests/profiles.test.ts` |
| AC-A-11 | `PUT /api/profiles/:id` persists the changes and updates `updatedAt`. | `TC-A-11`, `tests/profiles.test.ts` |
| AC-A-12 | `DELETE /api/profiles/:id` removes the profile; a later GET returns `404`. | `TC-A-12`, `tests/profiles.test.ts` |
| AC-A-13 | The delete confirmation dialog appears and no deletion happens until it is confirmed. | `TC-A-13`, `tests/ProfileDetail.test.tsx` |
| AC-A-14 | The frontend shows a field-level message for every invalid field. | `TC-A-14`, `tests/ProfileForm.test.tsx` |
| AC-A-15 | After a successful edit the new details are displayed without a reload. | `TC-A-15`, `tests/ProfileDetail.test.tsx` |

### 4.2 Module B

| # | Criterion | Verified by |
| --- | --- | --- |
| AC-B-01 | The discovery page renders a card per profile returned by the API. | `TC-B-01`, `tests/DiscoveryBrowser.test.tsx` |
| AC-B-02 | A keyword matches the display name, the bio and the skills. | `TC-B-02`, `tests/search.test.ts` |
| AC-B-03 | A keyword matches regardless of case. | `TC-B-03`, `tests/search.test.ts` |
| AC-B-04 | The account-type filter returns only profiles of that type. | `TC-B-04`, `tests/search.test.ts` |
| AC-B-05 | The industry filter returns only profiles in that industry. | `TC-B-05`, `tests/search.test.ts` |
| AC-B-06 | A keyword and the filters can be combined. | `TC-B-06`, `tests/search.test.ts` |
| AC-B-07 | Reset clears every search term and filter and restores the full listing. | `TC-B-07`, `tests/DiscoveryBrowser.test.tsx` |
| AC-B-08 | A search with no matches shows the empty state. | `TC-B-08`, `tests/search.test.ts` |
| AC-B-09 | A failing request shows the error state with a retry control. | `TC-B-09`, `tests/DiscoveryBrowser.test.tsx` |
| AC-B-10 | Search and filters are sent to the API rather than applied to a hardcoded list. | `TC-B-10`, `tests/DiscoveryBrowser.test.tsx` |
