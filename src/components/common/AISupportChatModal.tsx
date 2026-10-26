import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Minimize2, 
  RotateCcw,
  HelpCircle,
  Briefcase,
  FileText,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface AISupportChatModalProps {
  onNavigate?: (page: string) => void;
}

export const AISupportChatModal: React.FC<AISupportChatModalProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine user persona name
  const userName = currentUser?.name || 'Sujata Maddewad';
  const userRole = currentUser?.role || 'guest';

  // Personalized initial welcome greeting
  const getInitialGreeting = (): string => {
    if (userRole === 'student') {
      return `Hi ${userName.split(' ')[0] || 'Sujata'}! 👋 I’m the NextStep AI Assistant. I’m available 24/7 to help you with internships, applications, profiles, and platform-related questions. How can I help you today?`;
    }
    if (userRole === 'recruiter') {
      return `Hi ${userName.split(' ')[0] || 'Sakshi'}! 👋 I’m the NextStep Recruitment Assistant. I’m available 24/7 to help with posting internships, candidate pipelines, interview scheduling, and recruitment analytics. How can I assist you today?`;
    }
    if (userRole === 'admin') {
      return `Welcome ${userName.split(' ')[0] || 'Mayank'}! 🛡️ I’m the NextStep Administrative Assistant. I’m available 24/7 to assist with user management, listings oversight, platform audit logs, and security governance. How can I help you today?`;
    }
    return `Welcome to NextStep! 👋 I’m the NextStep AI Assistant. I’m available 24/7 to help you find internships, navigate student registration, or answer platform questions. How can I help you today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'ai',
      text: getInitialGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  // Update greeting when user role changes
  useEffect(() => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: getInitialGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [currentUser?.role, currentUser?.name]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Suggested quick prompts per role
  const quickPrompts = userRole === 'recruiter' 
    ? [
        'How do I post a new internship?',
        'How do I schedule candidate interviews?',
        'Where do I view applicant resumes?',
        'What are the recruitment pipeline stages?'
      ]
    : userRole === 'admin'
    ? [
        'How do I activate or deactivate a user?',
        'How do I permanently delete a user?',
        'Where can I review audit logs?',
        'How to monitor platform statistics?'
      ]
    : [
        'How do I withdraw an application?',
        'How to track my interview status?',
        'How do I update my certificates?',
        'How to apply with AI cover letter?'
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Call backend AI chat endpoint
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text,
          })),
          userRole,
          userName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply || getLocalFallbackResponse(text),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Server response not OK');
      }
    } catch {
      // High-quality local instant answers for platform queries
      const reply = getLocalFallbackResponse(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getLocalFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('withdraw')) {
      return `To withdraw an application:\n\n1. Open **My Applications** from the navigation bar.\n2. Click on the internship application you wish to manage.\n3. Click **Withdraw Application** at the bottom of the details drawer.\n4. Confirm the dialog: "Are you sure you want to withdraw this application?".\n5. Your status will update to **Withdrawn** immediately, and you will receive a confirmation notification.`;
    }

    if (q.includes('apply') || q.includes('cover letter')) {
      return `To apply for an internship:\n\n1. Go to **Discover Internships**.\n2. Click on any opening (e.g., Persistent Systems, TCS, Infosys).\n3. Review the role requirements, stipend (₹), and location.\n4. Click **Apply Now**.\n5. You can submit your application directly or use the AI Cover Letter Assistant to generate a personalized draft tailored to the role!`;
    }

    if (q.includes('interview') || q.includes('status')) {
      return `To track scheduled interviews:\n\n1. Navigate to **My Applications**.\n2. Look at the **Interviews** column in the pipeline or use the filter.\n3. When an employer schedules a round, the exact date, time (IST), instructions, and meeting video link appear directly on the card!`;
    }

    if (q.includes('certificate') || q.includes('profile')) {
      return `To manage your profile and credentials:\n\n1. Go to **Profile** in the top navigation.\n2. You can view your verified certificates (Cisco, Anthropic, S4DS, IBM, L&T).\n3. Click **View Certificate** on any card to inspect the credential.\n4. Update your GPA, college details, technical projects, or skills anytime.`;
    }

    if (q.includes('post') || q.includes('recruiter')) {
      return `For Recruiters:\n\n1. Head to **Post Internship** from the Recruiter Dashboard.\n2. Enter the title, company name, location (e.g. Pune, Bengaluru), stipend in ₹/month, work type, and required skills.\n3. Click **Publish Internship** to make it instantly visible to verified students across Maharashtra and India.`;
    }

    if (q.includes('delete user') || q.includes('suspend') || q.includes('admin')) {
      return `For Administrators:\n\n1. Open the **Admin Dashboard**.\n2. Go to the **Users** tab.\n3. Use search or filter by Student / Recruiter.\n4. Click **Suspend** or **Reactivate** to change account status.\n5. Click **Delete User** and confirm to permanently remove the user record from the database. All actions are logged in the immutable Audit Trail.`;
    }

    return `I can help you with anything on NextStep! You can ask about:\n• Discovering & applying for internships\n• Withdrawing or tracking applications\n• Preparing for interviews with our AI simulator\n• Recruiter posting & applicant pipeline tools\n• Administrator governance & user management\n\nWhat would you like to explore next?`;
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: getInitialGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 group cursor-pointer border border-white/20 hover:scale-105"
          title="Open 24/7 NextStep AI Support Chatbot"
          aria-label="Open 24/7 AI Support"
        >
          <div className="relative">
            <Bot className="w-5 h-5 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-600 animate-pulse" />
          </div>
          <span className="text-xs font-bold hidden sm:inline tracking-wide">
            24/7 AI Support
          </span>
        </button>
      )}

      {/* Floating Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/30">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">NextStep AI Assistant</h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    24/7 Live
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant support & platform guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950/50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200 dark:border-slate-700/80 shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-xs p-3 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 text-slate-500">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 rounded-full transition-colors shrink-0 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about NextStep..."
              className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-sm shrink-0 cursor-pointer"
              title="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
