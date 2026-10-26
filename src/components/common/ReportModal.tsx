import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Internship } from '../../types';

interface ReportModalProps {
  internship: Internship | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ internship, onClose }) => {
  const { submitReport } = useData();
  const [reason, setReason] = useState('Payment requested or fees demanded');
  const [customNotes, setCustomNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!internship) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customNotes ? `${reason}: ${customNotes}` : reason;
    submitReport('internship', internship.id, `${internship.title} at ${internship.companyName}`, finalReason);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Report Suspicious Listing</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">Report Submitted to NextStep Moderation</p>
            <p className="text-xs text-slate-500">Our platform administrators will inspect this listing and audit log the review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300">
              Reporting: <strong>{internship.title}</strong> at {internship.companyName}
            </p>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reason for report
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="Payment requested or fees demanded">Payment requested or training fees demanded</option>
                <option value="Misleading stipend or false promises">Misleading stipend or false promises</option>
                <option value="Unverified or suspicious recruiter identity">Unverified or suspicious recruiter identity</option>
                <option value="Inappropriate or scam content">Inappropriate or scam content</option>
                <option value="Expired or non-responsive listing">Expired or non-responsive listing</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={customNotes}
                onChange={e => setCustomNotes(e.target.value)}
                placeholder="Explain what seemed fraudulent or misleading..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
