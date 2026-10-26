import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  History, 
  Lock, 
  Search, 
  Trash2, 
  UserCheck, 
  UserX, 
  Filter, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { User, Internship } from '../../types';

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { 
    allUsers, 
    internships, 
    applications, 
    auditLogs, 
    setUserStatus, 
    deleteUser,
    changeInternshipStatus
  } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'internships' | 'audit'>('overview');

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'recruiter' | 'admin'>('all');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Internship management state
  const [internshipSearch, setInternshipSearch] = useState('');
  const [internshipStatusFilter, setInternshipStatusFilter] = useState<string>('all');

  // Computed platform statistics
  const totalStudents = allUsers.filter(u => u.role === 'student').length;
  const totalRecruiters = allUsers.filter(u => u.role === 'recruiter').length;
  const activeInternships = internships.filter(i => i.status === 'published').length;
  const totalApplications = applications.length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchSearch = !userSearchQuery.trim() || 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [allUsers, userRoleFilter, userSearchQuery]);

  // Filtered internships
  const filteredInternships = useMemo(() => {
    return internships.filter(i => {
      const matchStatus = internshipStatusFilter === 'all' || i.status === internshipStatusFilter;
      const matchSearch = !internshipSearch.trim() || 
        i.title.toLowerCase().includes(internshipSearch.toLowerCase()) || 
        i.companyName.toLowerCase().includes(internshipSearch.toLowerCase()) ||
        i.location.toLowerCase().includes(internshipSearch.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [internships, internshipStatusFilter, internshipSearch]);

  const handleToggleUserStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const reason = nextStatus === 'suspended' ? 'Administrative suspension' : 'Administrative reactivation';
    setUserStatus(user.id, nextStatus, reason);
    showToast(`User account for ${user.name} is now ${nextStatus}.`);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const name = userToDelete.name;
    deleteUser(userToDelete.id);
    setUserToDelete(null);
    showToast(`User "${name}" deleted successfully.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
            <Lock className="w-3.5 h-3.5" />
            <span>Administrative Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {currentUser?.name || 'Mayank Maddewad'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Platform Oversight & Management · Administrator ({currentUser?.email || 'mayank.admin@nextstep.org'})
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Users</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full tabular-nums">
              {allUsers.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('internships')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'internships' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Internships</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full tabular-nums">
              {internships.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => setActiveTab('users')}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Students</span>
                <GraduationCap className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
                {totalStudents}
              </p>
              <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors mt-1 block">
                Manage student records →
              </span>
            </div>

            <div 
              onClick={() => setActiveTab('users')}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Recruiters</span>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
                {totalRecruiters}
              </p>
              <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors mt-1 block">
                Verified hiring leads →
              </span>
            </div>

            <div 
              onClick={() => setActiveTab('internships')}
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-400 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Internships</span>
                <Briefcase className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
                {activeInternships}
              </p>
              <span className="text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors mt-1 block">
                Live opportunities →
              </span>
            </div>

            <div 
              className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Applications</span>
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums mt-2">
                {totalApplications}
              </p>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tracked pipeline submissions
              </span>
            </div>
          </div>

          {/* Quick Platform Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Application Pipeline Breakdown</span>
              </h3>
              
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Applied', count: applications.filter(a => a.status === 'applied').length, color: 'bg-slate-400' },
                  { label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length, color: 'bg-blue-500' },
                  { label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length, color: 'bg-indigo-500' },
                  { label: 'Interview Scheduled', count: applications.filter(a => a.status === 'interview_scheduled').length, color: 'bg-violet-500' },
                  { label: 'Offer Received / Accepted', count: applications.filter(a => a.status === 'offer_received' || a.status === 'accepted').length, color: 'bg-emerald-500' },
                  { label: 'Withdrawn by Student', count: applications.filter(a => a.status === 'withdrawn').length, color: 'bg-slate-300' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Quick Administration Actions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all cursor-pointer group"
                >
                  <Users className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-slate-900 dark:text-white">Manage All Users</p>
                  <p className="text-[11px] text-slate-500 mt-1">Activate, deactivate, or delete user accounts.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('internships')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all cursor-pointer group"
                >
                  <Briefcase className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-slate-900 dark:text-white">Manage Listings</p>
                  <p className="text-[11px] text-slate-500 mt-1">Review, close, or publish internship posts.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audit')}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all cursor-pointer group"
                >
                  <History className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-slate-900 dark:text-white">Audit Trail</p>
                  <p className="text-[11px] text-slate-500 mt-1">Inspect timestamped administrative event logs.</p>
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('explore')}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left transition-all cursor-pointer group"
                  >
                    <ArrowUpRight className="w-5 h-5 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-slate-900 dark:text-white">View Public Portal</p>
                    <p className="text-[11px] text-slate-500 mt-1">Preview how students discover opportunities.</p>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in text-xs space-y-4 p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>User Directory & Account Controls ({allUsers.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active students, corporate recruiters, and platform administrators.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              {(['all', 'student', 'recruiter', 'admin'] as const).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors capitalize cursor-pointer ${
                    userRoleFilter === role
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : `${role}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              placeholder="Search user by name or email address..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No users match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {user.name}
                            </span>
                            {user.isDemo && (
                              <span className="text-[10px] text-indigo-500 font-medium">Default Demo Account</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {user.email}
                      </td>

                      <td className="py-3 px-4 capitalize font-semibold">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : user.role === 'recruiter'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                            : 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded capitalize ${
                          user.status === 'active' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(user)}
                              className={`text-xs font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                                user.status === 'active'
                                  ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                            >
                              {user.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}

                          {user.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. INTERNSHIPS MANAGEMENT TAB */}
      {activeTab === 'internships' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-fade-in text-xs space-y-4 p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Internships Management ({internships.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and manage all corporate listings across the platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={internshipStatusFilter}
                onChange={e => setInternshipStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses ({internships.length})</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={internshipSearch}
              onChange={e => setInternshipSearch(e.target.value)}
              placeholder="Search by title, company, or city..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700/80 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stipend</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredInternships.map(internship => (
                  <tr key={internship.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {internship.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {internship.companyName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {internship.location}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {internship.stipend}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded capitalize ${
                        internship.status === 'published'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : internship.status === 'closed'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {internship.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {internship.status === 'published' ? (
                        <button
                          type="button"
                          onClick={() => {
                            changeInternshipStatus(internship.id, 'closed');
                            showToast(`Internship "${internship.title}" closed.`);
                          }}
                          className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Close Listing
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            changeInternshipStatus(internship.id, 'published');
                            showToast(`Internship "${internship.title}" published.`);
                          }}
                          className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 4. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Platform Governance Audit Trail</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifiable event logs of user actions, status changes, and administrator operations.
              </p>
            </div>
            <span className="text-slate-400 font-semibold tabular-nums">Total entries: {auditLogs.length}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-[11px] bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {log.target}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    {log.details}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-slate-400 text-[10px] block tabular-nums">
                    {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {log.adminName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION DIALOG */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm User Deletion
                </h3>
                <span className="text-xs text-slate-500">
                  Permanent Database Action
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete user <strong>{userToDelete.name}</strong> ({userToDelete.email})?
            </p>
            <p className="text-[11px] text-slate-400">
              This will permanently remove the account credentials and profile records. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="py-2 px-3.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SUCCESS NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-250 border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
