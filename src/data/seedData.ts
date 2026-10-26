import { 
  User, 
  StudentProfile, 
  RecruiterProfile, 
  Internship, 
  Application, 
  AppNotification, 
  ContentReport, 
  AuditLog 
} from '../types';

export const SUJATA_STUDENT_ID = 'user-student-sujata-01';
export const MARCUS_RECRUITER_ID = 'user-recruiter-marcus-01';
export const ELENA_ADMIN_ID = 'user-admin-elena-01';

export const INITIAL_USERS: User[] = [
  {
    id: SUJATA_STUDENT_ID,
    name: 'Sujata Maddewad',
    email: 'sujata@student.nextstep.edu',
    role: 'student',
    status: 'active',
    createdAt: '2026-08-15T09:00:00Z',
    avatarUrl: '',
    isDemo: true,
  },
  {
    id: MARCUS_RECRUITER_ID,
    name: 'Sakshi Maddewad',
    email: 'sakshi@persistent.com',
    role: 'recruiter',
    status: 'active',
    createdAt: '2026-07-10T11:20:00Z',
    avatarUrl: '',
    isDemo: true,
  },
  {
    id: ELENA_ADMIN_ID,
    name: 'Mayank Maddewad',
    email: 'mayank.admin@nextstep.org',
    role: 'admin',
    status: 'active',
    createdAt: '2026-06-01T08:00:00Z',
    avatarUrl: '',
    isDemo: true,
  }
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  userId: SUJATA_STUDENT_ID,
  fullName: 'Sujata Maddewad',
  email: 'sujata@student.nextstep.edu',
  avatarUrl: '',
  phone: '+91 98234 56789',
  college: 'Pune Institute of Computer Technology (PICT), Pune',
  degree: 'Bachelor of Engineering (B.E.) / B.Tech',
  branch: 'Computer Engineering (Software Systems & AI)',
  graduationYear: '2027',
  cgpa: '9.4 / 10.0',
  skills: [
    'React',
    'TypeScript',
    'JavaScript',
    'Python',
    'Node.js',
    'Tailwind CSS',
    'REST APIs',
    'Git & GitHub',
    'MongoDB',
    'Express',
    'SQL',
    'Docker basics',
  ],
  preferredRoles: [
    'Software Development Engineer Intern',
    'Full-Stack Developer Intern',
    'Frontend React Developer Intern',
    'AI / ML Engineering Intern',
  ],
  preferredLocations: ['Pune, Maharashtra', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Remote (India)'],
  remotePreference: 'Flexible',
  resumeName: 'Sujata_Maddewad_Resume.pdf',
  resumeText: `Sujata Maddewad
B.Tech in Computer Engineering | Pune Institute of Computer Technology (PICT), Pune
Email: sujata@student.nextstep.edu | Phone: +91 98234 56789 | Location: Pune, Maharashtra
LinkedIn: linkedin.com/in/sujata-maddewad | GitHub: github.com/sujata-maddewad

EDUCATION
B.Tech / B.E. in Computer Engineering
Pune Institute of Computer Technology (PICT), Pune | Savitribai Phule Pune University (SPPU)
CGPA: 9.4 / 10.0 | Expected Graduation: 2027
Relevant Coursework: Data Structures & Algorithms, Object-Oriented Programming, Database Management Systems (DBMS), Web Technologies, Operating Systems, Cloud Computing.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, C++, Java, SQL, HTML5/CSS3
- Frameworks & Libraries: React, Node.js, Express, Tailwind CSS, PyTorch, Scikit-learn
- Developer Tools: Git, GitHub, Docker, Postman, Vite, MongoDB, Linux

PROJECTS
1. NextStep — Smart Internship & Career Management Portal (Lead Architect & Developer)
- Architected a responsive career portal with role-based dashboards, AI-assisted resume analyzer, and recruitment pipeline.
- Implemented real-time Kanban tracking, dynamic search with multi-filters, and Gemini-powered skill gap roadmaps.
- Built robust backend REST APIs with Node.js, Express, and MongoDB Mongoose document store.

2. NeuralVision — Multi-Modal Plant Disease Detection System
- Built an image classification model with 96.2% validation accuracy using PyTorch and Transfer Learning (ResNet-50).
- Deployed a lightweight React + FastAPI client allowing farmers across Maharashtra to upload leaf photos for immediate diagnostics.

3. CloudNotes — Collaborative Real-Time Note Taking App
- Developed a collaborative markdown workspace utilizing WebSockets, state synchronizations, and optimistic UI updates.

CERTIFICATIONS & ACHIEVEMENTS
- Cisco: Introduction to Modern AI
- Cisco: Data Analytics Essentials
- Practical Use of AI Tools in Industry (S4DS, MITAOE)
- Anthropic: AI Fluency for Educators, Claude 101 & Claude Code 101
- IBM SkillsBuild: Web Development Basics
- Larsen & Toubro (L&T) Industry Ready Engineering Program
- Technical Club Coordinator at PICT Pune`,
  portfolioUrl: '',
  linkedinUrl: 'https://linkedin.com/in/sujata-maddewad',
  githubUrl: 'https://github.com/maddewadsujata/',
  projects: [
    {
      id: 'proj-1',
      title: 'NextStep — Smart Internship & Career Portal',
      description: 'Full-stack platform connecting students with recruiters featuring AI resume insights and hiring pipeline.',
      techTags: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'MongoDB'],
      link: 'https://github.com/maddewadsujata/nextstep',
    },
    {
      id: 'proj-2',
      title: 'NeuralVision Image Diagnostic',
      description: 'Transfer learning PyTorch pipeline deployed with React and FastAPI achieving 96% classification accuracy.',
      techTags: ['Python', 'PyTorch', 'FastAPI', 'React', 'Docker'],
      link: 'https://github.com/maddewadsujata/neural-vision',
    },
    {
      id: 'proj-3',
      title: 'CloudNotes Real-Time Workspace',
      description: 'Real-time collaborative markdown editor with optimistic updates and conflict-free synchronizations.',
      techTags: ['TypeScript', 'WebSockets', 'Express', 'Tailwind'],
      link: 'https://github.com/maddewadsujata/cloudnotes',
    }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Introduction to Modern AI',
      issuer: 'Cisco Networking Academy',
      year: '2025',
      credentialUrl: '',
    },
    {
      id: 'cert-2',
      name: 'Data Analytics Essentials',
      issuer: 'Cisco Networking Academy',
      year: '2025',
      credentialUrl: '',
    },
    {
      id: 'cert-3',
      name: 'Practical Use of AI Tools in Industry',
      issuer: 'Society for Data Science (S4DS) & MITAOE',
      year: '2025',
      credentialUrl: '',
    },
    {
      id: 'cert-4',
      name: 'AI Fluency for Educators',
      issuer: 'Anthropic',
      year: '2025',
      credentialUrl: '',
    },
    {
      id: 'cert-5',
      name: 'Claude 101',
      issuer: 'Anthropic',
      year: '2025',
      credentialUrl: '',
    },
    {
      id: 'cert-6',
      name: 'Claude Code 101',
      issuer: 'Anthropic',
      year: '2026',
      credentialUrl: '',
    },
    {
      id: 'cert-7',
      name: 'Web Development Basics',
      issuer: 'IBM SkillsBuild',
      year: '2024',
      credentialUrl: '',
    },
    {
      id: 'cert-8',
      name: 'Industry Ready Engineering Program',
      issuer: 'Larsen & Toubro (L&T)',
      year: '2025',
      credentialUrl: '',
    },
  ],
  experienceLevel: 'Student',
  weeklyGoals: [
    { id: 'goal-1', text: 'Solve 5 LeetCode Dynamic Programming problems', completed: true },
    { id: 'goal-2', text: 'Complete System Design fundamentals chapter', completed: true },
    { id: 'goal-3', text: 'Apply to 3 Software Engineering 2027 internships', completed: false },
    { id: 'goal-4', text: 'Prepare for Persistent Systems technical interview', completed: false },
  ],
  isDemo: true,
};

export const INITIAL_RECRUITER_PROFILE: RecruiterProfile = {
  userId: MARCUS_RECRUITER_ID,
  recruiterName: 'Sakshi Maddewad',
  workEmail: 'sakshi@persistent.com',
  companyName: 'Persistent Systems',
  companyDescription: 'Persistent Systems is a trusted global digital engineering and enterprise software leader headquartered in Pune, Maharashtra, driving technological transformation across cloud, AI, and healthcare solutions.',
  website: 'https://www.persistent.com',
  industry: 'Digital Engineering & Enterprise Software',
  location: 'Pune, Maharashtra (Hinjawadi Tech Park)',
  verificationStatus: 'verified',
  companyProfile: 'Headquartered in Pune, Persistent Systems empowers collegiate talent through direct engineering mentorship, hands-on enterprise codebases, and competitive placement stipends.',
  isDemo: true,
};

export const INITIAL_INTERNSHIPS: Internship[] = [
  {
    id: 'int-001',
    title: 'Software Development Intern',
    companyName: 'Persistent Systems',
    recruiterId: MARCUS_RECRUITER_ID,
    description: 'Join our Core Digital Engineering team in Pune to build lightning-fast web platforms, microservices interfaces, and scalable component primitives using React, TypeScript, and modern Node.js.',
    responsibilities: [
      'Design and implement high-performance React UI components for flagship client applications.',
      'Collaborate with technical leads and backend architects to integrate RESTful and streaming endpoints.',
      'Write comprehensive unit and integration tests using modern testing frameworks.',
      'Participate in daily engineering standups, sprint reviews, and technical demos.'
    ],
    eligibility: [
      'Currently enrolled in B.E., B.Tech, or Diploma in Computer Engineering, IT, or related discipline.',
      'Graduation year: 2026, 2027, or 2028.',
      'Demonstrated experience building responsive web applications with React & TypeScript.',
      'Good understanding of JavaScript, HTML, CSS, DOM manipulation, and REST APIs.'
    ],
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'Git & GitHub', 'REST APIs'],
    stipend: '₹18,000 / month',
    stipendNumeric: 18000,
    duration: '6 Months',
    location: 'Pune, Maharashtra',
    type: 'Hybrid',
    openings: 4,
    deadline: '2026-12-15T23:59:59Z',
    status: 'published',
    createdAt: '2026-09-01T10:00:00Z',
    experienceLevel: 'Beginner',
    domain: 'Engineering',
    isDemo: true,
  },
  {
    id: 'int-002',
    title: 'Full-Stack Developer Intern',
    companyName: 'Tata Consultancy Services (TCS)',
    recruiterId: MARCUS_RECRUITER_ID,
    description: 'Work across the entire application stack from database schema design and Node.js microservices to responsive frontend portals. Ideal for students with hands-on Node.js and React proficiency.',
    responsibilities: [
      'Build end-to-end features spanning Node.js Express microservices and React web clients.',
      'Design performant PostgreSQL/MongoDB relational and document schemas.',
      'Participate in continuous deployment and infrastructure monitoring pipelines.',
      'Contribute clean, self-documenting code with comprehensive test coverage.'
    ],
    eligibility: [
      'B.E. / B.Tech student in Computer Engineering, Information Technology, or equivalent.',
      'Hands-on experience with Node.js, Express, and modern JavaScript/TypeScript.',
      'Familiarity with relational databases (PostgreSQL/MySQL) or MongoDB.'
    ],
    requiredSkills: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'REST APIs', 'SQL'],
    stipend: '₹20,000 / month',
    stipendNumeric: 20000,
    duration: '6 Months',
    location: 'Pune, Maharashtra',
    type: 'On-site',
    openings: 3,
    deadline: '2026-11-30T23:59:59Z',
    status: 'published',
    createdAt: '2026-09-10T14:30:00Z',
    experienceLevel: 'Intermediate',
    domain: 'Engineering',
    isDemo: true,
  },
  {
    id: 'int-003',
    title: 'AI & Machine Learning Research Intern',
    companyName: 'Infosys',
    recruiterId: 'user-recruiter-sarah-02',
    description: 'Conduct applied machine learning engineering focusing on large language model orchestration, retrieval-augmented generation (RAG), and contextual vector search.',
    responsibilities: [
      'Fine-tune and benchmark deep learning architectures and NLP models on enterprise datasets.',
      'Implement data preprocessing, feature extraction, and evaluation pipelines in Python.',
      'Document experimental findings and build demo prototypes for cross-functional teams.'
    ],
    eligibility: [
      'Pursuing degree in Computer Engineering, Data Science, AI, or Mathematics.',
      'Strong mathematical intuition in Linear Algebra, Probability, and Optimization.',
      'Proficiency in Python and deep learning frameworks (PyTorch or TensorFlow).'
    ],
    requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'Data Structures', 'Git & GitHub'],
    stipend: '₹25,000 / month',
    stipendNumeric: 25000,
    duration: '6 Months',
    location: 'Bengaluru, Karnataka (or Remote)',
    type: 'Remote',
    openings: 5,
    deadline: '2026-12-01T23:59:59Z',
    status: 'published',
    createdAt: '2026-09-12T09:15:00Z',
    experienceLevel: 'Intermediate',
    domain: 'Data Science',
    isDemo: true,
  },
  {
    id: 'int-004',
    title: 'UI/UX Product Design Intern',
    companyName: 'Tech Mahindra',
    recruiterId: 'user-recruiter-sarah-02',
    description: 'Transform complex user workflows into clean, accessible, and delightful digital product experiences for Indian and global enterprises. Work closely with product and frontend engineering teams.',
    responsibilities: [
      'Create high-fidelity wireframes, interactive prototypes, and design systems in Figma.',
      'Conduct usability tests with collegiate users and synthesize behavioral feedback.',
      'Partner closely with frontend engineers to ensure design fidelity and responsive polish.'
    ],
    eligibility: [
      'Student in Design, Computer Science, Human-Computer Interaction, or related discipline.',
      'Portfolio showcasing UI/UX case studies, design systems, and responsive layouts.'
    ],
    requiredSkills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
    stipend: '₹15,000 / month',
    stipendNumeric: 15000,
    duration: '4 Months',
    location: 'Pune, Maharashtra',
    type: 'Hybrid',
    openings: 2,
    deadline: '2026-11-20T23:59:59Z',
    status: 'published',
    createdAt: '2026-09-15T16:00:00Z',
    experienceLevel: 'All Levels',
    domain: 'Design',
    isDemo: true,
  },
  {
    id: 'int-005',
    title: 'Cloud DevOps & Infrastructure Intern',
    companyName: 'Wipro',
    recruiterId: MARCUS_RECRUITER_ID,
    description: 'Help architect resilient cloud platforms, CI/CD automated deployment pipelines, and observability monitoring systems for high-throughput enterprise infrastructure.',
    responsibilities: [
      'Automate deployment pipelines using GitHub Actions, Docker, and Kubernetes.',
      'Configure Prometheus and Grafana alerts for distributed cluster health metrics.',
      'Maintain infrastructure as code templates and container registries.'
    ],
    eligibility: [
      'Engineering student with strong Linux foundations, shell scripting, and networking knowledge.',
      'Curiosity for site reliability engineering, containers, and automated workflows.'
    ],
    requiredSkills: ['Linux', 'Docker basics', 'Git & GitHub', 'Python', 'Networking'],
    stipend: '₹16,500 / month',
    stipendNumeric: 16500,
    duration: '6 Months',
    location: 'Pune, Maharashtra',
    type: 'Hybrid',
    openings: 3,
    deadline: '2026-12-20T23:59:59Z',
    status: 'published',
    createdAt: '2026-09-20T11:00:00Z',
    experienceLevel: 'Beginner',
    domain: 'DevOps',
    isDemo: true,
  },
  {
    id: 'int-006',
    title: 'Enterprise Software Systems Intern',
    companyName: 'Larsen & Toubro (L&T)',
    recruiterId: MARCUS_RECRUITER_ID,
    description: 'Collaborate with principal architects to develop industrial automation software, real-time telemetry dashboards, and robust enterprise integrations for critical infrastructure projects.',
    responsibilities: [
      'Build responsive data visualization modules using modern React and charting libraries.',
      'Implement secure RESTful APIs and database schemas for real-time sensor data.',
      'Participate in agile sprint ceremonies with engineering mentors.'
    ],
    eligibility: [
      'B.E. / B.Tech student in Computer Engineering, IT, Electrical, or Instrumentation.',
      'Demonstrated programming proficiency in C++, Python, or JavaScript/TypeScript.'
    ],
    requiredSkills: ['TypeScript', 'React', 'Python', 'REST APIs', 'SQL'],
    stipend: '₹22,000 / month',
    stipendNumeric: 22000,
    duration: '6 Months',
    location: 'Mumbai, Maharashtra',
    type: 'Hybrid',
    openings: 2,
    deadline: '2026-11-25T23:59:59Z',
    status: 'published',
    createdAt: '2026-09-22T13:45:00Z',
    experienceLevel: 'All Levels',
    domain: 'Engineering',
    isDemo: true,
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    internshipId: 'int-001',
    internshipTitle: 'Software Development Intern',
    companyName: 'Persistent Systems',
    studentId: SUJATA_STUDENT_ID,
    studentName: 'Sujata Maddewad',
    studentEmail: 'sujata@student.nextstep.edu',
    studentAvatar: '',
    appliedAt: '2026-09-05T14:20:00Z',
    status: 'interview_scheduled',
    resumeSnapshot: 'Sujata_Maddewad_Resume.pdf',
    coverLetter: 'Dear Sakshi and the Persistent Systems Engineering team,\n\nI am thrilled to submit my application for the Software Development Engineer Internship at Persistent Systems, Pune. Having built full-stack web applications with React, TypeScript, and Node.js, I deeply respect Persistent Systems’ leadership in digital engineering. My collegiate capstone project, NextStep, specifically solves high-performance recruitment workflows and state synchronization. I look forward to contributing my technical skills and dedication to your engineering team.\n\nWarm regards,\nSujata Maddewad',
    answers: {
      'What excited you most about Persistent Systems?': 'Persistent Systems is a premier digital engineering pioneer right here in Pune, and I am excited by your cutting-edge software architecture and mentorship culture.',
      'Link to your best GitHub project': 'https://github.com/sujata-maddewad/nextstep',
      'Earliest available start date': 'January 1, 2027'
    },
    recruiterNotes: 'Candidate demonstrated exemplary architectural understanding of React frontend and Node.js backend integration. Exceptional portfolio and 9.4 CGPA. Recommended for Technical Round 1.',
    history: [
      { status: 'applied', timestamp: '2026-09-05T14:20:00Z', note: 'Application submitted successfully via NextStep.' },
      { status: 'under_review', timestamp: '2026-09-08T09:30:00Z', note: 'Profile cleared automated ATS screen with 94% score.' },
      { status: 'shortlisted', timestamp: '2026-09-12T11:00:00Z', note: 'Shortlisted by Sakshi Maddewad for Technical Interview.' },
      { status: 'interview_scheduled', timestamp: '2026-09-18T16:00:00Z', note: 'Technical Interview scheduled for 28 Oct 2026 at 11:00 AM IST.' }
    ],
    interviewDetails: {
      date: '2026-10-28',
      time: '11:00 AM',
      timezone: 'IST',
      type: 'Technical',
      meetingId: 'meet-ns-sujata-sakshi',
      meetingUrl: '/meeting/meet-ns-sujata-sakshi',
      candidateName: 'Sujata Maddewad',
      recruiterName: 'Sakshi Maddewad',
      instructions: 'Please join 5 minutes early with your camera and microphone enabled. We will build a small stateful component together in React and discuss software architecture.',
      feedback: 'Outstanding technical foundations and articulate communication.'
    }
  },
  {
    id: 'app-002',
    internshipId: 'int-001',
    internshipTitle: 'Software Development Engineer Intern',
    companyName: 'Persistent Systems',
    studentId: 'user-priya-002',
    studentName: 'Priya Patil',
    studentEmail: 'priya.patil@pict.edu',
    studentAvatar: '',
    appliedAt: '2026-09-08T10:15:00Z',
    status: 'shortlisted',
    resumeSnapshot: 'Priya_Patil_Resume.pdf',
    coverLetter: 'Dear Hiring Manager at Persistent Systems,\n\nI am a final-year B.E. Computer Engineering student at PICT Pune. I have hands-on experience in React, JavaScript, and REST APIs with a CGPA of 9.1. I look forward to contributing to your software team.\n\nRegards,\nPriya Patil',
    recruiterNotes: 'Strong frontend fundamentals and active participation in college coding competitions. Shortlisted for upcoming technical batch.',
    history: [
      { status: 'applied', timestamp: '2026-09-08T10:15:00Z' },
      { status: 'under_review', timestamp: '2026-09-11T12:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-15T15:30:00Z', note: 'Shortlisted for technical screening.' }
    ]
  },
  {
    id: 'app-003',
    internshipId: 'int-001',
    internshipTitle: 'Software Development Engineer Intern',
    companyName: 'Persistent Systems',
    studentId: 'user-sneha-003',
    studentName: 'Sneha Kulkarni',
    studentEmail: 'sneha.kulkarni@coep.ac.in',
    studentAvatar: '',
    appliedAt: '2026-09-12T16:45:00Z',
    status: 'applied',
    resumeSnapshot: 'Sneha_Kulkarni_Resume.pdf',
    coverLetter: 'Dear Persistent Systems Team,\n\nI am pursuing B.Tech in Information Technology at COEP Pune. I have built full-stack MERN applications and maintain strong data structures fundamentals.\n\nWarm regards,\nSneha Kulkarni',
    recruiterNotes: 'Application received and placed in review queue.',
    history: [
      { status: 'applied', timestamp: '2026-09-12T16:45:00Z' }
    ]
  },
  {
    id: 'app-004',
    internshipId: 'int-002',
    internshipTitle: 'Full-Stack Developer Intern',
    companyName: 'Tata Consultancy Services (TCS)',
    studentId: SUJATA_STUDENT_ID,
    studentName: 'Sujata Maddewad',
    studentEmail: 'sujata@student.nextstep.edu',
    studentAvatar: '',
    appliedAt: '2026-09-15T18:40:00Z',
    status: 'shortlisted',
    resumeSnapshot: 'Sujata_Maddewad_Resume.pdf',
    coverLetter: 'Dear TCS Campus Hiring Team,\n\nI am applying for the Full-Stack Developer Internship in Pune. With demonstrated experience in Node.js, Express, and MongoDB alongside React, I enjoy designing robust database schemas and performant client interfaces.\n\nRegards,\nSujata Maddewad',
    recruiterNotes: 'Impressive 9.4 CGPA and solid MERN backend project architecture. Shortlisted for upcoming team batch interviews.',
    history: [
      { status: 'applied', timestamp: '2026-09-15T18:40:00Z' },
      { status: 'under_review', timestamp: '2026-09-19T10:15:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-25T15:20:00Z', note: 'Candidate placed in top 5% applicant pool.' }
    ]
  },
  {
    id: 'app-005',
    internshipId: 'int-001',
    internshipTitle: 'Software Development Engineer Intern',
    companyName: 'Persistent Systems',
    studentId: 'user-ananya-004',
    studentName: 'Ananya Sharma',
    studentEmail: 'ananya.sharma@cumminscollege.in',
    studentAvatar: '',
    appliedAt: '2026-09-16T11:30:00Z',
    status: 'under_review',
    resumeSnapshot: 'Ananya_Sharma_Resume.pdf',
    coverLetter: 'I am a third-year Computer Engineering student at Cummins College of Engineering for Women, Pune. Passionate about web engineering and distributed systems.\n\nSincerely,\nAnanya Sharma',
    recruiterNotes: 'Good academic record and clear interest in software development.',
    history: [
      { status: 'applied', timestamp: '2026-09-16T11:30:00Z' },
      { status: 'under_review', timestamp: '2026-09-20T14:00:00Z' }
    ]
  },
  {
    id: 'app-006',
    internshipId: 'int-001',
    internshipTitle: 'Software Development Engineer Intern',
    companyName: 'Persistent Systems',
    studentId: 'user-pooja-005',
    studentName: 'Pooja Jadhav',
    studentEmail: 'pooja.jadhav@engg.pune.edu',
    studentAvatar: '',
    appliedAt: '2026-09-10T09:00:00Z',
    status: 'offer_received',
    resumeSnapshot: 'Pooja_Jadhav_Resume.pdf',
    coverLetter: 'Applying for the Software Engineer Intern role at Persistent Systems Pune. Built high-traffic web apps and contributed to open-source.',
    recruiterNotes: 'Completed Technical and HR rounds with distinction. Offer letter generated at ₹18,000 / month.',
    history: [
      { status: 'applied', timestamp: '2026-09-10T09:00:00Z' },
      { status: 'under_review', timestamp: '2026-09-12T10:00:00Z' },
      { status: 'shortlisted', timestamp: '2026-09-16T14:00:00Z' },
      { status: 'interview_scheduled', timestamp: '2026-09-22T11:00:00Z' },
      { status: 'offer_received', timestamp: '2026-10-02T16:00:00Z', note: 'Offer letter extended at ₹18,000 / month.' }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: SUJATA_STUDENT_ID,
    title: 'Technical Interview Scheduled!',
    message: 'Sakshi Maddewad from Persistent Systems scheduled your Software Engineering interview for 24 Oct 2026 at 2:00 PM IST.',
    type: 'interview',
    read: false,
    createdAt: '2026-09-18T16:05:00Z',
    link: '/student/applications'
  },
  {
    id: 'notif-2',
    userId: SUJATA_STUDENT_ID,
    title: 'Application Shortlisted',
    message: 'Tata Consultancy Services (TCS) shortlisted your application for Full-Stack Developer Intern in Pune.',
    type: 'success',
    read: false,
    createdAt: '2026-09-25T15:21:00Z',
    link: '/student/applications'
  },
  {
    id: 'notif-3',
    userId: SUJATA_STUDENT_ID,
    title: 'New Recommended Internship',
    message: 'A new Machine Learning internship matching 95% of your skills was posted by Infosys.',
    type: 'info',
    read: true,
    createdAt: '2026-09-12T09:30:00Z',
    link: '/internships/int-003'
  },
  {
    id: 'notif-4',
    userId: MARCUS_RECRUITER_ID,
    title: 'New Applicant Received',
    message: 'Sujata Maddewad submitted an application for Software Development Engineer Intern at Persistent Systems.',
    type: 'info',
    read: true,
    createdAt: '2026-09-05T14:22:00Z',
    link: '/recruiter/applicants'
  },
  {
    id: 'notif-5',
    userId: ELENA_ADMIN_ID,
    title: 'Recruiter Verification Request',
    message: 'Sakshi Maddewad submitted Persistent Systems for campus recruiter verification.',
    type: 'warning',
    read: true,
    createdAt: '2026-07-10T11:30:00Z',
    link: '/admin/verifications'
  }
];

export const INITIAL_REPORTS: ContentReport[] = [
  {
    id: 'rep-001',
    targetType: 'internship',
    targetId: 'int-demo-flagged',
    targetTitle: 'Data Entry Part-Time (Unverified Agency)',
    reporterId: 'user-neha-08',
    reporterName: 'Neha Joshi',
    reason: 'Listing asks applicants to pay a registration fee for training materials.',
    status: 'pending',
    createdAt: '2026-10-10T08:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    adminId: ELENA_ADMIN_ID,
    adminName: 'Mayank Maddewad',
    action: 'RECRUITER_VERIFIED',
    target: 'Persistent Systems (Sakshi Maddewad)',
    details: 'Verified corporate domain, MCA registration, and executive credentials.',
    timestamp: '2026-07-12T14:10:00Z'
  },
  {
    id: 'log-002',
    adminId: ELENA_ADMIN_ID,
    adminName: 'Mayank Maddewad',
    action: 'INTERNSHIP_APPROVED',
    target: 'Software Development Engineer Intern (Persistent Systems)',
    details: 'Approved listing after reviewing AICTE/UGC stipend compliance and eligibility criteria.',
    timestamp: '2026-09-01T10:30:00Z'
  },
  {
    id: 'log-003',
    adminId: ELENA_ADMIN_ID,
    adminName: 'Mayank Maddewad',
    action: 'SUSPICIOUS_POST_REMOVED',
    target: 'Unverified Placement Agency',
    details: 'Suspended fraudulent recruiter account and purged 2 associated listings.',
    timestamp: '2026-09-28T17:45:00Z'
  }
];
