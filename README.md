# Bug Replier - AI-Powered SaaS Code Auditor

Bug Replier is a production-ready, fully functional MERN Stack SaaS application that analyzes source code for syntax errors, logical bugs, and performance problems. It features subscription plan validation (Free/Prime), history archives, automatic scrolling video report generations via FFmpeg, and email report integration via Nodemailer.

---

## 🚀 Key Features

1. **AI Code Diagnostics**: Paste code into our Monaco Editor workspace, select from 19+ languages, and generate analysis containing:
   - **Error Summary**: What is broken.
   - **Root Cause**: Why it failed.
   - **Corrected Code**: Drop-in fixed script blocks.
   - **Explanation**: Beginner-friendly description of lessons.
2. **Interactive Hero Canvas**: Neural network connections particle network animation matching the Cyberpunk theme.
3. **Credit Management Limiters**:
   - **Free Plan**: Restricted to 5 audits per calendar day. History kept for 7 days.
   - **Prime Plan**: Unlimited audits, priority processing, PDF/report downloads, video explanations, and email delivery.
4. **Programmatic Video explanations**: Prime users can request a short MP4 slide slideshow video compilation explaining their bug report, rendered via FFmpeg.
5. **On-Demand Email Audits**: Deliver clean HTML-formatted bug reports directly to your inbox using SMTP.
6. **Admin Dashboard**: Analytics widgets (total users, subscription distribution ratios, average analyses per user), upgrade controls, and CASCADE delete operations.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite, Monaco Editor, tsParticles, Framer Motion, Axios, Lucide React
- **Backend**: Node.js, Express, TypeScript, Mongoose, JWT, Bcrypt, Nodemailer, FFmpeg
- **Database**: MongoDB

---

## ⚙️ Project Folder Structure

```
bug-replier/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurations
│   │   ├── controllers/     # Controller layers (Auth, Analysis, Subscription, etc.)
│   │   ├── middleware/      # Middlewares (Auth, Subscription tracking, Admin limits)
│   │   ├── models/          # Mongoose Schemas (User, Analysis)
│   │   ├── routes/          # Express Routers
│   │   ├── services/        # AI Service, Nodemailer SMTP service, FFmpeg compiler service
│   │   └── index.ts         # Main Entrypoint
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── components/      # UI Shell layouts and Particle Background
    │   ├── context/         # React Authentication state contexts
    │   ├── pages/           # Pages (Landing, Dashboard, Workspace, Admin, etc.)
    │   ├── utils/           # Axios interceptors
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 📦 Getting Started & Installation

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** (running locally on port `27017` or a cloud MongoDB Atlas cluster URI)
- **FFmpeg** (installed and loaded in your system environment PATH variable for the backend video generation engine. If FFmpeg is not detected, the backend will resolve to a sample fallback URL to prevent crashes)

### Setup & Configurations

1. **Clone & Open Project Workspace**:
   Open the root workspace subdirectory:
   ```bash
   cd C:\Users\sunny\.gemini\antigravity\scratch\bug-replier
   ```

2. **Configure Backend Environment**:
   Navigate to the backend and update the `.env` settings:
   ```bash
   cd backend
   ```
   Create or modify the `.env` file (which is pre-generated with standard developer values):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bug-replier
   JWT_SECRET=super_secret_bug_replier_jwt_key_12345
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=
   SMTP_PASS=
   FROM_EMAIL=noreply@bugreplier.com
   FRONTEND_URL=http://localhost:5173
   ```
   *(Note: If no API keys are provided, the system executes a Mock static analysis based on common syntax heuristics so you can inspect UI features immediately)*

3. **Install Backend Dependencies**:
   ```bash
   npm install
   ```

4. **Install Frontend Dependencies**:
   Navigate to the frontend folder and install:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🏃 Run Applications

We recommend starting both backend and frontend servers in separate terminal instances:

### 1. Launch Node/Express API Server (Port 5000):
```bash
cd backend
npm run dev
```

### 2. Launch React Vite Server (Port 5173):
```bash
cd frontend
npm run dev
```

Open your web browser and navigate to `http://localhost:5173` to explore **Bug Replier**!

---

## 💡 Quick Tips for Testers

- **First Account Created is Admin**: The first account that registers on your local database is automatically assigned the `Admin` role. This allows you to explore the admin control panel immediately! Subsequent registrations will receive the standard `User` role.
- **Mock Fallback**: If you don't have a Gemini API key yet, type some JS code containing `var` declarations or `==` loose comparison. The system detects this offline and returns dynamic correction feedback instantly!
- **Upgrade Flow**: Click the Upgrade link in the dashboard or pricing menu. It directly updates your database status to Prime, letting you explore video creation and email logs.
