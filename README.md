# JobSync — AI-Powered Recruitment & Career Intelligence Platform

**JobSync** is an AI-powered recruitment and career intelligence platform built using the MERN stack. It helps job seekers find suitable jobs, apply to opportunities, generate AI-based job match reports, identify skill gaps, prepare for interviews, and download ATS-optimized resumes tailored to specific job descriptions.

The platform also provides recruiter-side workflows for posting jobs, managing companies, viewing applicants, and accepting or rejecting applications.

---

## Live Demo

* **Frontend:** [Live](https://jobsync-frontend2.onrender.com)
* **Backend:**[Live](https://jobsync-6tv7.onrender.com)
* **GitHub Repository:** [Github Repo](https://github.com/PULAK04/JobSync)

---

## Features

### Job Seeker Features

* User registration and login
* Secure JWT-based authentication
* Profile creation and update
* Resume upload using Cloudinary
* Browse and search jobs
* Apply to jobs
* Save jobs for later
* View applied jobs
* Generate AI Match Reports
* Download AI-generated ATS-optimized resume PDF
* View previously generated Match Reports

### Recruiter Features

* Recruiter registration and login
* Company creation and management
* Post new jobs
* View posted jobs
* View applicants for each job
* Accept or reject job applications

### AI-Powered Features

* AI-based job match score generation
* Resume and job description comparison
* Skill gap analysis
* Technical interview question generation
* Behavioral interview question generation
* Personalized interview preparation roadmap
* ATS-optimized resume generation using Gemini AI
* PDF resume download using PDFKit

### Redis Caching Features

* Redis Cloud integration for caching AI-generated match reports
* Cached interview report history for faster response
* Cache invalidation when new reports are generated
* Reduced repeated Gemini API calls and MongoDB queries

---

## Tech Stack

### Frontend

* React.js
* Redux Toolkit
* React Router DOM
* Tailwind CSS
* Axios
* Framer Motion
* React Icons
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Cookie Parser
* Multer
* Cloudinary
* PDFKit
* Redis Cloud
* ioredis
* Gemini AI API

### Database and Cloud Services

* MongoDB Atlas
* Redis Cloud
* Cloudinary
* Render
* Vercel / Render Static Site

---

## Project Structure

```txt
JobSync/
│
├── backend/
│   ├── controllers/
│   │   ├── application.controller.js
│   │   ├── company.controller.js
│   │   ├── interview.controller.js
│   │   ├── job.controller.js
│   │   └── user.controller.js
│   │
│   ├── middlewares/
│   │   ├── isAuthenticated.js
│   │   └── multer.js
│   │
│   ├── models/
│   │   ├── application.model.js
│   │   ├── company.model.js
│   │   ├── interviewReport.model.js
│   │   ├── job.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── application.route.js
│   │   ├── company.route.js
│   │   ├── interview.route.js
│   │   ├── job.route.js
│   │   └── user.route.js
│   │
│   ├── services/
│   │   └── ai.service.js
│   │
│   ├── utils/
│   │   ├── cloudinary.js
│   │   ├── datauri.js
│   │   ├── db.js
│   │   └── redis.js
│   │
│   ├── index.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── interview/
│   │   ├── redux/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── README.md
└── .gitignore
```

---

## Backend API Routes

### User Routes

```txt
POST   /api/v1/user/register
POST   /api/v1/user/login
GET    /api/v1/user/logout
POST   /api/v1/user/profile/update
```

### Job Routes

```txt
POST   /api/v1/job/post
GET    /api/v1/job/get
GET    /api/v1/job/getadminjobs
GET    /api/v1/job/get/:id
```

### Company Routes

```txt
POST   /api/v1/company/register
GET    /api/v1/company/get
GET    /api/v1/company/get/:id
PUT    /api/v1/company/update/:id
```

### Application Routes

```txt
GET    /api/v1/application/apply/:id
GET    /api/v1/application/get
GET    /api/v1/application/:id/applicants
POST   /api/v1/application/status/:id/update
```

### AI Match Report Routes

```txt
POST   /api/v1/interview
GET    /api/v1/interview
GET    /api/v1/interview/report/:interviewId
POST   /api/v1/interview/resume/pdf/:interviewReportId
```

---

## AI Match Report Flow

```txt
User selects a job
        ↓
Frontend sends job title, job description, user bio, and resume URL
        ↓
Backend fetches and extracts resume content
        ↓
Gemini AI compares resume with job description
        ↓
AI generates match score, skill gaps, interview questions, and preparation roadmap
        ↓
Report is saved in MongoDB
        ↓
Report is cached in Redis
        ↓
User is redirected to Match Report page
```

---

## Redis Usage

Redis Cloud is used to improve performance and reduce repeated expensive operations.

### Redis is used for:

* Caching generated AI Match Reports
* Caching user Match Report history
* Reducing repeated MongoDB queries
* Reducing repeated Gemini AI API calls
* Improving response time for repeated downloads and report views

### Example Redis Keys

```txt
report:userId:jobTitle
history:userId
resume-pdf:userId:interviewReportId
```

---

## Key Functional Highlights

### AI Job Matching

The platform uses Gemini AI to compare the candidate's resume and self-description with a job description. It generates a match score and identifies how well the candidate fits the role.

### Skill Gap Analysis

The AI identifies missing or weak skills based on the target job description and suggests areas for improvement.

### Interview Preparation

The system generates technical questions, behavioral questions, and a personalized preparation roadmap for the candidate.

### ATS Resume Generation

The system uses Gemini AI to generate ATS-optimized resume content based on the candidate's resume and the selected job description. PDFKit is used to convert the AI-generated content into a downloadable PDF.

### Redis Caching

Redis Cloud is used to cache AI reports and report history. This improves performance and reduces unnecessary AI API calls.

---

## Deployment

### Frontend Deployment

Frontend is deployed on:

* Render Static Site


### Backend Deployment

Backend is deployed on:

* Render



### Database and Services

* MongoDB Atlas for database
* Redis Cloud for caching
* Cloudinary for resume/profile file storage
* Gemini API for AI generation

---

## Future Improvements

* Add email notifications for job applications
* Add recruiter analytics dashboard
* Add interview scheduling system
* Add real-time chat between recruiter and candidate
* Add advanced resume scoring
* Add payment-based premium AI reports
* Add Docker support for full local development
* Add admin dashboard for platform management

---

## Author

**Pulak**

* GitHub: [PULAK04](https://github.com/PULAK04)
* Institution: NIT Jamshedpur
* Interest Areas: MERN Stack Development, AI Integration, Data Structures and Algorithms

---

## License

This project is for educational and portfolio purposes.

