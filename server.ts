import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import http from 'http';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { connectToDatabase } from './server/db.ts';
import internshipRouter from './server/routes/internships.ts';
import studentsRouter from './server/routes/students.ts';
import companiesRouter from './server/routes/companies.ts';
import applicationsRouter from './server/routes/applications.ts';
import authRouter from './server/routes/auth.ts';
import adminRouter from './server/routes/admin.ts';
import meetingsRouter from './server/routes/meetings.ts';
import { setupSignalingServer } from './server/signaling.ts';
import { authenticate } from './server/middleware/auth.ts';
import { seedLiveUsersIfEmpty } from './server/db.ts';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Global Authentication Parser Middleware
app.use(authenticate);

// Mount Auth routes (Register, Login, Me, Logout)
app.use('/api/auth', authRouter);

// Mount Admin Protected routes
app.use('/api/admin', adminRouter);

// Mount MongoDB CRUD REST API routes
app.use('/api', internshipRouter);
app.use('/api', studentsRouter);
app.use('/api', companiesRouter);
app.use('/api', applicationsRouter);
app.use('/api/meetings', meetingsRouter);

const PORT = 3000;

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Config Status Endpoint
app.get('/api/config-status', (_req: Request, res: Response) => {
  res.json({
    geminiConfigured: !!ai,
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
    timestamp: new Date().toISOString(),
  });
});

// AI Resume Analyzer
app.post('/api/ai/resume-analyzer', async (req: Request, res: Response) => {
  try {
    const { resumeText, targetRole } = req.body;
    if (!resumeText || typeof resumeText !== 'string') {
      res.status(400).json({ error: 'Resume text is required' });
      return;
    }

    if (!ai) {
      // Heuristic fallback when GEMINI_API_KEY is pending
      const wordCount = resumeText.trim().split(/\s+/).length;
      const lower = resumeText.toLowerCase();
      const detectedSkills: string[] = [];
      const commonSkills = ['React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'SQL', 'Docker', 'Git', 'Tailwind', 'HTML', 'CSS', 'REST APIs', 'Machine Learning'];
      for (const skill of commonSkills) {
        if (lower.includes(skill.toLowerCase())) detectedSkills.push(skill);
      }

      res.json({
        overallScore: Math.min(94, Math.max(68, Math.round(detectedSkills.length * 7 + (wordCount > 150 ? 25 : 10)))),
        extractedSkills: detectedSkills.length > 0 ? detectedSkills : ['General Engineering', 'Problem Solving', 'Documentation'],
        strengths: [
          'Solid educational background with explicit graduation year and GPA',
          'Good demonstration of modern technical stack and open-source tools',
          'Clear project descriptions showing end-to-end implementation'
        ],
        missingSections: [
          lower.includes('metric') || lower.includes('%') ? 'Quantified business impact metrics' : 'Quantifiable achievement percentages',
          lower.includes('leadership') ? 'Publications / Awards' : 'Leadership experience & student club initiatives'
        ],
        recommendations: [
          { section: 'Projects', suggestion: 'Quantify impact (e.g. "Reduced API response times by 35%")', priority: 'High' },
          { section: 'Skills', suggestion: 'Categorize skills into Languages, Frameworks, and Cloud Infrastructure for quicker recruiter scanning', priority: 'Medium' },
          { section: 'Summary', suggestion: 'Add a concise 2-sentence target career objective at the very top', priority: 'Medium' }
        ],
        summary: 'Your resume shows strong technical foundations. Incorporating more quantifiable business metrics and organizing skills into distinct subcategories will maximize your ATS pass rate.',
        mode: 'heuristic_fallback',
        note: 'Live Gemini API is enabled when GEMINI_API_KEY is set in Secrets.'
      });
      return;
    }

    const prompt = `Analyze this college student/intern candidate's resume for the target role: "${targetRole || 'Software Engineering / Tech Intern'}".
Provide a rigorous ATS and recruiter critique.
Resume content:
${resumeText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Score between 0 and 100' },
            extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSections: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                },
                required: ['section', 'suggestion', 'priority'],
              },
            },
            summary: { type: Type.STRING },
          },
          required: ['overallScore', 'extractedSkills', 'strengths', 'missingSections', 'recommendations', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, mode: 'gemini_live' });
  } catch (err: unknown) {
    console.error('Error in resume analyzer:', err);
    res.status(500).json({ error: 'Failed to analyze resume', details: (err as Error).message });
  }
});

// AI Internship Match Score
app.post('/api/ai/match-score', async (req: Request, res: Response) => {
  try {
    const { studentProfile, internship } = req.body;
    if (!studentProfile || !internship) {
      res.status(400).json({ error: 'Student profile and internship data are required' });
      return;
    }

    const studentSkills: string[] = studentProfile.skills || [];
    const requiredSkills: string[] = internship.requiredSkills || [];

    if (!ai) {
      // Heuristic comparison
      const matched = studentSkills.filter(s => 
        requiredSkills.some(reqSkill => reqSkill.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(reqSkill.toLowerCase()))
      );
      const missing = requiredSkills.filter(r => 
        !studentSkills.some(st => st.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(st.toLowerCase()))
      );
      const percentage = requiredSkills.length > 0 
        ? Math.round((matched.length / requiredSkills.length) * 85 + 10) 
        : 80;

      res.json({
        matchPercentage: Math.min(98, Math.max(45, percentage)),
        matchedSkills: matched.length > 0 ? matched : ['Foundational CS Concepts'],
        missingSkills: missing,
        strengths: [
          `You already master ${matched.length} key required competencies including ${matched.slice(0, 3).join(', ')}.`,
          `Your educational branch (${studentProfile.branch || 'Engineering'}) directly matches the role criteria.`
        ],
        recommendations: missing.length > 0
          ? [
              `Spend 1-2 weeks building a hands-on project utilizing ${missing[0]}.`,
              `Add specific references to ${missing.slice(0, 2).join(' and ')} in your application cover letter.`
            ]
          : ['Your profile is exceptionally aligned. Submit your application early to secure an interview spot.'],
        summary: `Estimated match score of ${percentage}%. You satisfy core requirements with great fundamentals.`,
        mode: 'heuristic_fallback'
      });
      return;
    }

    const prompt = `Compare this student profile with the internship opportunity.
Student Profile:
Name: ${studentProfile.fullName}
Degree: ${studentProfile.degree} - ${studentProfile.branch}
Skills: ${studentSkills.join(', ')}
Projects: ${JSON.stringify(studentProfile.projects || [])}

Internship:
Title: ${internship.title}
Company: ${internship.companyName}
Required Skills: ${requiredSkills.join(', ')}
Description: ${internship.description}

Evaluate fit objectively. Output JSON breakdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchPercentage: { type: Type.INTEGER, description: 'Percentage 0 to 100' },
            matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
          },
          required: ['matchPercentage', 'matchedSkills', 'missingSkills', 'strengths', 'recommendations', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, mode: 'gemini_live' });
  } catch (err: unknown) {
    console.error('Error in match score:', err);
    res.status(500).json({ error: 'Failed to calculate match score', details: (err as Error).message });
  }
});

// AI Skill Gap & Learning Roadmap
app.post('/api/ai/skill-gap', async (req: Request, res: Response) => {
  try {
    const { targetRole, currentSkills } = req.body;
    if (!targetRole) {
      res.status(400).json({ error: 'Target role is required' });
      return;
    }

    const skills: string[] = currentSkills || [];

    if (!ai) {
      res.json({
        targetRole,
        overallReadiness: 78,
        acquiredSkills: skills.slice(0, 6),
        skillsToLearn: [
          { skill: 'Distributed System Caching (Redis)', importance: 'Critical', estimatedWeeks: 2 },
          { skill: 'Container Orchestration & CI/CD', importance: 'Recommended', estimatedWeeks: 3 },
          { skill: 'GraphQL & Streaming APIs', importance: 'Bonus', estimatedWeeks: 2 },
        ],
        learningRoadmap: [
          {
            phase: 'Phase 1 (Weeks 1-2)',
            title: 'Foundations & State Architecture',
            duration: '2 Weeks',
            topics: ['Advanced TypeScript Generics', 'Performance Profiling', 'Memory Leaks'],
            suggestedProject: 'Build a high-throughput real-time WebSocket dashboard.'
          },
          {
            phase: 'Phase 2 (Weeks 3-5)',
            title: 'Backend Scalability & Caching',
            duration: '3 Weeks',
            topics: ['Redis Cache Invalidation', 'PostgreSQL Query Optimization', 'Docker multi-stage builds'],
            suggestedProject: 'Architect an e-commerce inventory API handling concurrent requests.'
          },
          {
            phase: 'Phase 3 (Weeks 6-8)',
            title: 'Production Readiness & Portfolio Showcase',
            duration: '3 Weeks',
            topics: ['Automated End-to-End Tests', 'CI/CD with GitHub Actions', 'Security Hardening'],
            suggestedProject: 'Package and deploy your full-stack capstone project with automated CI.'
          }
        ],
        mode: 'heuristic_fallback'
      });
      return;
    }

    const prompt = `Generate an actionable skill-gap analysis and step-by-step learning roadmap for a student aiming for the target role: "${targetRole}".
Current skills: ${skills.join(', ')}.
Provide structured learning phases, specific topics, and suggested practical portfolio projects.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetRole: { type: Type.STRING },
            overallReadiness: { type: Type.INTEGER },
            acquiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillsToLearn: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  importance: { type: Type.STRING, enum: ['Critical', 'Recommended', 'Bonus'] },
                  estimatedWeeks: { type: Type.INTEGER },
                },
                required: ['skill', 'importance', 'estimatedWeeks'],
              },
            },
            learningRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedProject: { type: Type.STRING },
                },
                required: ['phase', 'title', 'duration', 'topics', 'suggestedProject'],
              },
            },
          },
          required: ['targetRole', 'overallReadiness', 'acquiredSkills', 'skillsToLearn', 'learningRoadmap'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, mode: 'gemini_live' });
  } catch (err: unknown) {
    console.error('Error in skill gap:', err);
    res.status(500).json({ error: 'Failed to generate skill gap roadmap', details: (err as Error).message });
  }
});

// AI Cover Letter Assistant
app.post('/api/ai/cover-letter', async (req: Request, res: Response) => {
  try {
    const { studentProfile, internship, tone } = req.body;
    if (!studentProfile || !internship) {
      res.status(400).json({ error: 'Student profile and internship details are required' });
      return;
    }

    if (!ai) {
      const studentName = studentProfile.fullName || 'Sujata Maddewad';
      const company = internship.companyName || 'Persistent Systems';
      const title = internship.title || 'Software Engineering Intern';
      const skills = (studentProfile.skills || ['React', 'TypeScript', 'Node.js']).slice(0, 4).join(', ');

      const draft = `Dear Hiring Team at ${company},

I am writing to express my enthusiastic interest in the ${title} position. As a ${studentProfile.degree || 'Computer Engineering'} student at ${studentProfile.college || 'Pune Institute of Computer Technology (PICT) / Savitribai Phule Pune University'} graduating in ${studentProfile.graduationYear || '2026'}, I have developed hands-on technical competencies in ${skills}.

What excites me most about ${company} is your commitment to innovative, high-impact engineering solutions. Through my recent projects, including "${studentProfile.projects?.[0]?.title || 'NextStep'}", I have practiced architecting resilient software, collaborating on clean git workflows, and translating user needs into performant experiences.

I am eager to contribute my dedication, quick learning ability, and technical foundation to your engineering team. Thank you for considering my application, and I welcome the opportunity to discuss how my background aligns with your upcoming goals.

Sincerely,
${studentName}
${studentProfile.email || 'sujata@student.nextstep.edu'}`;

      res.json({ coverLetter: draft, mode: 'heuristic_fallback' });
      return;
    }

    const prompt = `Draft a tailored, compelling cover letter for:
Candidate: ${studentProfile.fullName}
Degree: ${studentProfile.degree} at ${studentProfile.college}
Skills: ${(studentProfile.skills || []).join(', ')}
Notable Project: ${studentProfile.projects?.[0]?.title || 'Web & AI Applications'} - ${studentProfile.projects?.[0]?.description || ''}

Applying for:
Role: ${internship.title}
Company: ${internship.companyName}
Required Skills: ${(internship.requiredSkills || []).join(', ')}
Tone: ${tone || 'Professional, enthusiastic, and genuine'}

Do not invent false certifications or degrees. Ensure it is ready for the student to review and edit before sending.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ coverLetter: response.text, mode: 'gemini_live' });
  } catch (err: unknown) {
    console.error('Error in cover letter:', err);
    res.status(500).json({ error: 'Failed to generate cover letter', details: (err as Error).message });
  }
});

// AI Interview Prep
app.post('/api/ai/interview-prep', async (req: Request, res: Response) => {
  try {
    const { roleTitle, companyName, difficulty } = req.body;
    if (!roleTitle) {
      res.status(400).json({ error: 'Role title is required' });
      return;
    }

    if (!ai) {
      res.json({
        questions: [
          {
            id: 'q1',
            type: 'Technical',
            question: 'How do React hooks such as useEffect and useMemo interact with component re-renders, and how do you prevent unnecessary state churn?',
            hint: 'Discuss dependency array comparisons, referential equality of objects/callbacks, and pure rendering.',
            sampleAnswer: 'React relies on Object.is for dependency comparisons. If an object is recreated on every render, the hook re-executes. Passing memoized callbacks with useCallback or stable primitives prevents this cascade.',
          },
          {
            id: 'q2',
            type: 'System & Architecture',
            question: 'When designing an API for an internship application portal, how would you prevent duplicate submissions under race conditions?',
            hint: 'Consider database constraints, idempotency keys, and transaction atomicity.',
            sampleAnswer: 'Use an idempotency key header or unique compound index (e.g., studentId + internshipId) in the database transaction, rejecting subsequent attempts with an HTTP 409 Conflict.',
          },
          {
            id: 'q3',
            type: 'Behavioral (STAR Method)',
            question: 'Tell me about a time you encountered a stubborn bug in a project right before a deadline. How did you diagnose and resolve it?',
            hint: 'Use the Situation, Task, Action, Result framework to demonstrate composure and structured troubleshooting.',
            sampleAnswer: 'During my project demo, state synchronization failed due to async state batching. I isolated the reducer with unit tests, pinpointed the stale closure, and shipped a fix with 2 hours to spare.',
          }
        ],
        mode: 'heuristic_fallback'
      });
      return;
    }

    const prompt = `Generate 4 realistic interview questions for a candidate interviewing for "${roleTitle}" at "${companyName || 'a leading tech company'}".
Difficulty level: ${difficulty || 'Mid / College Intern'}.
Include a mix of Technical, Architecture, and Behavioral questions. For each question provide:
- question text
- hint
- model exemplary answer key`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['Technical', 'System & Architecture', 'Behavioral (STAR Method)'] },
                  question: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  sampleAnswer: { type: Type.STRING },
                },
                required: ['id', 'type', 'question', 'hint', 'sampleAnswer'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, mode: 'gemini_live' });
  } catch (err: unknown) {
    console.error('Error in interview prep:', err);
    res.status(500).json({ error: 'Failed to generate interview questions', details: (err as Error).message });
  }
});

// AI Feedback on Candidate's Answer
app.post('/api/ai/interview-feedback', async (req: Request, res: Response) => {
  try {
    const { question, candidateAnswer, roleTitle } = req.body;
    if (!question || !candidateAnswer) {
      res.status(400).json({ error: 'Question and candidate answer are required' });
      return;
    }

    if (!ai) {
      res.json({
        score: 85,
        verdict: 'Strong Answer',
        strengths: [
          'Directly addressed the core technical premise of the question.',
          'Maintained a structured, logical explanation without rambling.'
        ],
        improvements: [
          'Could cite a specific concrete example from a real codebase or production project.',
          'Consider mentioning edge cases such as network latency or error boundaries.'
        ],
        modelRevision: 'In addition to your answer, emphasize edge cases: "In our production system, we also attached exponential backoff retries to handle transient failures gracefully."'
      });
      return;
    }

    const prompt = `Critique this candidate's interview response for the role of ${roleTitle || 'Software Engineer'}.
Question: "${question}"
Candidate Answer: "${candidateAnswer}"

Evaluate technical depth, clarity, and structure. Output JSON critique.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score between 0 and 100' },
            verdict: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            modelRevision: { type: Type.STRING },
          },
          required: ['score', 'verdict', 'strengths', 'improvements', 'modelRevision'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ ...parsed, mode: 'gemini_live' });
  } catch (err: unknown) {
    console.error('Error in interview feedback:', err);
    res.status(500).json({ error: 'Failed to analyze interview answer', details: (err as Error).message });
  }
});

// AI Career Assistant Chatbot
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userRole, userName } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const lastMessage = messages[messages.length - 1]?.content || 'Hello';

    if (!ai) {
      res.json({
        reply: `Hello ${userName || 'Sujata'}! I am NextStep’s Career Intelligence Assistant. 

Here are top recommendations for your internship search:
1. **Target High-Signal Skills**: Prioritize full-stack integration (React + TypeScript + Node.js) and cloud deployment fundamentals.
2. **Quantify Your Projects**: Ensure every portfolio project lists what problem it solved, the tech stack, and measured performance.
3. **Mock Practice**: Test your skills using our built-in Interview Prep simulator.

How can I help you refine your resume or prepare for interviews today?`,
        mode: 'heuristic_fallback'
      });
      return;
    }

    const systemPrompt = `You are the NextStep Smart Career & Internship Assistant, an expert career mentor for collegiate students, interns, and recruiters.
User Name: ${userName || 'Sujata'}
Role: ${userRole || 'student'}
Provide warm, actionable, technically rigorous advice on internships, resumes, technical interviews, and portfolio projects. Keep answers structured with bullet points.`;

    const chatContents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({
      reply: response.text || 'I am here to help you navigate your career journey on NextStep.',
      mode: 'gemini_live'
    });
  } catch (err: unknown) {
    console.error('Error in career chat:', err);
    res.status(500).json({ error: 'Failed to complete chat message', details: (err as Error).message });
  }
});

// Vite Middleware for Dev or Static file serving for Production
async function startServer() {
  const httpServer = http.createServer(app);
  setupSignalingServer(httpServer);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 NextStep server running on http://0.0.0.0:${PORT} with WebRTC signaling`);
    
    // Attempt MongoDB connection asynchronously without blocking server readiness
    try {
      const dbResult = await connectToDatabase();
      if (dbResult.success) {
        console.log(`🍃 ${dbResult.message}`);
        await seedLiveUsersIfEmpty();
      } else {
        console.log(`ℹ️ MongoDB connection status: ${dbResult.message} (Fallback in-memory NoSQL store active)`);
      }
    } catch (dbErr: unknown) {
      console.warn('ℹ️ MongoDB auto-connect caught:', (dbErr as Error).message);
    }
  });
}

startServer();
