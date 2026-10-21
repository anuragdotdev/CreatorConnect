# CreatorConnect — Controlled Defects (demo-bugs branch)

This document records the three intentional defects that exist on the
**`demo-bugs`** branch. They exist to demonstrate a defect-tracking workflow:
reproduce the defect, report it in JIRA, fix it, and verify the fix with the
regression tests.

The defects are **not** present on `main`, which contains the corrected
behaviour and a fully green test suite.

| Branch | Behaviour | Test suite |
| --- | --- | --- |
| `main` | Correct | Backend 37/37 pass, frontend 26/26 pass |
| `demo-bugs` | Three defects present | Backend 36/37 pass, frontend 22/26 pass |

---

## How to switch between the branches

```bash
git checkout main        # the stable, corrected version
git checkout demo-bugs   # the version with the three defects
```

Both branches are complete, independently runnable applications. On each
branch run:

```bash
npm run install:all
npm run db:migrate
npm run db:seed
npm run dev
```

The backend must be running for the browser reproduction steps below.

---

## Summary

| ID | Title | Module | Severity | Layer |
| --- | --- | --- | --- | --- |
| BUG-1 | Search matching is case-sensitive | Discovery and Search | Minor | Backend (SQL) |
| BUG-2 | Industry filter fails to reset | Discovery and Search | Minor | Frontend |
| BUG-3 | Profile update does not refresh the displayed profile | Profile Management | Minor | Frontend |

None of the three defects causes data loss, a security problem, a broken
project setup or database corruption. All three are limited to the behaviour
named in their title.

---

## BUG-1 — Search matching is case-sensitive

| Attribute | Value |
| --- | --- |
| **Module** | Discovery and Search |
| **Severity** | Minor |
| **Layer** | Backend — `backend/src/services/profile.service.ts` |
| **Affected endpoint** | `GET /api/profiles?q=<keyword>` |

### Description

On the `demo-bugs` branch the keyword search compares the search term against
the stored text **without normalising the case**. The comparison uses SQLite's
`instr()` directly on the raw column, so a search only matches when the
letter case of the keyword is identical to the letter case in the stored
profile data.

The seed data contains a profile named **"Creator Studio"**. Searching for
`creator` (all lower case) therefore does not find it, while searching for
`Creator` does.

### Root cause

```sql
-- main (correct): both sides are lower-cased before the comparison
instr(lower(displayName), lower(:keyword)) > 0

-- demo-bugs (defective): the raw column is compared with the raw keyword
instr(displayName, :keyword) > 0
```

`instr()` is case-sensitive in SQLite, so `instr('Creator Studio', 'creator')`
returns `0` while `instr('Creator Studio', 'Creator')` returns `1`.

### Reproduction steps

1. Check out the `demo-bugs` branch and start the application:
   ```bash
   git checkout demo-bugs
   npm run dev
   ```
2. Make sure the demo data is present:
   ```bash
   npm run db:seed
   ```
3. Call the API with a lower-case keyword:
   ```bash
   curl "http://localhost:4000/api/profiles?q=creator"
   ```
4. Call the API with a capitalised keyword:
   ```bash
   curl "http://localhost:4000/api/profiles?q=Creator"
   ```
5. Compare the two responses. Also open <http://localhost:3000> and type
   `creator` into the search box, then type `Creator` instead.

### Expected result

Both requests return the same set of profiles, including the profile named
"Creator Studio". Searching for "creator" should find "Creator Studio".

### Actual result (verified)

```
$ curl "http://localhost:4000/api/profiles?q=creator"
data: [ { displayName: "Aria Bennett" }, { displayName: "Maya Flores" } ]   # "Creator Studio" is MISSING

$ curl "http://localhost:4000/api/profiles?q=Creator"
data: [ { displayName: "Creator Studio" } ]

$ curl "http://localhost:4000/api/profiles?q=CREATOR"
data: []                                                                  # nothing found
```

"Creator Studio" only appears when the keyword matches the stored capitalisation
exactly. The profiles "Aria Bennett" and "Maya Flores" still appear for
`q=creator` because the word "creator" appears in lower case inside their bio
text — which shows the defect is precisely about letter case, not about the
profile itself.

### Failing regression test

On `demo-bugs` the following test fails:

```
FAIL  backend/tests/search.test.ts
  > Discovery and Search API > keyword search > matches regardless of the case of the search term
```

The test asserts that `q=creator`, `q=CREATOR` and `q=CrEaToR` all return the
same profiles. It passes on `main`.

### Suggested fix

Normalise the case of both sides of the comparison in
`backend/src/services/profile.service.ts`, as `main` does:

```ts
conditions.push(Prisma.sql`
  (
    instr(lower(displayName), lower(${keyword})) > 0
    OR instr(lower(bio), lower(${keyword})) > 0
    OR instr(lower(skills), lower(${keyword})) > 0
  )
`);
```

---

## BUG-2 — Industry filter fails to reset

| Attribute | Value |
| --- | --- |
| **Module** | Discovery and Search |
| **Severity** | Minor |
| **Layer** | Frontend — `frontend/components/DiscoveryBrowser.tsx` |
| **Affected component** | The "Reset filters" button on the discovery page |

### Description

On the `demo-bugs` branch the "Reset filters" button clears the search keyword
and the account-type filter, but it keeps the selected industry. The industry
selector still shows the chosen industry and the results stay filtered by it,
so the unfiltered listing is never restored.

### Root cause

The reset handler rebuilds the filter state from the empty template but copies
the current industry back into it:

```ts
// main (correct)
const handleReset = () => {
  setFilters(EMPTY_FILTERS);
  setDebouncedQuery("");
};

// demo-bugs (defective)
const handleReset = () => {
  setFilters({ ...EMPTY_FILTERS, industry: filters.industry });
  setDebouncedQuery("");
};
```

### Reproduction steps

1. Check out the `demo-bugs` branch and start the application:
   ```bash
   git checkout demo-bugs
   npm run dev
   ```
2. Open <http://localhost:3000>.
3. In the "Industry" dropdown, select any industry, for example `Technology`.
   The list narrows to the profiles in that industry.
4. Click the **Reset filters** button.
5. Observe the "Industry" dropdown and the list of results.

### Expected result

The "Industry" dropdown returns to "All industries", the search box is empty,
the account type returns to "All account types", and the complete list of
profiles is shown again.

### Actual result (verified)

The keyword and the account-type filter are cleared, but the industry dropdown
still shows `Technology` and the results remain filtered to the "Technology"
industry. The unfiltered listing is not restored.

The API confirms the request is still scoped by industry — the network tab
shows `GET /api/profiles?industry=Technology` after the reset instead of
`GET /api/profiles`.

### Failing regression tests

On `demo-bugs` the following tests fail:

```
FAIL  frontend/tests/DiscoveryBrowser.test.tsx
  > DiscoveryBrowser > resets the industry filter and restores the unfiltered listing

FAIL  frontend/tests/SearchFilters.test.tsx
  > SearchFilters > clears the industry filter when Reset is clicked
```

Both assert that the industry selection returns to empty after Reset. They
pass on `main`.

### Suggested fix

Reset the whole filter state to the empty template in
`frontend/components/DiscoveryBrowser.tsx`:

```ts
const handleReset = () => {
  setFilters(EMPTY_FILTERS);
  setDebouncedQuery("");
};
```

---

## BUG-3 — Profile update does not refresh the displayed profile

| Attribute | Value |
| --- | --- |
| **Module** | Profile Management |
| **Severity** | Minor |
| **Layer** | Frontend — `frontend/components/EditProfileForm.tsx` |
| **Affected workflow** | Edit a profile, then return to the profile view |

### Description

On the `demo-bugs` branch a successful edit does not refresh the copy of the
profile that the application keeps in memory. When the user is taken back to
the profile detail view, it still shows the **old** details until the page is
reloaded or the profile is explicitly refreshed.

The profile **is** correctly written to the database — the change is not lost.
The defect is that the view does not reflect it immediately.

### Root cause

The profile detail view renders from an in-memory cache
(`frontend/lib/profile-cache.ts`) so that a profile the user has already
visited is shown instantly. On `main` the edit form updates that cache with
the profile returned by the save request. On `demo-bugs` that update is
missing, so the cache keeps the previous version and the detail view renders
the stale data:

```ts
// main (correct)
const updated = await api.updateProfile(id, { ... });
setCachedProfile(updated);   // the view now shows the new details
router.push(`/profiles/${updated.id}`);

// demo-bugs (defective)
const updated = await api.updateProfile(id, { ... });
// the cached copy is not refreshed, so the profile view keeps the old details
router.push(`/profiles/${updated.id}`);
```

### Reproduction steps

1. Check out the `demo-bugs` branch and start the application:
   ```bash
   git checkout demo-bugs
   npm run dev
   ```
2. Open <http://localhost:3000> and open the profile **Creator Studio**.
3. Click **Edit**.
4. Change the display name to `Creator Studio Updated` and click
   **Save changes**.
5. Observe the profile detail view that is displayed after saving.

### Expected result

The profile detail view immediately shows the new display name
`Creator Studio Updated`, together with the new "Last updated" date.

### Actual result (verified)

The profile detail view still shows the previous display name
`Creator Studio` and the previous "Last updated" date. The change only becomes
visible after the user presses the **Refresh** button on the profile page or
reloads the browser.

Refreshing the page shows `Creator Studio Updated`, which confirms the data
was written to the database correctly and that the defect is confined to the
in-memory view.

### Failing regression tests

On `demo-bugs` the following tests fail:

```
FAIL  frontend/tests/EditProfileForm.test.tsx
  > EditProfileForm > refreshes the cached profile after a successful edit

FAIL  frontend/tests/profileUpdateFlow.test.tsx
  > Profile update refreshes the displayed profile > shows the new details on the profile view straight after an edit
FAIL  frontend/tests/profileUpdateFlow.test.tsx
  > Profile update refreshes the displayed profile > keeps the cached profile in step with the saved changes
```

All three assert that the profile view shows the new details immediately after
a successful edit. They pass on `main`.

### Suggested fix

Refresh the cached copy with the profile returned by the save request, in
`frontend/components/EditProfileForm.tsx`:

```ts
const updated = await api.updateProfile(id, { ... });
setCachedProfile(updated);
router.push(`/profiles/${updated.id}`);
```

---

## Verification procedure

To confirm the defects exist and behave exactly as documented:

```bash
git checkout demo-bugs
npm run install:all
npm run db:migrate
npm run db:seed

npm run test:backend    # expect 1 failure: BUG-1
npm run test:frontend   # expect 4 failures: BUG-2 and BUG-3
```

To confirm the fixed behaviour:

```bash
git checkout main
npm run test:backend    # expect 37 passed
npm run test:frontend   # expect 26 passed
```

### Expected test output on `demo-bugs`

```
 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 36 passed (37)
```

```
 Test Files  3 failed | 3 passed (6)
      Tests  4 failed | 22 passed (26)
```

### Expected test output on `main`

```
 Test Files  2 passed (2)
      Tests  37 passed (37)
```

```
 Test Files  6 passed (6)
      Tests  26 passed (26)
```

---

## How these defects map to JIRA issues

Each defect above corresponds to one bug issue that can be created in JIRA.
See [`docs/jira-plan.md`](jira-plan.md) for the suggested issue content,
including the summary, description, reproduction steps, expected and actual
results, severity, environment and suggested fix.
