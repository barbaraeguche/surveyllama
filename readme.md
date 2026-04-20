# SurveyLlama 🦙

SurveyLlama is a cloud-based survey platform built for SOEN 487. It enables administrators to create and publish surveys, invite participants through secure tokenized links, and review response analytics.

## Live App URL

<https://surveyllama--soen487-surveyllama.us-east4.hosted.app/>

## Team

- *Emilia Krichevsky* - @emiliakrichevsky
- *Barbara Olubo ojo Eguche* - @barbaraeguche

## Project Scope and Feature Coverage

### 👤 Admin Capabilities

- Authenticate with Firebase Authentication (email/password and Google sign-in).
- Create and edit surveys with:
  - Title and description
  - Expiry date
  - Settings (anonymous mode, question display order, thank-you message)
- Build surveys using 4 supported question types:
  - Multiple choice
  - Checkbox
  - Short answer
  - Rating scale
- Reorder questions in the builder UI.
- Publish and unpublish surveys.
- Upload participant emails via `.csv`/`.txt` or add emails manually.
- Send invitation emails with unique single-use tokens.
- View analytics dashboard with summary stats, per-question charts, and response trends.

### :busts_in_silhouette: Participant Capabilities

- Open survey links from invitation emails (`/survey/:id?token=...`).
- Submit responses while survey is published and not expired.
- Receive a post-submission confirmation screen.
- Blocked from resubmitting when token is already used.

## 🏗️ Architecture (Three-Tier)

```text
Presentation Layer  -> React + React Router + Tailwind CSS
Application Layer   -> Node.js + Express REST API (TypeScript)
Cloud/Data Layer    -> Firebase Firestore + Firebase Auth + Firebase App Hosting
```

### Design Choices (Brief)

- Firebase ID tokens are verified on the backend middleware to keep authorization centralized server-side.
- Invitations are stored with token as document ID for direct lookup during submission validation.
- Survey responses, invitations, and questions are modeled as subcollections under each survey to keep survey-specific reads localized.
- Vite middleware is used in development through the Express server to run frontend and backend from one origin and simplify API calls.
- Current renderer behavior: `multiple_choice` is presented as multi-select checkboxes, while `checkbox` is presented as single-select radio options.

## ⚛️ Tech Stack and Tools

| Area | Tools/Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Tailwind CSS 4, Framer Motion, Recharts |
| Backend | Node.js, Express, TypeScript |
| Data/Auth | Firebase Firestore, Firebase Authentication, Firebase Storage |
| Email | Nodemailer (SMTP, with Ethereal fallback for testing) |
| Build/Dev | Vite, tsx |
| Testing | Vitest, Testing Library, Supertest |
| Hosting | Firebase App Hosting |
| Version Control | Git + GitHub |

## API Endpoints

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Service health check |
| `GET` | `/api/surveys` | Required | List surveys owned by current admin |
| `POST` | `/api/surveys` | Required | Create a survey + questions |
| `GET` | `/api/surveys/:id` | Public/Optional | Fetch survey for participants; supports owner preview metadata |
| `PUT` | `/api/surveys/:id` | Required | Update survey (blocked if already published) |
| `DELETE` | `/api/surveys/:id` | Required | Delete survey |
| `PATCH` | `/api/surveys/:id/publish` | Required | Publish survey (enforces expiry-date rule) |
| `PATCH` | `/api/surveys/:id/unpublish` | Required | Unpublish survey |
| `POST` | `/api/surveys/:id/responses` | Public | Submit participant response using invitation token |
| `GET` | `/api/surveys/:id/analytics` | Required | Retrieve analytics and trends |
| `POST` | `/api/surveys/send-invites` | Required | Send invitation emails and persist token state |

## Firestore Data Model

```text
surveys/{surveyId}
  title
  description
  expiry_date
  admin_id
  is_published
  settings { is_anonymous, display_order, thank_you_message }
  created_at
  updated_at

  questions/{questionId}
    text
    type
    options[]
    required
    order_index

  responses/{responseId}
    email
    answers{}
    submitted_at

  invitations/{token}
    email
    used
    status
    sent_at
    admin_id
    error (optional)
```

## 🔏 Security and Validation Notes

- Backend authentication middleware validates Firebase ID tokens for protected routes.
- Survey and question text inputs are sanitized on create/update to strip `HTML` tags.
- Invitation tokens are validated and marked `used: true` after successful submission.
- Submissions are blocked for unpublished or expired surveys.
- Firestore/Storage rules are included in repository configuration.

## Grader Usage Guide

### Suggested Application Usage Flow

**Live app URL:** <https://surveyllama--soen487-surveyllama.us-east4.hosted.app/>

1. Open the live app URL above.
2. Click `Login` in the navigation bar, or go directly to `/login`.
3. Login as admin with the credentials provided below.
4. After login, you will be redirected to the admin dashboard (`/dashboard`).
5. Create a survey with multiple question types.
6. Publish survey.
7. Send invitations to test emails.
8. Open invitation link and submit response.
9. Verify analytics page updates (counts/charts/trends).

### Sample User

- **Login method:** Firebase Auth (email/password)
- **Credentials:**
  - **email**: `hassan.hajjdiab.soen487@mail.com`
  - **password**: `soen487projectgrader`

## Local Setup

> To use the application, we recommend visiting the live application instead of running it locally, as the necessary environment variables are not available in this repository.

### Prerequisites

- Node.js `>= 22.6.0`
- Firebase project with Firestore + Authentication enabled
- SMTP credentials (optional; Ethereal fallback is automatic when SMTP user/pass are missing)

### Environment Variables

>❗For security reasons, **no real credentials are stored in this repository**.
During project development, we used a local `.env` file in the project root to contain the necessary environment variables.

Below is an example `.env` file:

```env
# Firebase Admin SDK (backend)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=""
FIREBASE_FIRESTORE_DATABASE_ID=

# Firebase Client SDK (frontend)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

### Run

```bash
npm install
npm run dev
```

App URL (local): `http://localhost:3000`
