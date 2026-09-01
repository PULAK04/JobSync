# 🚀 JobSync — AI-Powered Recruitment & Career Intelligence Platform

<p align="center">
  <strong>Full-stack recruitment platform connecting job seekers and recruiters with AI-powered job matching, interview preparation, skill-gap analysis, and ATS resume generation.</strong>
</p>

<p align="center">
  <a href="https://jobsync-client.onrender.com">
    <img src="https://img.shields.io/badge/Live%20Application-Open%20JobSync-22c55e?style=for-the-badge" />
  </a>
  <a href="https://github.com/PULAK04/JobSync">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Groq-AI-000000" />
  <img src="https://img.shields.io/badge/Redis-Cloud-DC382D?logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-0C2D57" />
  <img src="https://img.shields.io/badge/Resend-Email-000000" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" />
</p>

---

## 🌐 Live

**Frontend:** https://jobsync-client.onrender.com
**GitHub:** https://github.com/PULAK04/JobSync

---

## ✨ Features

### 👨‍💻 Job Seekers

* Registration and login with **email/password**
* Optional **passwordless OTP login**
* JWT authentication using HTTP-only cookies
* Profile and resume management
* Resume upload/download with Cloudinary
* Job search, filtering, sorting and pagination
* Job applications and saved jobs
* AI Match Reports
* Technical and behavioral interview questions
* Personalized preparation plan
* ATS-optimized AI resume generation
* AI credit balance and credit purchases

### 🏢 Recruiters

* Recruiter registration and login
* Company creation and management
* Job posting and management
* Applicant tracking
* Applicant resume download
* Accept/reject applications
* Automated application-status emails
* Role and ownership-based authorization

### 🤖 AI

* Job match score
* Skill-gap analysis
* Technical interview questions
* Behavioral interview questions
* Personalized preparation roadmap
* ATS resume generation using Groq AI

---

## 🏗️ Architecture

```mermaid
flowchart TD

    U[User Browser] --> F[React Frontend]
    F --> A[Axios API Layer]
    A --> B[Node.js + Express Backend]

    B --> AUTH[JWT + OTP Authentication]
    B --> RBAC[Role & Ownership Authorization]
    B --> USERS[User & Profile Controllers]
    B --> JOBS[Job & Company Controllers]
    B --> APPS[Application Controller]
    B --> AI[AI & Resume Services]
    B --> PAY[Credit & Payment Services]

    USERS --> C[Cloudinary]
    AUTH --> M[(MongoDB Atlas)]
    USERS --> M
    JOBS --> M
    APPS --> M
    AI --> M
    PAY --> M

    AI --> R[(Redis Cloud)]
    AI --> G[Groq AI]
    AI --> PDF[PDFKit]

    AUTH --> E[Resend]
    APPS --> E

    PAY --> RP[Razorpay]
```

---

## 🔄 Core Workflows

### AI Match

```text
User selects job
      ↓
Frontend sends job + candidate data
      ↓
Backend checks AI credits
      ↓
Check Redis cache
      ↓
Cache hit → return existing report
      ↓
Cache miss → deduct credit
      ↓
Resume extraction
      ↓
Groq AI analysis
      ↓
Generate match score + skill gaps
      ↓
Generate interview questions + roadmap
      ↓
Save report in MongoDB
      ↓
Cache report in Redis
      ↓
Return report to frontend
```

### Resume Generation

```text
Resume + Job Description
          ↓
        Groq AI
          ↓
Structured resume data
          ↓
        PDFKit
          ↓
Generated ATS Resume PDF
```

### Credit & Payment

```text
User selects credit plan
        ↓
Backend validates plan
        ↓
Create Razorpay order
        ↓
Razorpay Checkout
        ↓
Payment completed
        ↓
Backend verifies signature/status
        ↓
Payment marked as paid
        ↓
Credits added
```

### Application Status

```text
Job Seeker applies
      ↓
Application stored
      ↓
Recruiter reviews applicant
      ↓
Accept / Reject
      ↓
Backend verifies ownership
      ↓
Application status updated
      ↓
Resend sends email notification
```

---

## 🧰 Tech Stack

### Frontend

* React.js
* Vite
* Redux Toolkit
* Redux Persist
* React Router
* Tailwind CSS
* Axios
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Multer
* Zod
* Helmet
* Compression
* Express Rate Limit

### AI & Documents

* Groq AI
* PDF.js
* PDFKit

### Database & Storage

* MongoDB Atlas
* Redis Cloud
* Cloudinary

### Authentication & Email

* JWT HTTP-only cookies
* Email/password authentication
* Email OTP authentication
* Resend

### Payments

* Razorpay
* Server-side signature verification
* Credit transaction management

### DevOps

* Docker
* Docker Compose
* Nginx
* GitHub Actions
* Render

---

## 🗄️ Database

Main collections:

```text
Users
Companies
Jobs
Applications
InterviewReports
Payments
CreditTransactions
```

Important relationships:

```text
User
 ├── Profile
 ├── Resume
 ├── AI Credits
 └── Applications

Company
 └── Jobs

Job
 └── Applications

User + Job
 └── Interview Report
```

A compound database constraint prevents duplicate applications for the same job.

---

## 🔐 Security

* bcrypt password hashing
* JWT authentication
* HTTP-only cookies
* Secure production cookies
* OTP expiry and attempt limits
* Role-based authorization
* Recruiter ownership checks
* Zod request validation
* API rate limiting
* Helmet security headers
* File type and size validation
* Backend-controlled payment amounts
* Razorpay signature verification
* Backend-controlled AI credits
* Environment-based secrets

---

## 🐳 Run with Docker

### Prerequisites

* Docker Desktop
* MongoDB / MongoDB Atlas
* Redis / Redis Cloud
* Groq API key
* Cloudinary account
* Resend API key
* Razorpay test credentials

### Configure

```text
backend/.env
frontend/.env
```

### Start

```bash
docker compose up --build
```

### Services

```text
Frontend → http://localhost:5173
Backend  → http://localhost:8000
Health   → http://localhost:8000/health
```

### Stop

```bash
docker compose down
```

---

## 🚀 Deployment

```text
Browser
   ↓
Render Static Site
   ↓
Render Web Service
   ↓
MongoDB Atlas
Redis Cloud
Cloudinary
Groq AI
Resend
Razorpay
```

### Production

* Frontend → Render Static Site
* Backend → Render Web Service
* Database → MongoDB Atlas
* Cache → Redis Cloud
* File Storage → Cloudinary
* AI → Groq
* Email → Resend
* Payments → Razorpay

---

## 📁 Project Structure

```text
JobSync/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
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
│   ├── Dockerfile
│   └── index.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── compose.yaml
├── .gitignore
└── README.md
```

---

## 🔮 Future Improvements

* Razorpay webhooks
* Verified production email domain
* Recruiter analytics
* Interview scheduling
* In-app notifications
* Real-time chat
* Editable AI resume preview
* Advanced job recommendations
* Automated unit/integration/E2E testing
* Centralized monitoring and logging

---

## 👨‍💻 Author

**Shayan Adhikary**

* GitHub: https://github.com/PULAK04
* Institution: NIT Jamshedpur
* Full-Stack Development
* Backend Engineering
* Generative AI
* Data Structures & Algorithms
* Cloud Deployment

---

