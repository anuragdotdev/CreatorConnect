# CreatorConnect — Suggested JIRA Plan

This document contains the issues that are **suggested** for the CreatorConnect
project. Nothing here has been created in JIRA — the project board is managed
manually by the student, who creates the issues themselves using the content
below.

---

## 1. Project setup

| Setting | Value |
| --- | --- |
| Project key (suggested) | `CC` |
| Project name | CreatorConnect |
| Project type | Software (Scrum or Kanban) |
| Lead | The student (project owner) |
| Default issue type for work items | Task |
| Default issue type for the three defects | Bug |
| Labels (suggested) | `module-profile-management`, `module-discovery-search`, `backend`, `frontend`, `database`, `documentation` |

### Recommended sprints

| Sprint | Content |
| --- | --- |
| Sprint 1 | Project setup, database, and the Profile Management API. |
| Sprint 2 | The Profile Management UI, then the Discovery and Search module. |
| Sprint 3 | Testing, documentation, and the defect demonstration. |

---

## 2. Epics

| Key | Epic | Summary | Sprint |
| --- | --- | --- | --- |
| `CC-1` | Project Setup and Tooling | Repository, toolchain, database and local run configuration. | 1 |
| `CC-2` | Profile Management (Module A) | Create, view, edit, delete and list profiles with full validation. | 1–2 |
| `CC-3` | Discovery and Search (Module B) | Database-backed search, filters and the discovery page. | 2 |
| `CC-4` | Quality, Testing and Documentation | Automated tests, test cases, README and the documentation set. | 3 |

---

## 3. User stories

### Epic `CC-1` — Project Setup and Tooling

| Key | Summary | Story |
| --- | --- | --- |
| `CC-10` | Set up the monorepo skeleton | As a developer, I want the backend and frontend applications in one repository with root-level scripts, so that the whole project can be installed and run with a single command. |
| `CC-11` | Configure the SQLite database | As a developer, I want a Prisma schema and a migration for the Profile model, so that profile data is stored locally and reproducibly. |
| `CC-12` | Add demo seed data | As a demonstrator, I want several realistic profiles seeded into the database, so that the discovery page is meaningful straight after setup. |
| `CC-13` | Configure the API environment | As a developer, I want the port, database URL and CORS origin read from environment variables, so that the configuration is not hardcoded. |

### Epic `CC-2` — Profile Management (Module A)

| Key | Summary | Story |
| --- | --- | --- |
| `CC-20` | Create a profile | As a creator, I want to publish a profile so that brands and collaborators can find me. |
| `CC-21` | View a profile | As a visitor, I want to open a profile and see all of its details. |
| `CC-22` | Edit a profile | As a creator, I want to correct my profile details. |
| `CC-23` | Delete a profile | As a creator, I want to remove my profile, after confirming the action. |
| `CC-24` | List all profiles | As a visitor, I want to browse the directory of profiles. |
| `CC-25` | Validate profile input | As a user, I want immediate, field-level feedback when I enter invalid details. |

### Epic `CC-3` — Discovery and Search (Module B)

| Key | Summary | Story |
| --- | --- | --- |
| `CC-30` | Display profiles as cards | As a visitor, I want to browse the directory as a responsive card grid. |
| `CC-31` | Search for profiles | As a visitor, I want to search by name, bio or skills. |
| `CC-32` | Filter by account type | As a visitor, I want to narrow the directory to creators, brands or businesses. |
| `CC-33` | Filter by industry | As a visitor, I want to narrow the directory to a specific industry. |
| `CC-34` | Combine search and filters | As a visitor, I want to use a search term and filters together. |
| `CC-35` | Reset the filters | As a visitor, I want to clear my search and filters in one action. |
| `CC-36` | Show empty, loading and error states | As a visitor, I want to understand what the page is showing when there are no results or the request failed. |

### Epic `CC-4` — Quality, Testing and Documentation

| Key | Summary | Story |
| --- | --- | --- |
| `CC-40` | Automate the API tests | As a developer, I want automated tests for the API, so that regressions are caught before they reach a demonstration. |
| `CC-41` | Automate the UI tests | As a developer, I want automated tests for the key frontend behaviour, so that the validation and filter behaviour is protected. |
| `CC-42` | Write the README | As a new developer, I want setup and usage documentation, so that I can run the project without help. |
| `CC-43` | Write the requirements and test cases | As a reviewer, I want the requirements and the test cases, so that the implementation can be assessed against a specification. |
| `CC-44` | Demonstrate the defect workflow | As a student, I want reproducible defects on a separate branch, so that I can demonstrate the defect-tracking workflow in JIRA. |

---

## 4. Tasks and sub-tasks

### `CC-10` — Set up the monorepo skeleton

| Type | Summary | Done when |
| --- | --- | --- |
| Task | Create the `backend/` and `frontend/` applications. | Both directories contain a runnable application. |
| Task | Add a root `package.json` with `setup`, `dev`, `test`, `lint` and `db:*` scripts. | `npm run setup` installs both applications from the root. |
| Task | Add a root `.gitignore` covering `node_modules`, `.next`, `*.db` and `.env`. | `git status` stays clean after a local run. |
| Task | Initialise the Git repository on `main`. | `git log` shows the initial commit on `main`. |
| Task | Add `scripts/dev.mjs` to start both applications together. | `npm run dev` starts the API on :4000 and the UI on :3000. |

### `CC-11` — Configure the SQLite database

| Type | Summary | Done when |
| --- | --- | --- |
| Task | Write the Prisma `Profile` model with all the required fields. | `npx prisma validate` passes. |
| Task | Add the `AccountType` enum (`CREATOR`, `BRAND`, `BUSINESS`). | The enum is enforced by the schema. |
| Task | Add the unique constraint on `email`. | A duplicate email is rejected by the database. |
| Task | Create and apply the initial migration. | `backend/prisma/dev.db` exists and contains the `Profile` table. |
| Task | Add the `DATABASE_URL` environment variable and `.env.example`. | A fresh clone only needs to copy the example file. |

### `CC-12` — Add demo seed data

| Type | Summary | Done when |
| --- | --- | --- |
| Task | Write ten realistic demo profiles covering all three account types and several industries. | `npm run db:seed` inserts 10 rows. |
| Task | Include a profile named "Creator Studio" for the BUG-1 reproduction. | `GET /api/profiles?q=creator` matches it on `main`. |
| Task | Make the seed idempotent (upsert on email). | Running the seed twice leaves 10 rows. |

### `CC-20` — Create a profile

| Type | Summary |
| --- | --- |
| Task | Implement `POST /api/profiles` with Zod body validation. |
| Task | Return `201` with the persisted profile. |
| Task | Return `422` with a per-field message list when the payload is invalid. |
| Task | Return `409` when the email is already in use. |
| Task | Build the "Create profile" page and the shared `ProfileForm` component. |
| Task | Navigate to the new profile's detail view after a successful save. |

### `CC-21` — View a profile

| Type | Summary |
| --- | --- |
| Task | Implement `GET /api/profiles/:id`. |
| Task | Return `404` with a `NOT_FOUND` code for an unknown id. |
| Task | Build the profile detail view showing every field, including the timestamps. |
| Task | Show a "profile not found" state rather than a blank page. |

### `CC-22` — Edit a profile

| Type | Summary |
| --- | --- |
| Task | Implement `PUT /api/profiles/:id`. |
| Task | Update the `updatedAt` timestamp on every write. |
| Task | Reject a duplicate email with `409`. |
| Task | Build the edit page, pre-filled with the current values. |
| Task | Refresh the displayed profile immediately after a successful save. |

### `CC-23` — Delete a profile

| Type | Summary |
| --- | --- |
| Task | Implement `DELETE /api/profiles/:id`. |
| Task | Build the delete confirmation dialog naming the profile. |
| Task | Only delete after the confirmation is accepted. |
| Task | Return to the discovery page after a successful deletion. |

### `CC-24` — List all profiles

| Type | Summary |
| --- | --- |
| Task | Implement `GET /api/profiles` with no query parameters. |
| Task | Order the results newest first. |
| Task | Add `GET /api/profiles/industries` for the industry filter options. |

### `CC-25` — Validate profile input

| Type | Summary |
| --- | --- |
| Task | Define the Zod schema for create and update in `backend/src/schemas/profile.ts`. |
| Task | Reject a whitespace-only display name. |
| Task | Reject an invalid email format. |
| Task | Reject an account type outside the permitted set. |
| Task | Reject a portfolio URL that is not a valid `http`/`https` URL. |
| Task | Mirror the rules in `frontend/lib/validation.ts` for immediate feedback. |
| Task | Render the message for each field next to the field. |
| Task | Map the server's field errors onto the form when a request is rejected. |

### `CC-30` — Display profiles as cards

| Type | Summary |
| --- | --- |
| Task | Build the `ProfileCard` component. |
| Task | Lay the cards out in a responsive grid (1 / 2 / 3 columns). |
| Task | Show the name, industry, account-type badge, bio and skills on each card. |

### `CC-31` — Search for profiles

| Type | Summary |
| --- | --- |
| Task | Implement the `q` query parameter on `GET /api/profiles`. |
| Task | Match the keyword against the display name, the bio and the skills. |
| Task | Make the match case-insensitive. |
| Task | Debounce the keyword in the frontend. |

### `CC-32` — Filter by account type

| Type | Summary |
| --- | --- |
| Task | Implement the `accountType` query parameter. |
| Task | Add the account-type dropdown to the filter bar. |
| Task | Reject an invalid account type with `422`. |

### `CC-33` — Filter by industry

| Type | Summary |
| --- | --- |
| Task | Implement the `industry` query parameter. |
| Task | Populate the industry dropdown from `GET /api/profiles/industries`. |

### `CC-34` — Combine search and filters

| Type | Summary |
| --- | --- |
| Task | Apply the keyword and both filters in a single query. |
| Task | Return an empty result when the combination matches nothing. |

### `CC-35` — Reset the filters

| Type | Summary |
| --- | --- |
| Task | Clear the keyword, the account type and the industry in one action. |
| Task | Restore the unfiltered listing. |
| Task | Disable the button when no filter is active. |

### `CC-36` — Show empty, loading and error states

| Type | Summary |
| --- | --- |
| Task | Show a loading indicator while a request is in flight. |
| Task | Show a friendly empty state with a "clear the filters" shortcut. |
| Task | Show an error banner with a "Try again" control when a request fails. |

### `CC-40` — Automate the API tests

| Type | Summary | Done when |
| --- | --- | --- |
| Task | Set up Vitest and Supertest in `backend/`. | `npm run test:backend` runs. |
| Task | Point the tests at an isolated `test.db` and reset it per run. | The demo data in `dev.db` is never modified. |
| Task | Cover create, validation failures, duplicate email, list, get, update and delete. | 23 profile tests pass. |
| Task | Cover search, both filters, the combined filters and the empty result. | 14 search tests pass. |

### `CC-41` — Automate the UI tests

| Type | Summary | Done when |
| --- | --- | --- |
| Task | Set up Vitest, jsdom and React Testing Library in `frontend/`. | `npm run test:frontend` runs. |
| Task | Test the field-level validation messages. | The form tests pass. |
| Task | Test the filter reset behaviour. | The filter tests pass. |
| Task | Test the discovery states and the delete confirmation dialog. | The component tests pass. |
| Task | Test that an edit refreshes the displayed profile. | The update-flow tests pass. |

### `CC-42` — Write the README

| Type | Summary |
| --- | --- |
| Task | Write the overview, problem statement, objectives and scope. |
| Task | Document the architecture, the stack and the request flow. |
| Task | Document the prerequisites, the installation and the environment variables. |
| Task | Document the database migration and seeding commands. |
| Task | Document the run and test commands. |
| Task | Write the API endpoint reference with the query parameters and the field table. |
| Task | Document the known limitations. |

### `CC-43` — Write the requirements and test cases

| Type | Summary |
| --- | --- |
| Task | Write the functional and non-functional requirements with identifiers. |
| Task | Write the user stories with acceptance criteria. |
| Task | Write the acceptance criteria table for both modules. |
| Task | Write the test case table with the execution status. |

### `CC-44` — Demonstrate the defect workflow

| Type | Summary | Done when |
| --- | --- | --- |
| Task | Create the `demo-bugs` branch from `main`. | `git branch -a` lists both branches. |
| Task | Inject BUG-1, BUG-2 and BUG-3 and nothing else. | `git diff main demo-bugs` shows only the three changes. |
| Task | Verify that each defect reproduces and that a regression test fails. | The failing tests are recorded in `docs/demo-bugs.md`. |
| Task | Document the reproduction steps, expected and actual results and the suggested fix. | `docs/demo-bugs.md` is complete. |
| Task | Confirm that `main` is fully green. | Both test suites pass on `main`. |

---

## 5. Bug issues — the three intentional defects

Create these three issues as **Bug** type. The content below is ready to paste
into the issue fields.

### BUG-1

| Field | Value |
| --- | --- |
| **Summary** | Search results do not match when the keyword uses a different letter case |
| **Issue type** | Bug |
| **Severity** | Minor |
| **Priority** | Medium |
| **Component / module** | Module B — Discovery and Search |
| **Labels** | `module-discovery-search`, `backend`, `search` |
| **Environment** | Local development — Windows, Node 24.20.0, npm 12.2.0, branch `demo-bugs` |
| **Fix version / sprint** | Sprint 3 |

**Description**

On the `demo-bugs` branch the keyword search on the discovery page only matches
profiles whose stored text has exactly the same letter case as the keyword.

Searching for "creator" does not find the profile named "Creator Studio", while
searching for "Creator" does. Searching for "CREATOR" returns nothing at all.

The keyword is expected to be matched case-insensitively against the display
name, the bio and the skills of a profile.

**Steps to reproduce**

1. Check out the `demo-bugs` branch and run `npm run dev`.
2. Run `npm run db:seed` so the demo profiles are present.
3. Call `GET /api/profiles?q=creator`, or type `creator` into the search box on
   <http://localhost:3000>.
4. Call `GET /api/profiles?q=Creator` and compare the two responses.

**Expected result**

Both requests return the same profiles, including the profile named
"Creator Studio".

**Actual result**

`q=creator` returns "Aria Bennett" and "Maya Flores" but not "Creator Studio".
`q=Creator` returns only "Creator Studio". `q=CREATOR` returns an empty list.

**Additional context**

The comparison in `backend/src/services/profile.service.ts` uses SQLite's
`instr()` on the raw column, which is case-sensitive. The keyword and the
stored value need to be lower-cased on both sides before the comparison.

**Regression test**

`backend/tests/search.test.ts` → "matches regardless of the case of the search
term". Fails on `demo-bugs`, passes on `main`.

**Suggested fix**

Use `instr(lower(<column>), lower(:keyword)) > 0` for the display name, bio and
skills comparisons.

---

### BUG-2

| Field | Value |
| --- | --- |
| **Summary** | Reset filters button does not clear the selected industry |
| **Issue type** | Bug |
| **Severity** | Minor |
| **Priority** | Medium |
| **Component / module** | Module B — Discovery and Search |
| **Labels** | `module-discovery-search`, `frontend`, `filters` |
| **Environment** | Local development — Windows, Node 24.20.0, npm 12.2.0, branch `demo-bugs` |
| **Fix version / sprint** | Sprint 3 |

**Description**

On the `demo-bugs` branch the "Reset filters" button on the discovery page
clears the search keyword and the account-type filter, but the selected
industry is kept. The industry dropdown still shows the chosen industry and the
results stay filtered by it, so the unfiltered listing is never restored.

**Steps to reproduce**

1. Check out the `demo-bugs` branch and run `npm run dev`.
2. Open <http://localhost:3000>.
3. Select an industry, for example `Technology`, in the "Industry" dropdown.
4. Click the **Reset filters** button.
5. Observe the "Industry" dropdown and the results.

**Expected result**

The industry dropdown returns to "All industries", the search box is empty, the
account type returns to "All account types", and the full list of profiles is
shown.

**Actual result**

The keyword and the account type are cleared, but the industry dropdown still
shows `Technology` and the results remain filtered to that industry. The
network tab shows `GET /api/profiles?industry=Technology` after the reset.

**Additional context**

The reset handler in `frontend/components/DiscoveryBrowser.tsx` rebuilds the
filter state from the empty template but copies the current industry back into
it, so the industry filter is never released.

**Regression tests**

- `frontend/tests/DiscoveryBrowser.test.tsx` → "resets the industry filter and
  restores the unfiltered listing".
- `frontend/tests/SearchFilters.test.tsx` → "clears the industry filter when
  Reset is clicked".

Both fail on `demo-bugs` and pass on `main`.

**Suggested fix**

Reset the whole filter state to `EMPTY_FILTERS` without preserving the
industry.

---

### BUG-3

| Field | Value |
| --- | --- |
| **Summary** | Edited profile keeps showing the old details until the page is reloaded |
| **Issue type** | Bug |
| **Severity** | Minor |
| **Priority** | Medium |
| **Component / module** | Module A — Profile Management |
| **Labels** | `module-profile-management`, `frontend`, `edit` |
| **Environment** | Local development — Windows, Node 24.20.0, npm 12.2.0, branch `demo-bugs` |
| **Fix version / sprint** | Sprint 3 |

**Description**

On the `demo-bugs` branch, saving an edit to a profile does not refresh the
in-memory copy of that profile. When the user is returned to the profile
detail view, it still shows the previous display name and the previous "Last
updated" date. The change only becomes visible after pressing the **Refresh**
button on the profile page or reloading the browser.

The change is written to the database correctly, so no data is lost — the
defect is confined to the displayed information.

**Steps to reproduce**

1. Check out the `demo-bugs` branch and run `npm run dev`.
2. Open <http://localhost:3000> and open the profile "Creator Studio".
3. Click **Edit**.
4. Change the display name to `Creator Studio Updated`.
5. Click **Save changes**.
6. Observe the profile detail view shown after saving.

**Expected result**

The profile detail view immediately shows "Creator Studio Updated" and the new
"Last updated" date.

**Actual result**

The profile detail view still shows "Creator Studio" and the old "Last
updated" date. Pressing **Refresh** or reloading the page shows the new name,
confirming the data was saved correctly.

**Additional context**

The profile detail view renders from the in-memory cache in
`frontend/lib/profile-cache.ts`. On `main` the edit form updates that cache
with the profile returned by the save request; on `demo-bugs` that update is
missing, so the view keeps rendering the previous version.

**Regression tests**

- `frontend/tests/EditProfileForm.test.tsx` → "refreshes the cached profile
  after a successful edit".
- `frontend/tests/profileUpdateFlow.test.tsx` → "shows the new details on the
  profile view straight after an edit" and "keeps the cached profile in step
  with the saved changes".

All three fail on `demo-bugs` and pass on `main`.

**Suggested fix**

Call `setCachedProfile(updated)` with the profile returned by
`api.updateProfile` before navigating back to the profile view.

---

## 6. Suggested workflow for the defect demonstration

1. **Create** the three bug issues above in JIRA, in the "To Do" column.
2. **Reproduce** each defect on the `demo-bugs` branch using the steps in the
   issue, and **attach** the evidence (the failing test output and a screenshot
   of the browser).
3. **Move** each issue to "In Progress" and link it to the corresponding task
   under `CC-44`.
4. **Fix** the defect on `main`, using the suggested fix as the starting point.
5. **Run** `npm test` on `main` and confirm that the previously failing
   regression tests now pass.
6. **Move** each issue to "Done" and record the passing test output as the
   verification comment.
7. Optionally **close** the `demo-bugs` branch once the demonstration has been
   recorded, and note the removal in the release notes.
