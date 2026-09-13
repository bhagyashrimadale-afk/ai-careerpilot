# AI CareerPilot – Smart Placement & Career Platform 🚀

Production-grade full-stack AI career development and campus placement management platform. Built with React.js, Python Flask REST API, MySQL / SQLite, JWT authentication, and Google Gemini LLM API integration.

---

## 🌟 Key Features

1. **Role-Based Access Control (RBAC)**: Dedicated workflows for **Student**, **Recruiter**, and **Admin** roles protected via JWT authentication and password hashing.
2. **Student Placement Profile**: Comprehensive tracking of Education, Technical Skills, Projects, Certifications, Target Role, and Resume text.
3. **AI Resume ATS Analyzer**: Calculates 0-100 ATS Score, extracts missing domain keywords, and generates actionable structural recommendations.
4. **AI Job Matcher**: Real-time qualification match percentage calculation comparing candidate profiles against job posting requirements.
5. **DSA Practice Sandbox**: Algorithm questions categorized by difficulty (Easy, Medium, Hard) and topics with interactive Python code execution and attempt tracking.
6. **Aptitude Tests**: Timed quizzes (Quantitative, Logical, Verbal) with interactive countdown timer, instant scoring, step-by-step explanations, and weak-topic diagnostics.
7. **AI Mock Interviewer**: Interactive Technical & HR question generator with AI evaluation on technical accuracy, clarity, and suggested improvements per answer.
8. **AI Career Roadmap**: Visual step-by-step milestone learning timeline tailored to target job roles and current skill gaps.
9. **Placement Readiness Score Dashboard**: Multi-factor weighted score engine (0-100) with interactive Recharts Radar Chart analytics.
10. **Job Application Tracker**: Kanban board pipeline (Saved, Applied, Interview, Selected, Rejected) with status updates and AI match ratings.
11. **System Notifications & Deadlines**: Instant notifications for drive deadlines, scheduled interviews, and practice reminders.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React.js 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Python 3.10+, Flask REST API, Flask-JWT-Extended, Flask-CORS, Flask-SQLAlchemy ORM
- **Database**: MySQL with PyMySQL connector (Auto-configures SQLite `careerpilot.db` fallback for effortless local runs)
- **AI Integration**: Google Gemini API (`gemini-2.5-flash`) + Intelligent Rule-Based NLP Heuristics Fallback Engine
- **Deployment**: Vercel (`vercel.json`) for Frontend & Render (`render.yaml` / `Procfile`) for Backend

---

## 🚀 Quick Start Guide (Local Setup)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL (Optional: app falls back to SQLite automatically if MySQL URL is omitted)

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed sample database (Creates demo accounts, jobs, DSA problems, aptitude quizzes)
python seed.py

# Start Flask Backend API (Runs on http://localhost:5000)
python run.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install Node modules
npm install

# Start Vite React Dev Server (Runs on http://localhost:3000)
npm run dev
```

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
|---|---|---|
| **Student** | `student@careerpilot.com` | `password123` |
| **Recruiter** | `recruiter@techcorp.com` | `password123` |
| **Admin** | `admin@careerpilot.com` | `password123` |

---

## ☁️ Deployment Instructions

### Deploy Backend on Render
1. Push repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New Web Service**.
3. Connect repository and select `backend` directory.
4. Set Build Command: `pip install -r requirements.txt && python seed.py`
5. Set Start Command: `gunicorn run:app`
6. Add Environment Variables:
   - `SECRET_KEY`: (Random secret key)
   - `JWT_SECRET_KEY`: (Random JWT secret)
   - `GEMINI_API_KEY`: (Your Google Gemini API Key - Optional)
   - `MYSQL_URL`: (Optional MySQL URL, e.g. `mysql+pymysql://user:pass@host:3306/dbname`)

### Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) -> **New Project**.
2. Select repository and set Root Directory to `frontend`.
3. Set Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api`
5. Deploy! `vercel.json` will automatically route Single Page App (SPA) routes.
