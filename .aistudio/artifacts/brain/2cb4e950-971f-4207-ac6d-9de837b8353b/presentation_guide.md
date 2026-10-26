# NextStep — Presentation & Viva Action Guide

**Project:** NextStep — Smart Internship & Career Management Portal  
**Candidate / Student Lead:** Sujata Maddewad  
**Recruiter Persona:** Sakshi Maddewad  
**Admin Persona:** Mayank Maddewad  

---

## Quick Presentation Script Cheat Sheet (Click / Screen / Say)

### 1. Home / Landing Page
- **Click:** Explore Internships (or Get Started)
- **Screen:** Smoothly scrolls down to the verified internship directory with search filters and domain tags.
- **Say:** *“Welcome to NextStep. From our home page, students can browse verified tech internships or jump straight into their personalized career suite.”*

- **Click:** Dark / Light Mode icon in top navigation
- **Screen:** Seamlessly switches the whole platform between modern dark and crisp light themes.
- **Say:** *“The user interface supports instant theme switching, keeping visual preferences saved across browsing sessions.”*

---

### 2. Sign In / Register / Logout
- **Click:** Sign In (or Register)
- **Screen:** Opens the authentication screen with tabs for Student, Recruiter, and Admin logins.
- **Say:** *“Our platform enforces secure role-based access control, routing students, recruiters, and admins to their respective protected environments.”*

- **Click:** Demo Role Switcher pills (Sujata / Sakshi / Mayank)
- **Screen:** Instantly switches the active authenticated session without requiring re-entry of passwords.
- **Say:** *“For this live viva demonstration, I can switch between student Sujata, recruiter Sakshi, and platform admin Mayank with a single click.”*

- **Click:** Sign Out icon in top navigation
- **Screen:** Clears credentials, terminates active session, and redirects safely to the landing page.
- **Say:** *“Clicking Sign Out securely flushes the user session and returns to public view.”*

---

### 3. Student Dashboard
- **Click:** Dashboard in top navigation
- **Screen:** Displays Sujata’s profile completion readiness meter, upcoming interview banner, and quick metrics.
- **Say:** *“This is Sujata Maddewad’s student dashboard, providing real-time tracking of her readiness score, active applications, and scheduled interviews.”*

---

### 4. Student Profile
- **Click:** Profile (or Edit Profile)
- **Screen:** Displays academic background, verified technical skills, portfolio links, and parsed resume preview.
- **Say:** *“Here students maintain their technical skill tags, GitHub portfolio, and uploaded resume parsed by our system.”*

- **Click:** Save Profile
- **Screen:** Persists updated skills and bio directly to MongoDB with an instant success confirmation toast.
- **Say:** *“All profile updates synchronize in real time to MongoDB, ensuring recruiters always see the candidate’s latest qualifications.”*

---

### 5. Discover Internships
- **Click:** Discover (or domain filters: Frontend, AI/ML, Cloud, Full Stack)
- **Screen:** Filters active internship opportunities with real-time keyword matching and stipend badges.
- **Say:** *“Students can filter internships by domain, work mode like Remote or Hybrid, and stipend range with instant results.”*

---

### 6. Internship Details
- **Click:** View Details on any internship card
- **Screen:** Opens modal detailing job responsibilities, required skills, stipend, location, and company credentials.
- **Say:** *“Clicking View Details provides full transparency on stipend terms, prerequisites, and verified employer background.”*

---

### 7. Apply for Internship
- **Click:** Apply Now
- **Screen:** Confirmation modal appears displaying the candidate resume, cover pitch box, and submit button.
- **Say:** *“By clicking Apply Now, the student attaches their resume and personalized note directly into the recruiter’s pipeline.”*

---

### 8. My Applications & Application Status
- **Click:** My Applications
- **Screen:** Shows all applied internships tracked across a 7-stage lifecycle (Applied → Reviewing → Shortlisted → Interview Scheduled → Offer → Accepted).
- **Say:** *“In My Applications, students experience complete transparency over their hiring status, eliminating the traditional recruitment black hole.”*

---

### 9. Withdraw Application
- **Click:** Withdraw Application on an active submission
- **Screen:** Confirms withdrawal, updates application status to 'Withdrawn' in MongoDB, and removes candidate from the active review queue.
- **Say:** *“Students have full autonomy to withdraw their application at any time, immediately freeing the recruiter’s pipeline.”*

---

### 10. AI Career / Application Assistance
- **Click:** AI Career Suite → ATS Score Analyzer
- **Screen:** Evaluates the uploaded resume against industry benchmarks, returning an ATS score (0–100) and missing keyword recommendations.
- **Say:** *“Our Gemini AI engine parses the student resume, computing an objective ATS compatibility score with targeted improvement feedback.”*

- **Click:** AI Career Suite → Career Roadmap
- **Screen:** Generates a personalized 4-week step-by-step roadmap to bridge skill gaps for target software roles.
- **Say:** *“Here Gemini analyzes the delta between Sujata’s current skillset and industry demands to construct a targeted 4-week learning roadmap.”*

- **Click:** AI Support Chatbot (bottom-right sparkles icon)
- **Screen:** Opens an interactive 24/7 AI career counseling assistant answering questions about interview preparation, salary standards, and resumes.
- **Say:** *“Our embedded AI Career Assistant answers candidate questions regarding salary benchmarks, cover letters, and technical interview prep.”*

---

### 11. Interview Section & Upcoming Interviews
- **Click:** Upcoming Candidate Interview section on Dashboard
- **Screen:** Displays candidate Sujata Maddewad, recruiter Sakshi Maddewad, Software Development Intern, scheduled time (11:00 AM), and the Join Interview button.
- **Say:** *“Both student and recruiter see the identical synchronized interview schedule with position, time, and real-time meeting room access.”*

---

### 12. Join Interview (Real WebRTC Meeting Room)
- **Click:** Join Interview
- **Screen:** Opens the live meeting room (`/meeting/:id`) with camera/mic pre-join hardware preview and meeting details.
- **Say:** *“Clicking Join Interview opens our real-time WebRTC room, pre-checking camera and microphone access before entering.”*

- **Click:** Join Interview Now (on pre-join screen)
- **Screen:** Connects to the live meeting over WebRTC peer connection, streaming encrypted audio and video between candidate and recruiter.
- **Say:** *“Entering the room establishes real-time peer-to-peer audio and video transmission with live in-call messaging.”*

---

### 13. Meeting Room Controls & Multi-Device Call
- **Click:** Mic, Camera, or Share Screen buttons
- **Screen:** Instantly toggles hardware device streams with live visual indicators and broadcasts status to the other peer.
- **Say:** *“The meeting controls allow muting, camera toggle, screen sharing, participants drawer, and text chat.”*

- **Click:** Copy Meeting Link
- **Screen:** Copies the public HTTPS meeting URL (`/meeting/:id`) to clipboard.
- **Say:** *“Because our meeting links are public HTTPS URLs, the recruiter can join from a laptop while the candidate joins from a phone.”*

---

### 14. Leave Interview
- **Click:** Leave Interview (and confirm in dialog)
- **Screen:** Stops camera/microphone hardware tracks immediately, disconnects peer connection, keeps the other participant active, and navigates back to dashboard.
- **Say:** *“Clicking Leave Interview gracefully releases camera and microphone hardware, disconnects the user, and keeps the other party connected.”*

---

### 15. Interview Evaluation & Recruiter Feedback
- **Click:** Recruiter completes the call → Candidate Evaluation Modal opens
- **Screen:** Recruiter fills star ratings (Technical, Problem Solving, Communication, Fit), selects recommendation (Strong Hire / Hire / Next Round / Reject), and saves notes to MongoDB.
- **Say:** *“Upon exiting, the recruiter is prompted with a structured evaluation scorecard to rate Sujata’s technical competency and save interview notes to MongoDB.”*

---

### 16. Recruiter Dashboard
- **Click:** Switch to Recruiter persona (Sakshi Maddewad) or click Dashboard
- **Screen:** Displays company profile for Persistent Systems, active postings, total applicant counts, and upcoming interviews.
- **Say:** *“This is the Recruiter Portal for Sakshi Maddewad, providing full oversight of active job postings and candidate pipelines.”*

---

### 17. Post Internship
- **Click:** Post Internship button
- **Screen:** Modal to input role title, stipend, required skills, and deadline, saving the new opportunity to MongoDB.
- **Say:** *“Recruiters can publish new internship listings with required skills, stipend details, and application deadlines.”*

---

### 18. Manage Internships
- **Click:** Manage Internships in navigation
- **Screen:** Lists published company postings with applicant counters, edit controls, and active/closed status toggles.
- **Say:** *“Recruiters monitor applicant volume for each posting and can pause or close applications when vacancies are filled.”*

---

### 19. Applicant Pipeline (Kanban Board)
- **Click:** Applicant Pipeline in navigation
- **Screen:** Displays a visual Kanban pipeline across Applied, Reviewing, Shortlisted, Interview Scheduled, and Offer stages.
- **Say:** *“The Applicant Pipeline provides a visual Kanban board to review candidate resumes, check ATS match scores, and progress candidates.”*

---

### 20. Candidate Details & Shortlist/Reject
- **Click:** View Candidate Card or change status dropdown
- **Screen:** Shows candidate resume, GitHub/LinkedIn links, cover note, and updates candidate status with automated notification.
- **Say:** *“With one click, the recruiter shortlists Sujata or schedules an interview, instantly triggering a notification on her dashboard.”*

---

### 21. Admin Dashboard & User Management
- **Click:** Switch to Admin persona (Mayank Maddewad) or click Admin
- **Screen:** Displays platform-wide analytics: total student registrations, verified recruiters, active internships, and server health.
- **Say:** *“Here is the Admin Console managed by Mayank Maddewad, giving full observability over platform growth, user trust, and safety.”*

- **Click:** User Management tab
- **Screen:** Lists all registered students, recruiters, and admins with institution details and verification toggle buttons.
- **Say:** *“Administrators verify recruiter credentials, review registered institutions, and manage platform permissions.”*

---

### 22. Moderation & Audit Logs
- **Click:** Content Moderation tab
- **Screen:** Displays flagged internship reports with one-click Approve or Remove actions.
- **Say:** *“Administrators review flagged listings to protect students from suspicious postings or unpaid stipend violations.”*

- **Click:** Audit Logs tab
- **Screen:** Streams real-time tamper-evident system logs detailing logins, status changes, and interview events with timestamps.
- **Say:** *“Our tamper-evident audit log tracks all critical operations including logins, status changes, and interview sessions.”*

---

### 23. Notifications
- **Click:** Notification Bell in header
- **Screen:** Displays dropdown list of recent alerts (status updates, interview invitations, system notices) with mark-as-read controls.
- **Say:** *“The Notification Center keeps users updated on application milestones, recruiter reviews, and upcoming interviews in real time.”*

---

### 24. Public Deployment & Multi-Device Access
- **Click:** Direct URL / Public link access on phone, tablet, or secondary laptop
- **Screen:** SPA client routing loads seamlessly without 404s, localhost dependencies, or broken API requests.
- **Say:** *“Our server configuration supports direct deep-linking, allowing candidates to open interview links straight from their phone browser.”*
