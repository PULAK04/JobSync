# JobSync — AI-Powered Recruitment & Career Intelligence Platform

JobSync is a MERN recruitment platform for job seekers and recruiters. This upgraded version preserves the existing workflows while strengthening authorization, validation, reliability, AI integration, email delivery, payments and local deployment.

## What was added

- Groq AI instead of Gemini AI
- Credit-controlled AI Match Reports
- Razorpay credit packs without webhooks
- Two login options: email/password or passwordless email OTP
- Resend instead of Nodemailer
- Dockerfiles for frontend/backend and Docker Compose for the complete local stack
- Role-based authorization and recruiter ownership checks
- Safer file uploads, resume URL validation and PDF size limits
- Atomic credit deduction/refund and idempotent payment crediting
- Global error handling, rate limiting, Helmet and compression
- Better Redis failure handling, cache fingerprints and database indexes
- Job filters for keyword, location, job type, experience, salary and sorting
- Same-origin local API proxy to prevent stale-cookie/401 issues
- Authenticated resume download endpoints that force PDF downloads

## Preserved features

### Job seekers

- Register and log in with email/password
- Optionally log in without a password using a Resend OTP
- Update profile and upload resume/profile photo through Cloudinary
- Browse, search, save and apply to jobs
- View application history
- Generate AI Match Reports
- View previous AI reports
- Generate and download ATS resume PDFs
- Purchase AI credits through Razorpay

### Recruiters

- Register and log in
- Create and update companies
- Post jobs
- View posted jobs and applicants
- Download applicant resumes
- Accept or reject applications
- Trigger application-status emails through Resend

## Credit rules

- A new job seeker receives `FREE_AI_CREDITS` credits.
- One newly generated AI Match Report uses `AI_MATCH_CREDIT_COST` credits.
- Opening an existing cached/database report does not use another credit.
- If Groq generation fails after deduction, the backend refunds the credit.
- The frontend displays the balance, but the backend is authoritative.
- Razorpay prices and credit quantities are controlled only by the backend.

Current packs:

| Plan | Credits | Price |
|---|---:|---:|
| Starter | 10 | ₹49 |
| Popular | 30 | ₹99 |
| Pro | 100 | ₹249 |

## Important Razorpay note

This project intentionally does **not** use Razorpay webhooks. Credits are added only after Checkout returns success and the backend:

1. verifies the Razorpay signature,
2. fetches the payment from Razorpay,
3. confirms the order, amount and currency,
4. captures an authorized payment when required,
5. atomically prevents the same payment from being credited twice.

For a real commercial product, webhooks are recommended as a recovery path when the customer closes the browser after payment but before client-side verification completes. This version follows the requested no-webhook design.

## Project structure

```text
JobSync-upgraded/
├── backend/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── .env
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── interview/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── utils/
│   ├── .env
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── compose.yaml
├── package.json
└── README.md
```

## Environment files

Actual placeholder `.env` files are included as requested:

- `backend/.env`
- `frontend/.env`

Replace every placeholder before testing integrations. Do not commit real secrets.

### Backend variables to replace

```env
JWT_SECRET=...
OTP_TOKEN_SECRET=...
OTP_PEPPER=...
CLOUD_NAME=...
API_KEY=...
API_SECRET=...
GROQ_API_KEY=...
RESEND_API_KEY=...
RESEND_FROM=JobSync <onboarding@resend.dev>
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

For Resend production email delivery, verify a domain and replace `RESEND_FROM` with an address on that domain. The `onboarding@resend.dev` sender is suitable only for restricted testing.

## Run with Docker

### Requirements

- Docker Desktop
- Valid Groq, Cloudinary, Resend and Razorpay test credentials in `backend/.env`

From the project root:

```bash
docker compose up --build
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Health:   http://localhost:8000/health
MongoDB and Redis run only inside the Docker Compose network.
```

Useful commands:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
docker compose down -v   # also deletes local MongoDB/Redis volumes
```

## Run without Docker

Start local MongoDB and Redis first, then:

```bash
npm run install:all
npm run dev:backend
```

In another terminal:

```bash
npm run dev:frontend
```

## Login options

### Email and password

```text
Email + password
      ↓
Backend validates the password
      ↓
JWT HTTP-only cookie is issued immediately
      ↓
User is logged in
```

### Passwordless OTP

```text
User selects “Login with OTP”
      ↓
User enters the registered email
      ↓
6-digit OTP is generated and hashed
      ↓
Resend sends the OTP email
      ↓
Backend validates expiry and attempt limit
      ↓
JWT HTTP-only cookie is issued after OTP verification
```

To see the OTP in the API response during local development only:

```env
NODE_ENV=development
DEV_SHOW_OTP=true
```

Keep `DEV_SHOW_OTP=false` in deployment. Password login does not depend on Resend.

## AI Match flow

```text
User requests AI Match
      ↓
Backend validates role, resume and request
      ↓
Existing cache/database report checked first
      ↓
If new, credit is atomically reserved
      ↓
Resume text is safely extracted from Cloudinary PDF
      ↓
Groq generates schema-constrained JSON
      ↓
Report is validated, stored and cached
      ↓
If generation fails, reserved credit is refunded
```

Default model:

```env
GROQ_MODEL=openai/gpt-oss-120b
```

A placeholder or rejected Groq key now produces a clear configuration error instead of returning a misleading application-authentication `401`. Replace `GROQ_API_KEY` in `backend/.env`, then rebuild the backend container.

## Job filters

The job page supports server-side filtering and sorting with these query parameters:

```text
keyword
location
jobType
minSalary / maxSalary
minExperience / maxExperience
sort=newest|oldest|salary-high|salary-low|experience-low|experience-high
```

The UI provides a compact filter panel and keeps the existing job cards unchanged.

## API routes

### User

```text
POST /api/v1/user/register
POST /api/v1/user/login
POST /api/v1/user/login/request-otp
POST /api/v1/user/login/verify-otp
POST /api/v1/user/login/resend-otp
GET  /api/v1/user/logout
GET  /api/v1/user/me
GET  /api/v1/user/resume/download
POST /api/v1/user/profile/update
POST /api/v1/user/saved-jobs/:jobId
```

### Jobs and companies

```text
GET    /api/v1/job/get
GET    /api/v1/job/get/:id
POST   /api/v1/job/post
GET    /api/v1/job/getadminjobs
PUT    /api/v1/job/update/:id
DELETE /api/v1/job/delete/:id

POST /api/v1/company/register
GET  /api/v1/company/get
GET  /api/v1/company/get/:id
PUT  /api/v1/company/update/:id
```

### Applications

```text
GET/POST /api/v1/application/apply/:id
GET      /api/v1/application/get
GET      /api/v1/application/:id/applicants
GET      /api/v1/application/:id/resume/download
POST     /api/v1/application/status/:id/update
```

### AI reports

```text
POST /api/v1/interview
GET  /api/v1/interview
GET  /api/v1/interview/report/:interviewId
POST /api/v1/interview/resume/pdf/:interviewReportId
```

### Payments

```text
GET  /api/v1/payment/plans
POST /api/v1/payment/create-order
POST /api/v1/payment/verify
GET  /api/v1/payment/history
```

## Deployment notes

- Frontend can remain a Render Static Site or use the supplied Nginx Docker image. Local Docker/Vite requests use `/api` through a same-origin proxy.
- Backend can be deployed as a Render Docker Web Service.
- Set production cookies with `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` when frontend and backend use different HTTPS origins.
- Set `FRONTEND_URLS` to all approved frontend origins.
- Use managed MongoDB Atlas and Redis Cloud in production by replacing `MONGO_URI` and `REDIS_URL`.
- Do not copy `.env` into a Docker image. Compose injects it at runtime.

## Security and reliability improvements

- Password is excluded from normal MongoDB queries.
- Applicant API responses select only required profile fields.
- Recruiter routes require both recruiter role and resource ownership.
- Duplicate applications are prevented with a compound unique index.
- AI credit deduction uses an atomic conditional update.
- Payment credits are idempotent through `creditedPaymentIds`.
- Uploads have MIME allowlists and 5 MB limits.
- Remote resume fetches require approved HTTPS hosts, timeouts and size limits.
- Redis failures do not take down the primary workflow.
- Authentication, OTP, AI and payment endpoints are rate limited.
- Errors consistently return JSON instead of leaving requests hanging.

## License

This project is intended for educational and portfolio use.
