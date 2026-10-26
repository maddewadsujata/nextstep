# NextStep — Smart Internship & Career Management Portal

**Developed by Sujata**

NextStep is a production-grade, full-stack web application architected to connect students seeking technology internships, employers managing recruiting pipelines, and platform administrators overseeing quality and security.

---

## 🌟 Key Highlights & Personalized Attribution

- **Lead Architect & Developer**: Developed by **Sujata**
- **Personalized Student Experience**: Dedicated student greeting (**"Welcome back, Sujata!"**) with profile completeness diagnostics, recommended positions, and active application lifecycle tracking.
- **Default Demo Persona**: Sujata (`sujata@student.nextstep.edu`), a Computer Science & AI student with pre-seeded projects, resume, certifications, and active interview schedules.
- **Enterprise Multi-Role Architecture**: Real role-based access control supporting Students, Verified Recruiters (Marcus Vance), and Administrators (Elena Rostova). Real users can also register their own accounts and see their actual names.

---

## 🚀 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend & Middleware**: Node.js Express server (`server.ts`) with Vite dev middleware mounting.
- **AI Career Intelligence**: Server-side Google Gemini 3.8 (`@google/genai` SDK using `gemini-3.8-flash`) with graceful heuristic fallbacks when keys are pending.
- **Database & Security**: Firebase Cloud Firestore with declarative Role-Based Access Control (`firestore.rules`) and intermediate schema representation (`firebase-blueprint.json`).

---

## 💡 AI Career Intelligence Suite

1. **Resume ATS Analyzer (`/api/ai/resume-analyzer`)**:
   - Parses resume text against target tech roles.
   - Computes ATS readiness score (0-100), extracts core technical skills, identifies missing sections, and generates actionable prioritized recommendations.

2. **Internship Match Score (`/api/ai/match-score`)**:
   - Compares student profile competencies and projects directly against job requirements.
   - Highlights matched skills, skill gaps, and personalized tips.

3. **Skill Gap Roadmap (`/api/ai/skill-gap`)**:
   - Benchmarks student competencies against a target dream role.
   - Outlines structured multi-week learning phases with suggested real-world capstone projects.

4. **Tailored Cover Letter Assistant (`/api/ai/cover-letter`)**:
   - Drafts role-specific cover letters referencing actual collegiate projects and qualifications.
   - Fully editable by the student before submission.

5. **Mock Interview Practice Simulator (`/api/ai/interview-prep` & `/api/ai/interview-feedback`)**:
   - Generates role-specific Technical, Architecture, and Behavioral (STAR) questions.
   - Evaluates candidate answers with scores, strengths, and model revisions.

6. **Career Advisor Chatbot (`/api/ai/chat`)**:
   - Context-aware mentor assisting with salary discussions, technical questions, and ATS optimization.

---

## 👥 Three Role-Based Portals

### 1. Student Portal
- Personalized dashboard with readiness percentage, upcoming interviews, and saved opportunities.
- Kanban & Table application tracking with real-time status transitions.
- Technical project portfolio and certification verification links.
- Interactive discovery with multi-parameter filtering (remote, domain, stipend, experience).

### 2. Recruiter / Employer Portal
- Opportunity management: Create, edit, duplicate, publish, and close listings.
- Kanban candidate hiring pipeline (Applied → Under Review → Shortlisted → Interview Scheduled → Offer Extended).
- Meeting scheduling dialog with direct Google Meet/Zoom links.
- Formal offer generator and applicant data export to CSV.
- Private internal candidate evaluation notes.

### 3. Administrator Console
- Platform oversight KPIs (total students, employers, listings, and applications).
- Recruiter corporate domain verification queue.
- Content moderation and community report triage.
- User management with suspension/reactivation audit logging.
- Immutable administrative audit logs.

---

## 🍃 MongoDB & Mongoose NoSQL Integration

NextStep includes a full-fledged MongoDB NoSQL persistence engine demonstrating document modeling, schema validation, and complete CRUD operations.

### Mongoose Internship Schema (`server/models/Internship.ts`)
- `title` (String, required, max 120 chars)
- `company` (String, required, max 100 chars)
- `location` (String, required)
- `skills` (Array of Strings, required, validated for ≥ 1 skill)
- `description` (String, required)
- `stipend` (String, default: "$3,500 / month")
- `openings` (Number, min: 1)
- `workType` (Enum: Remote | Hybrid | On-site)
- `createdAt` & `updatedAt` (Automatic timestamps via Mongoose `{ timestamps: true }`)

### MongoDB REST API Endpoints
- `POST /api/internships`: **Create** a new internship document with input validation.
- `GET /api/internships`: **Read** all internship documents sorted by creation date descending.
- `GET /api/internships/:id`: **Read** one specific document by its 24-char hex ObjectId.
- `PUT /api/internships/:id`: **Update** an existing document and re-run Mongoose schema validators.
- `DELETE /api/internships/:id`: **Delete** a document permanently after user confirmation.
- `POST /api/internships/seed`: Re-seed the collection with 4 standard sample internship records.
- `GET /api/db/status`: Check live MongoDB connection state, readyState, and driver version.
- `POST /api/db/connect`: Dynamically connect to custom MongoDB Atlas cluster or local mongod.

### Dual-Mode Architecture & Resiliency
- **Live Mode**: When `MONGODB_URI` points to a reachable MongoDB Atlas or local daemon, documents are persisted directly in MongoDB collections.
- **Graceful Fallback Store**: If `MONGODB_URI` is unconfigured or cluster credentials are pending, the backend automatically operates using an in-memory document store using genuine 24-character hex MongoDB ObjectIds (`new mongoose.Types.ObjectId()`), ensuring zero downtime or crashes.
- **Dynamic In-App Reconnection**: Users can input a MongoDB Atlas URI directly in the web UI under "Configure MongoDB URI" and test live connectivity without restarting the server.

---

## 🛠 Local Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server (Express + Vite)
npm run dev
```

Visit `http://localhost:3000` to interact with the portal.

### Environment Configuration (`.env`)
```env
# Optional Gemini API key (Server-side only)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# MongoDB Connection String (Atlas or Local)
# Local:
MONGODB_URI="mongodb://127.0.0.1:27017/nextstep"

# Atlas Cloud Cluster:
# MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/nextstep?retryWrites=true&w=majority"
```

---

## 📋 Testing & Verification Checklist

- [x] **MongoDB CREATE**: Add new internship records through the web form with validation.
- [x] **MongoDB READ**: View all saved records in the database table and inspect individual documents in JSON/BSON format.
- [x] **MongoDB UPDATE**: Edit existing records and update fields through `PUT /api/internships/:id`.
- [x] **MongoDB DELETE**: Remove records with confirmation dialog via `DELETE /api/internships/:id`.
- [x] **MongoDB ObjectId Validation**: 24-character hexadecimal IDs validated using `mongoose.Types.ObjectId.isValid()`.
- [x] **Live & Fallback Resiliency**: Works seamlessly both with live MongoDB Atlas and with in-memory Mongoose store.
- [x] **Dynamic Reconnect**: Configure and test MongoDB connection strings live from the web UI.
- [x] **Viva & Presentation Prep**: Built-in faculty viva cheat sheet explaining NoSQL vs SQL, Mongoose ODM, and ObjectId architecture for Sujata.
- [x] **Student personalized dashboard**: Displays "Welcome back, Sujata!" with profile readiness and MongoDB launch portal.
- [x] **1-Click persona switcher**: Seamlessly toggle between Sujata (Student), Marcus (Recruiter), and Elena (Admin).
- [x] **Application lifecycle**: Moves dynamically from Applied to Interview and Offer with celebration confetti.
- [x] **Server-side Gemini AI**: Resume ATS analyzer, match scorer, skill gap roadmap, and career advisor.
