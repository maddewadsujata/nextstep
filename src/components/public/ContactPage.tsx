import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Platform Inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Contact NextStep Support & Careers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions about recruiter verification, student onboarding, or Gemini AI features? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: FAQs & Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">How does Recruiter Verification work?</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Platform admins verify company domains and executive credentials before granting public listing approval to protect student applicants.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Are sample internships real jobs?</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Demo opportunities are provided for testing workflows and realistic platform evaluation. Real recruiters can post active listings directly.
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Who developed NextStep?</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                NextStep is architected and engineered by <strong>Sujata Maddewad</strong> (Software Engineering, Pune, Maharashtra) as an intelligent internship discovery and recruitment management ecosystem.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="font-bold text-slate-800 dark:text-slate-200">Headquarters & Support:</p>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Pune, Maharashtra, India · Available 24/7 via the interactive NextStep AI Assistant.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="md:col-span-7 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {sent ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Message Dispatched!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out to NextStep. A support coordinator will respond to {email} shortly.
              </p>
              <button
                onClick={() => { setSent(false); setMessage(''); }}
                className="mt-2 py-1.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Submit an Inquiry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sujata Maddewad"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@domain.edu"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="General Platform Inquiry">General Platform Inquiry</option>
                  <option value="Recruiter Verification Help">Recruiter Verification Help</option>
                  <option value="Bug Report or Technical Support">Bug Report or Technical Support</option>
                  <option value="Academic Collaboration">Academic Collaboration</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your question or feedback..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
