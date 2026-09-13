# AI CareerPilot – Placement Interview Defense Guide 🎓

This guide is specifically written to help students explain and defend the **AI CareerPilot** project in technical and HR placement interviews.

---

## 1. Project Pitch (30-Second Elevator Pitch)

> "AI CareerPilot is a production-level full-stack placement portal engineered with React 18, Python Flask REST API, MySQL/SQLite, and Google Gemini AI. It solves the fragmentation in student placement prep by integrating an AI Resume ATS Analyzer, AI Job Qualification Matcher, DSA Sandbox, Timed Aptitude Quizzes with weak-area diagnostics, and an AI Mock Interviewer—all summarized into an interactive **Placement Readiness Score Dashboard**."

---

## 2. System Architecture & Data Flow

```
[ React 18 + Vite Frontend ]
       │
       │ HTTP REST API + Bearer JWT Header
       ▼
[ Flask REST Controller Blueprints ]
       │
       ├── AuthService ───────────► [ Bcrypt Hashing & Flask-JWT-Extended ]
       ├── ReadinessService ──────► [ Weighted Score Engine (0-100) ]
       ├── AIService ─────────────► [ Gemini REST API | NLP Fallback Engine ]
       │
       ▼
[ SQLAlchemy ORM Layer ]
       │
       ▼
[ MySQL Database / SQLite Fallback ]
```

---

## 3. Core Database Models & ER Relationships

1. **User (1) ── (1) StudentProfile**:
   - `User` table holds authentication data (`email`, `password_hash`, `role`).
   - `StudentProfile` holds `headline`, `target_role`, `bio`, `resume_text`, `ats_score`, `ats_analysis`.

2. **StudentProfile (1) ── (N) Education / Skill / Project / Certification**:
   - Foreign key constraint `profile_id` with `cascade="all, delete-orphan"`.

3. **JobPosting (1) ── (N) JobApplication ── (1) User (Student)**:
   - Tracks application stages (`Saved`, `Applied`, `Interview`, `Selected`, `Rejected`) and AI skill match % (`ai_match_percentage`).

4. **DsaProblem (1) ── (N) DsaSubmission ── (1) User (Student)**:
   - Tracks user submission status (`Solved` / `Attempted`), score, and submission timestamp.

5. **AptitudeCategory (1) ── (N) AptitudeQuestion**:
   - Categorized by Quantitative, Logical, and Verbal topics. Stores explanations and correct options.

---

## 4. Key Engineering Highlights & Patterns

### A. Fallback Heuristic AI Design Pattern
- **Problem**: Relying solely on external cloud LLM APIs can cause single points of failure if API quotas run out, keys are unconfigured, or network latency spikes.
- **Solution**: Implemented a dual-engine `AIService`. It attempts to call the **Google Gemini REST API**; if unconfigured or unreachable, it seamlessly switches to an internal **NLP Heuristic Rule Engine** using keyword matrices, string-distance matching, and STAR behavioral criteria. The user experience is 100% smooth without crashing or hanging.

### B. Weighted Placement Readiness Formula
The overall readiness score (0-100) is calculated in `ReadinessService`:
$$\text{Readiness Score} = 0.15(\text{Profile}) + 0.20(\text{ATS}) + 0.25(\text{DSA}) + 0.20(\text{Aptitude}) + 0.20(\text{Mock Interview})$$

### C. Security Practices
- **Password Hashing**: Passwords stored using Werkzeug `pbkdf2:sha256` hashing.
- **JWT Protection**: Stateless API authentication using `Flask-JWT-Extended` with 7-day token expiration.
- **Role-Based Guards**: Backend decorators enforce role restrictions (`student`, `recruiter`, `admin`).
- **CORS Handling**: `Flask-CORS` restricts cross-origin request policies.

---

## 5. Potential Interview Questions & Model Answers

### Q1: How did you handle authentication and role management?
> **Answer**: "I used JWT (JSON Web Tokens). Upon successful login, the Flask backend issues a signed JWT token containing the user identity. The React frontend stores this in localStorage and injects it into every request via an Axios interceptor (`Authorization: Bearer <token>`). On the frontend, custom `ProtectedRoute` components verify token state and role permissions (`student`, `recruiter`, `admin`). On the backend, `@jwt_required()` decorators validate every protected route."

### Q2: How does the AI Resume ATS Analyzer calculate scores?
> **Answer**: "The ATS Analyzer compares the candidate's raw resume text against a target domain skill matrix (e.g. Full Stack, Data Science). It evaluates resume length, key contact fields, education references, and project achievements. It calculates a matching score (0-100), extracts missing domain keywords, identifies structural strengths, and outputs 3 actionable improvement tips."

### Q3: What database did you use, and how did you design for flexibility?
> **Answer**: "I used SQLAlchemy ORM with MySQL as the target production database via PyMySQL connector. To ensure zero-friction developer setup, I implemented a fallback in `config.py`: if `MYSQL_URL` is omitted, the backend automatically initializes a local SQLite database (`careerpilot.db`)."

### Q4: How did you implement real-time timed quizzes and weak-topic diagnostics?
> **Answer**: "In React, I built a custom countdown timer hook. When a user submits an Aptitude quiz, the backend compares candidate responses against `correct_option` records, computes total accuracy, and collects topic tags of missed questions into a `weak_topics` array to help students focus their revision."
