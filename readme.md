## surveyllama 🦙
a cloud-based web application for creating, distributing, and analyzing online surveys. this was built as a requirement project for soen 487.

### features
#### admin
- create surveys with a title, description, and expiry date
- add four question types: multiple choice, short answer, checkbox, and rating scale
- reorder questions via drag-and-drop
- publish and unpublish surveys
- upload participant emails (csv or txt) or enter them manually
- send personalized email invitations with secure, single-use links
- view analytics: response counts and charts per question

#### participant
- access surveys exclusively via a secure invitation link (token-based)
- submit responses anonymously or with email
- cannot submit on expired or unpublished surveys
- each invitation link can only be used once

### architecture
three-tier web architecture:
```
presentation layer  →  react + react router + tailwind css
application layer   →  node.js + express.js rest api
cloud/data layer    →  firebase firestore + firebase auth + firebase app hosting
```

### tech stack
| layer          | technology                                                        |
|----------------|-------------------------------------------------------------------|
| frontend       | react 19, react router 7, tailwind css 4, recharts, framer motion |
| backend        | node.js, express.js, typescript                                   |
| database       | firebase firestore                                                |
| authentication | firebase auth (email/password + google oauth)                     |
| email          | nodemailer (smtp / ethereal fallback)                             |
| hosting        | firebase app hosting                                              |
| testing        | vitest, testing library                                           |

### project structure
```
surveyllama/
├── client/src/
│   ├── components/        # reusable ui components and chart components
│   │   └── survey-builder/  # survey creation form components
│   ├── contexts/          # authcontext (firebase auth state)
│   ├── lib/               # firebase client sdk, api utilities
│   ├── pages/             # route-level page components
│   ├── services/          # surveyservice (api calls)
│   └── types.ts           # shared typescript types
├── server/
│   ├── config/            # firebase admin sdk initialization
│   ├── controllers/       # surveycontroller, responsecontroller, invitecontroller, analyticscontroller
│   ├── middleware/        # firebase token authentication
│   ├── routes/            # express route definitions
│   └── services/          # emailservice (nodemailer)
├── server.ts              # express app entry point
├── firestore.rules        # firestore security rules
├── firebase.json          # firebase project configuration
└── apphosting.yaml        # firebase app hosting configuration
```

### api endpoints
| method   | path                         | auth     | description                               |
|----------|------------------------------|----------|-------------------------------------------|
| `GET`    | `/api/surveys`               | required | get all surveys for the current admin     |
| `POST`   | `/api/surveys`               | required | create a new survey                       |
| `GET`    | `/api/surveys/:id`           | public   | get a survey by id (for participant view) |
| `PUT`    | `/api/surveys/:id`           | required | update a survey (must be unpublished)     |
| `DELETE` | `/api/surveys/:id`           | required | delete a survey                           |
| `PATCH`  | `/api/surveys/:id/publish`   | required | publish a survey                          |
| `PATCH`  | `/api/surveys/:id/unpublish` | required | unpublish a survey (no responses allowed) |
| `POST`   | `/api/surveys/:id/responses` | public   | submit a response (requires valid token)  |
| `GET`    | `/api/surveys/:id/analytics` | required | get aggregated analytics                  |
| `POST`   | `/api/surveys/send-invites`  | required | send email invitations                    |

### firestore data model
```
surveys/{surveyId}
  ├── title, description, expiry_date
  ├── admin_id, is_published
  ├── settings: { is_anonymous, display_order, thank_you_message }
  ├── created_at, updated_at

  ├── questions/{questionId}
  │     ├── text, type, options[], required, order_index
  │
  ├── responses/{responseId}
  │     ├── email, answers{}, submitted_at
  │
  └── invitations/{token}
        ├── email, used, status, sent_at, admin_id
```

### secure invitation flow
1. admin uploads emails and sends invitations
2. a unique uuid token is generated per recipient
3. the email contains a link: `/survey/:id?token=<uuid>`
4. the token is stored in firestore under `invitations/{token}`
5. on submission, the backend verifies the token exists and has not been used
6. after a successful submission the token is marked `used: true`, preventing resubmission

### getting started
#### prerequisites
- node.js >= 22.6.0
- a firebase project with firestore and authentication enabled
- smtp credentials for email sending (or use the ethereal fallback for testing)

#### environment variables
create a `.env` file in the project root:

```env
# firebase admin sdk
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# firebase client sdk
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# email (optional — falls back to ethereal test account)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
SMTP_FROM=your@email.com
```

#### run locally
```bash
# install dependencies
npm install

# start the development server (express + vite)
npm run dev
```
the app runs on `http://localhost:3000`.

#### build for production
```bash
npm run build
```

#### run tests
```bash
npm test
```

### deployment
the app is deployed via **firebase app hosting**. configuration is in `apphosting.yaml`.
```bash
firebase deploy
```