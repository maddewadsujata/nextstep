import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Map, 
  MessageSquare, 
  HelpCircle, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Award
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ResumeAnalysisResult, SkillGapResult } from '../../types';

interface AICareerIntelligenceProps {
  initialTab?: 'resume' | 'roadmap' | 'interview' | 'chat';
}

export const AICareerIntelligence: React.FC<AICareerIntelligenceProps> = ({ initialTab = 'resume' }) => {
  const { studentProfile } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'resume' | 'roadmap' | 'interview' | 'chat'>(initialTab);

  // Resume Analyzer State
  const [resumeText, setResumeText] = useState(studentProfile.resumeText || '');
  const [targetRole, setTargetRole] = useState('Frontend Software Engineering Intern');
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeAnalysisResult | null>(null);

  // Skill Gap State
  const [gapRole, setGapRole] = useState('Full-Stack Distributed Systems Engineer');
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [gapResult, setGapResult] = useState<SkillGapResult | null>(null);

  // Interview Prep State
  const [roleTitle, setRoleTitle] = useState('Frontend React Engineer Intern');
  const [companyName, setCompanyName] = useState('Persistent Systems');
  const [difficulty, setDifficulty] = useState('Mid / College Intern');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<any>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; content: string }[]>([
    {
      role: 'model',
      content: `Hello ${studentProfile.fullName}! I am NextStep’s Career Intelligence Assistant powered by Gemini. Ask me anything about preparing for tech interviews, tailoring your resume, or comparing company cultures.`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Resume Handler
  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    setIsAnalyzingResume(true);
    try {
      const res = await fetch('/api/ai/resume-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole })
      });
      const data = await res.json();
      setResumeResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  // Skill Gap Handler
  const handleAnalyzeGap = async () => {
    setIsAnalyzingGap(true);
    try {
      const res = await fetch('/api/ai/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: gapRole,
          currentSkills: studentProfile.skills
        })
      });
      const data = await res.json();
      setGapResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  // Interview Questions Handler
  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setAnswerFeedback(null);
    setCandidateAnswer('');
    try {
      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleTitle, companyName, difficulty })
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        setActiveQuestionIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Evaluate Answer Handler
  const handleEvaluateAnswer = async () => {
    if (!candidateAnswer.trim() || !questions[activeQuestionIndex]) return;
    setIsEvaluatingAnswer(true);
    try {
      const res = await fetch('/api/ai/interview-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[activeQuestionIndex].question,
          candidateAnswer,
          roleTitle
        })
      });
      const data = await res.json();
      setAnswerFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  // Chatbot Handler
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;
    const userMsg = chatInput.trim();
    setChatInput('');

    const nextMessages = [...chatMessages, { role: 'user' as const, content: userMsg }];
    setChatMessages(nextMessages);
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          userName: studentProfile.fullName,
          userRole: 'student'
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'model', content: data.reply || 'Let me help you with your career goals.' }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', content: 'Connection temporarily interrupted. Please try again.' }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Server-Side Gemini 3.8 Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Career Intelligence Studio
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            Objective ATS diagnostics, automated interview simulation, learning roadmaps, and career advisory tailored to your background.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'resume' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume ATS</span>
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'roadmap' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Skill Gap</span>
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'interview' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Mock Interview</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Assistant</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RESUME ANALYZER */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Input Resume Text for Analysis
              </h2>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Resume Content</label>
                <textarea
                  rows={14}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your plain text resume or Markdown..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <button
                onClick={handleAnalyzeResume}
                disabled={isAnalyzingResume || !resumeText.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isAnalyzingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isAnalyzingResume ? 'Analyzing with Gemini...' : 'Analyze ATS Compatibility'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {!resumeResult ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
                <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  ATS Scorecard Ready to Generate
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Analyze ATS Compatibility" to evaluate keyword coverage, missing sections, and formatting suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Score Header */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overall ATS Readiness Score
                    </span>
                    <h3 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums mt-1">
                      {resumeResult.overallScore} / 100
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-md">
                      {resumeResult.summary}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 dark:border-indigo-400 flex items-center justify-center text-lg font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                    {resumeResult.overallScore}%
                  </div>
                </div>

                {/* Extracted Skills */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Detected Core Skills ({resumeResult.extractedSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeResult.extractedSkills.map(s => (
                      <span key={s} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strengths & Missing Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/60 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Strong Elements
                    </h4>
                    <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1 list-disc list-inside">
                      {resumeResult.strengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-5 border border-amber-100 dark:border-amber-900/60 space-y-2">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Missing / Weak Sections
                    </h4>
                    <ul className="text-xs text-amber-900 dark:text-amber-200 space-y-1 list-disc list-inside">
                      {resumeResult.missingSections.map((mis, i) => (
                        <li key={i}>{mis}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Prioritized Improvements
                  </h4>
                  <div className="space-y-2.5">
                    {resumeResult.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {rec.section}
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {rec.suggestion}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          rec.priority === 'High' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SKILL GAP & ROADMAP */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:w-auto">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Role to Benchmark Against:
              </label>
              <input
                type="text"
                value={gapRole}
                onChange={e => setGapRole(e.target.value)}
                className="w-full sm:w-96 p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleAnalyzeGap}
              disabled={isAnalyzingGap}
              className="w-full sm:w-auto py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isAnalyzingGap ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
              <span>Generate Customized Roadmap</span>
            </button>
          </div>

          {gapResult && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500">Current Role Readiness</span>
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums mt-1">
                    {gapResult.overallReadiness}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Based on student skills inventory</p>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-semibold text-slate-500">Critical Skills to Acquire</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {gapResult.skillsToLearn.map((item, i) => (
                      <div key={i} className="p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.skill}</span>
                        <span className="text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded font-semibold">
                          ~{item.estimatedWeeks}wks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step by step phases */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Structured Learning Milestones
                </h3>

                <div className="space-y-6">
                  {gapResult.learningRoadmap.map((phase, i) => (
                    <div key={i} className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {phase.phase} · {phase.duration}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {phase.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {phase.topics.map((t, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                          Suggested Practical Project:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">{phase.suggestedProject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MOCK INTERVIEW SIMULATOR */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target Role</label>
              <input
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Target Company</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Beginner / Campus Intern">Beginner / Campus Intern</option>
                <option value="Mid / College Intern">Mid / College Intern</option>
                <option value="Competitive / Top Tech">Competitive / Top Tech</option>
              </select>
            </div>
            <button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isGeneratingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              <span>Generate Questions</span>
            </button>
          </div>

          {questions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Question list selector */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Interview Round Questions ({questions.length})
                </span>
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      onClick={() => {
                        setActiveQuestionIndex(idx);
                        setAnswerFeedback(null);
                        setCandidateAnswer('');
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                        activeQuestionIndex === idx
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-950 dark:text-indigo-200 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 uppercase block mb-0.5">{q.type}</span>
                      <p className="line-clamp-2">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active question practice workspace */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    Question {activeQuestionIndex + 1} of {questions.length} · {questions[activeQuestionIndex].type}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {questions[activeQuestionIndex].question}
                  </h3>
                  {questions[activeQuestionIndex].hint && (
                    <p className="text-xs text-slate-500 italic">
                      Hint: {questions[activeQuestionIndex].hint}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Your Response:
                  </label>
                  <textarea
                    rows={6}
                    value={candidateAnswer}
                    onChange={e => setCandidateAnswer(e.target.value)}
                    placeholder="Type your structured answer here (e.g. explain your technical thinking, trade-offs, or STAR situation)..."
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {candidateAnswer.split(/\s+/).filter(Boolean).length} words
                  </span>

                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={isEvaluatingAnswer || !candidateAnswer.trim()}
                    className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isEvaluatingAnswer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Submit for AI Evaluation</span>
                  </button>
                </div>

                {/* AI Feedback View */}
                {answerFeedback && (
                  <div className="mt-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        AI Evaluator Verdict: {answerFeedback.verdict}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm tabular-nums">
                        {answerFeedback.score} / 100
                      </span>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-emerald-600 dark:text-emerald-400 block">Strengths:</strong>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
                        {answerFeedback.strengths?.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-amber-600 dark:text-amber-400 block">Areas for Improvement:</strong>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
                        {answerFeedback.improvements?.map((imp: string, idx: number) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>

                    {answerFeedback.modelRevision && (
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Model Exemplary Revision:</strong>
                        <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">
                          "{answerFeedback.modelRevision}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CAREER ADVISOR CHATBOT */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Messages scroll area */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSendingChat && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                  AI
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-tl-none text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>NextStep assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick prompt chips */}
          <div className="px-6 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0">Try asking:</span>
            <button
              onClick={() => setChatInput("What questions should I ask the interviewer at the end of a software engineering intern interview?")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap"
            >
              Questions to ask interviewer
            </button>
            <button
              onClick={() => setChatInput("How do I structure my personal projects to pass modern ATS filters?")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap"
            >
              Passing ATS filters
            </button>
            <button
              onClick={() => setChatInput("How to negotiate my internship stipend or ask about return offer rates?")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap"
            >
              Return offer & stipend
            </button>
          </div>

          {/* Input form */}
          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask the NextStep Career Assistant..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
