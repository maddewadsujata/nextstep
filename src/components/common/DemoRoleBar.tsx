import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserCheck, Briefcase, ShieldAlert, RotateCcw } from 'lucide-react';

interface DemoRoleBarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

export const DemoRoleBar: React.FC<DemoRoleBarProps> = ({ onNavigate, currentPage }) => {
  const { currentUser, switchDemoRole } = useAuth();
  const { resetToDemoSeed } = useData();
  const [isMongoLive, setIsMongoLive] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/db/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.isLiveMongo) {
          setIsMongoLive(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-400">NextStep Demo Environment</span>
          <span className="hidden sm:inline text-slate-500">·</span>
          <span className="text-slate-400 hidden sm:inline">Switch active preview persona:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => switchDemoRole('student')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              currentUser?.role === 'student' && currentUser?.isDemo
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Switch to Student Persona (Sujata Maddewad)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sujata Maddewad (Student)</span>
          </button>

          <button
            onClick={() => switchDemoRole('recruiter')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              currentUser?.role === 'recruiter' && currentUser?.isDemo
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Switch to Recruiter Persona (Sakshi Maddewad)"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Sakshi Maddewad (Recruiter)</span>
          </button>

          <button
            onClick={() => switchDemoRole('admin')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
              currentUser?.role === 'admin' && currentUser?.isDemo
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
            title="Switch to Admin Persona (Mayank Maddewad)"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Mayank Maddewad (Admin)</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block" />

          <button
            onClick={() => resetToDemoSeed()}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset to initial seed records"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
