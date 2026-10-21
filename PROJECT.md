# Project: CreatorConnect — Software Engineering PBL

## 1. Objective

Build a working web application called CreatorConnect, a professional networking and collaboration marketplace for creators, brands, and businesses.

The project is for an individual Software Engineering Project-Based Learning (PBL) submission. Implement exactly two core functional modules:

1. Profile Management
2. Creator/Brand Discovery and Search

The application must be demonstrable locally, easy to test, and organized so defects can be documented, reproduced, fixed, and retested through JIRA.

**Priorities:** Working functionality, simple architecture, input validation, testability, clear documentation, and reliable local setup. Avoid unnecessary features.

## 2. Technology stack

Frontend:
- Next.js with App Router
- TypeScript
- Tailwind CSS

Backend:
- Node.js
- Express.js
- TypeScript if it does not complicate setup

Database:
- SQLite
- Prisma ORM

Validation:
- Zod

Testing:
- Vitest
- Supertest for backend API tests
- React Testing Library for important frontend behavior, if time permits

Project management:
- JIRA, managed manually by the student

Keep the frontend and backend as separate applications in one repository. Provide root-level scripts where practical to simplify running and testing both.

## 3. Module A — Profile Management

Implement the following functionality:

### Profile fields
- Unique ID
- Display name
- Email
- Account type: Creator, Brand, or Business
- Industry
- Professional bio
- Skills or creator niche
- Portfolio URL
- Optional social media links
- Created and updated timestamps

### Features
- Create a new profile
- View a profile's complete details
- Edit an existing profile
- Delete a profile with confirmation
- List existing profiles
- Persist records in SQLite
- Seed several realistic demo profiles

### Validation
- Display name is required.
- Email must have a valid format.
- Email should be unique.
- Account type must be one of the permitted values.
- Required fields cannot contain only whitespace.
- Portfolio URLs must be valid HTTP/HTTPS URLs when supplied.
- Handle missing records and duplicate email errors.
- Display useful field-level validation messages in the frontend.

## 4. Module B — Discovery and Search

Implement:
- A discovery page displaying profiles as responsive cards.
- Search by display name, bio, and skills.
- Filter by account type.
- Filter by industry.
- Combine search and filters.
- Clear/reset all filters.
- View complete profile details.
- Show a friendly empty state when no profiles match.
- Show loading and API error states.

Search and filters must use actual database-backed API results, not hardcoded frontend arrays.

## 5. REST API

Create and document the following endpoints:

- GET /api/health
- POST /api/profiles
- GET /api/profiles
- GET /api/profiles/:id
- PUT /api/profiles/:id
- DELETE /api/profiles/:id

Support appropriate query parameters for search, account type, and industry.

Use:
- Correct HTTP status codes
- Consistent JSON response formats
- Zod request validation
- Centralized error handling
- Prisma database operations
- CORS configuration for the local frontend
- Environment variables for configuration

Do not expose passwords or implement authentication; authentication is outside the scope of these two modules.

## 6. UI requirements

Create a polished, responsive professional marketplace interface.

Include:
- Navigation bar with CreatorConnect branding
- Discovery page
- Profile creation/edit form
- Profile detail view
- Profile cards
- Search bar and filter controls
- Empty, loading, success, and error states
- Delete confirmation dialog
- Responsive layouts for desktop and mobile

Use a consistent visual design with clean spacing, accessible form labels, readable typography, and clear buttons.

Do not spend excessive time on animations or decorative elements. Every visible action must work.

## 7. Automated tests

Write automated tests for:
- Successful profile creation
- Missing required fields
- Invalid email
- Duplicate email
- Invalid account type
- Invalid portfolio URL
- Fetching all profiles
- Fetching a nonexistent profile
- Updating a profile
- Deleting a profile
- Search by keyword
- Filtering by account type
- Filtering by industry
- Combined filters
- Empty search results

Use an isolated test database or temporary database configuration so tests do not destroy demo data.

## 8. Controlled intentional bugs for the PBL demonstration

I need to demonstrate defect tracking in JIRA. Create a dedicated Git branch called `demo-bugs` containing exactly three small, reproducible, non-security-related defects.

**Do not put intentional defects in the final stable branch.**

On `demo-bugs`, introduce these specific defects:

BUG-1 — Search matching is case-sensitive
- Expected: Searching for "creator" should find a profile named "Creator Studio".
- Actual: Some uppercase/lowercase variations fail to match.
- Severity: Minor.
- Module: Discovery and Search.

BUG-2 — Industry filter fails to reset
- Expected: Clicking Reset clears the industry filter and restores the unfiltered listing.
- Actual: The industry selection remains active after Reset.
- Severity: Minor.
- Module: Discovery and Search.

BUG-3 — Profile update does not refresh the displayed card
- Expected: After successfully editing a profile, the updated information should appear immediately.
- Actual: The detail view or card temporarily continues to display stale information until a reload or refetch.
- Severity: Major only if the affected workflow is materially blocked; otherwise Minor.
- Module: Profile Management.

Requirements for the intentional defects:
- Keep them limited to the named behaviors.
- Do not introduce data loss, security vulnerabilities, broken project setup, or database corruption.
- Record each defect's exact reproduction steps, expected result, actual result, affected module, severity, and suggested fix in `docs/demo-bugs.md`.
- Provide a stable branch named `main` containing the corrected behavior.
- Provide a clear way to switch between `main` and `demo-bugs`.
- Do not claim a defect exists until its behavior has been reproduced and verified.
- Automated tests should assert the correct expected behavior on `main`.
- On `demo-bugs`, document the corresponding failing regression tests where practical.
- Do not hide defects in minified code or add unrelated bugs.

If time or Git setup prevents creating both branches automatically, implement and verify the stable version first, then explain the manual steps needed to create the demonstration branch.

## 9. Documentation

Create:

### README.md
Include:
- Project overview
- Problem statement
- Objectives
- Scope and the two implemented modules
- Architecture and technology stack
- Prerequisites
- Installation and setup
- Environment variables
- Database migration and seeding
- Commands to run frontend, backend, and tests
- API endpoint reference
- Known limitations

### docs/requirements.md
Include:
- Functional requirements for both modules
- Non-functional requirements
- User stories
- Acceptance criteria

### docs/test-cases.md
Use a table with:
- Test Case ID
- Module
- Test Scenario
- Test Data
- Expected Result
- Actual Result
- Status

Initially mark unexecuted test cases as Not Run. Never fabricate passing test results.

### docs/demo-bugs.md
Document the three intentional defects, reproduction steps, expected and actual behavior, severity, and verification procedure.

### docs/jira-plan.md
Provide suggested JIRA epics, user stories, tasks, test tasks, and bug issue descriptions. Do not claim that issues have been created in JIRA; I will create them myself.

## 10. Execution plan

Work in this order:

1. Inspect the project and confirm the available Node.js/npm versions.
2. Scaffold frontend and backend.
3. Set up Prisma and SQLite.
4. Implement profile CRUD APIs.
5. Implement profile forms and detail views.
6. Implement discovery, search, and filters.
7. Seed demo data.
8. Run the app and fix setup errors.
9. Write and execute tests.
10. Verify the stable version.
11. Create and verify the dedicated demo-bugs branch.
12. Complete documentation.

After each stage, summarize which files were created, which commands were run, what passed, and any remaining blockers.

Do not stop after generating a plan or pseudocode. Implement the application in the repository.

Avoid unnecessary dependencies, external APIs, paid services, Docker requirements, and deployment requirements.

The final deliverable must be a locally runnable application with two functional modules, working database persistence, reproducible intentional defects on a separate branch, tests, and complete documentation.
