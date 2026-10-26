import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  FileText, 
  ExternalLink, 
  Github, 
  Linkedin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Award, 
  Code,
  Camera,
  ShieldCheck,
  X
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Project, Certification } from '../../types';

export const StudentProfileView: React.FC = () => {
  const { studentProfile, updateStudentProfile } = useData();
  const { currentUser, updateCurrentUser } = useAuth();

  const [selectedCertForView, setSelectedCertForView] = useState<Certification | null>(null);
  const [isEditingBasics, setIsEditingBasics] = useState(false);
  const [fullName, setFullName] = useState(studentProfile.fullName);
  const [college, setCollege] = useState(studentProfile.college);
  const [degree, setDegree] = useState(studentProfile.degree);
  const [branch, setBranch] = useState(studentProfile.branch);
  const [graduationYear, setGraduationYear] = useState(studentProfile.graduationYear);
  const [cgpa, setCgpa] = useState(studentProfile.cgpa || '');
  const [phone, setPhone] = useState(studentProfile.phone || '');
  const [portfolioUrl, setPortfolioUrl] = useState(studentProfile.portfolioUrl || '');
  const [githubUrl, setGithubUrl] = useState(studentProfile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(studentProfile.linkedinUrl || '');

  // Skills
  const [newSkill, setNewSkill] = useState('');

  // Project modal
  const [showAddProject, setShowAddProject] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTags, setProjTags] = useState('');
  const [projLink, setProjLink] = useState('');

  // Cert modal
  const [showAddCert, setShowAddCert] = useState(false);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('2026');
  const [certUrl, setCertUrl] = useState('');

  const handleSaveBasics = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile({
      fullName,
      college,
      degree,
      branch,
      graduationYear,
      cgpa,
      phone,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
    });
    setIsEditingBasics(false);
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      localStorage.setItem('nextstep_sujata_avatar', dataUrl);
      updateStudentProfile({ avatarUrl: dataUrl });
      updateCurrentUser({ avatarUrl: dataUrl });
      try {
        await fetch(`/api/students/${studentProfile.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: dataUrl }),
        });
      } catch {
        // offline fallback
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    localStorage.removeItem('nextstep_sujata_avatar');
    updateStudentProfile({ avatarUrl: '' });
    updateCurrentUser({ avatarUrl: '' });
    try {
      await fetch(`/api/students/${studentProfile.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: '' }),
      });
    } catch {
      // offline fallback
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!studentProfile.skills.includes(newSkill.trim())) {
      updateStudentProfile({
        skills: [...studentProfile.skills, newSkill.trim()]
      });
    }
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateStudentProfile({
      skills: studentProfile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: projTitle.trim(),
      description: projDesc.trim(),
      techTags: projTags.split(',').map(t => t.trim()).filter(Boolean),
      link: projLink.trim() || undefined,
    };
    updateStudentProfile({
      projects: [...studentProfile.projects, newProj]
    });
    setProjTitle('');
    setProjDesc('');
    setProjTags('');
    setProjLink('');
    setShowAddProject(false);
  };

  const handleRemoveProject = (id: string) => {
    updateStudentProfile({
      projects: studentProfile.projects.filter(p => p.id !== id)
    });
  };

  const handleCreateCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim()) return;
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      issuer: certIssuer.trim(),
      year: certYear.trim(),
      credentialUrl: certUrl.trim() || undefined,
    };
    updateStudentProfile({
      certifications: [...studentProfile.certifications, newCert]
    });
    setCertName('');
    setCertIssuer('');
    setCertYear('2026');
    setCertUrl('');
    setShowAddCert(false);
  };

  const handleRemoveCert = (id: string) => {
    updateStudentProfile({
      certifications: studentProfile.certifications.filter(c => c.id !== id)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {studentProfile.avatarUrl ? (
            <div className="relative group shrink-0">
              <img
                src={studentProfile.avatarUrl}
                alt={studentProfile.fullName}
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                referrerPolicy="no-referrer"
              />
              <label
                className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                title="Change personal profile photo"
              >
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md border-2 border-white/20">
                SM
              </div>
              <label
                className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-md cursor-pointer transition-transform hover:scale-110"
                title="Upload personal profile photo for Sujata Maddewad"
              >
                <Camera className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
              </label>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {studentProfile.fullName}
              </h1>
              {studentProfile.isDemo && (
                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                  Demo Student
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {studentProfile.degree} in {studentProfile.branch} · {studentProfile.college}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {studentProfile.email}
              </span>
              {studentProfile.phone && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {studentProfile.phone}
                  </span>
                </>
              )}
              {studentProfile.cgpa && (
                <>
                  <span>·</span>
                  <span>CGPA: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{studentProfile.cgpa}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-stretch sm:self-auto">
          <label className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
            <Camera className="w-3.5 h-3.5 text-indigo-500" />
            <span>{studentProfile.avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
          </label>

          {studentProfile.avatarUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="py-2 px-3 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors font-medium text-center"
            >
              Reset Photo
            </button>
          )}

          <button
            onClick={() => setIsEditingBasics(!isEditingBasics)}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingBasics ? 'Cancel Editing' : 'Edit Profile Info'}</span>
          </button>
        </div>
      </div>

      {/* Basic Edit Form Drawer */}
      {isEditingBasics && (
        <form onSubmit={handleSaveBasics} className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
            Edit Academic & Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Degree</label>
              <input
                type="text"
                value={degree}
                onChange={e => setDegree(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Branch / Major</label>
              <input
                type="text"
                value={branch}
                onChange={e => setBranch(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Graduation Year</label>
              <input
                type="text"
                value={graduationYear}
                onChange={e => setGraduationYear(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">CGPA / Grade</label>
              <input
                type="text"
                value={cgpa}
                onChange={e => setCgpa(e.target.value)}
                placeholder="e.g. 9.4 / 10.0"
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Portfolio Link</label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">GitHub Profile</label>
              <input
                type="text"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingBasics(false)}
              className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-1.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* TWO COLUMN GRID: Skills & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Projects Showcase & Certifications */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Projects Showcase */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <span>Technical Projects Portfolio ({studentProfile.projects.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Featured engineering builds highlighted for tech recruiter evaluation.
                </p>
              </div>

              <button
                onClick={() => setShowAddProject(!showAddProject)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {/* Add Project Form */}
            {showAddProject && (
              <form onSubmit={handleCreateProject} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div>
                  <label className="block font-medium mb-1">Project Title</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={e => setProjTitle(e.target.value)}
                    placeholder="e.g. NextStep — Smart Career Portal"
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Project Description & Impact</label>
                  <textarea
                    rows={2}
                    value={projDesc}
                    onChange={e => setProjDesc(e.target.value)}
                    placeholder="Explain what problem it solved, key architecture, and measurable outcome..."
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Tech Tags (comma separated)</label>
                    <input
                      type="text"
                      value={projTags}
                      onChange={e => setProjTags(e.target.value)}
                      placeholder="React, TypeScript, Tailwind"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Repository or Demo URL</label>
                    <input
                      type="text"
                      value={projLink}
                      onChange={e => setProjLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-3.5 bg-indigo-600 text-white rounded-lg font-semibold"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {studentProfile.projects.map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{project.title}</span>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                            title="Open Project Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveProject(project.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techTags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Tracker */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Certifications & Credentials</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Verified third-party engineering certifications and specializations.
                </p>
              </div>

              <button
                onClick={() => setShowAddCert(!showAddCert)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Credential</span>
              </button>
            </div>

            {showAddCert && (
              <form onSubmit={handleCreateCert} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Credential Name</label>
                    <input
                      type="text"
                      value={certName}
                      onChange={e => setCertName(e.target.value)}
                      placeholder="e.g. AWS Certified Cloud Practitioner"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Issuing Organization</label>
                    <input
                      type="text"
                      value={certIssuer}
                      onChange={e => setCertIssuer(e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Year Issued</label>
                    <input
                      type="text"
                      value={certYear}
                      onChange={e => setCertYear(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Verification URL</label>
                    <input
                      type="text"
                      value={certUrl}
                      onChange={e => setCertUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCert(false)}
                    className="py-1.5 px-3 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-3.5 bg-indigo-600 text-white rounded-lg font-semibold"
                  >
                    Save Credential
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {studentProfile.certifications.map(cert => (
                <div
                  key={cert.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between group hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800 font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {cert.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {cert.issuer}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                        Issued {cert.year}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveCert(cert.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Remove credential"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedCertForView(cert)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>View Certificate</span>
                    </button>

                    {cert.credentialUrl && cert.credentialUrl.trim() !== '' && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                      >
                        External <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Skills & Career Links */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Skills Tag Management */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Skills & Proficiencies ({studentProfile.skills.length})
            </h2>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Next.js, PyTorch)..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 cursor-pointer"
                title="Add skill"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {studentProfile.skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-md"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-400 hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Online Presence & Links */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 text-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Online Profiles & Work
            </h2>

            <div className="space-y-2">
              <a
                href={studentProfile.githubUrl || 'https://github.com/maddewadsujata/'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <Github className="w-4 h-4" /> GitHub
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                  github.com/maddewadsujata <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </a>

              <a
                href={studentProfile.linkedinUrl || 'https://www.linkedin.com/in/sujata-maddewad'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                  <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                  linkedin.com/in/sujata-maddewad <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </a>

              {/* Render Portfolio button ONLY if an actual real portfolio URL exists */}
              {Boolean(studentProfile.portfolioUrl && studentProfile.portfolioUrl.trim() !== '') && (
                <a
                  href={studentProfile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                >
                  <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                    <FileText className="w-4 h-4 text-emerald-600" /> Portfolio Website
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* VIEW CERTIFICATE MODAL */}
      {selectedCertForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full mb-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified Academic & Professional Credential</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    {selectedCertForView.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCertForView(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Certificate Display Plaque */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-850 dark:via-slate-900 dark:to-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-inner text-center space-y-4">
              <div className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400">
                Official Credential Verification
              </div>

              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {selectedCertForView.name}
              </h4>

              <div className="text-xs text-slate-600 dark:text-slate-300">
                Awarded to: <strong className="text-slate-900 dark:text-white text-sm block mt-0.5">Sujata Maddewad</strong>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-slate-200 dark:border-slate-800 text-left">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Issuing Authority</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCertForView.issuer}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Completion Year</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCertForView.year}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 italic">
                Demonstrated competencies verified for collegiate engineering recruitment through NextStep.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {selectedCertForView.credentialUrl && selectedCertForView.credentialUrl.trim() !== '' && (
                <a
                  href={selectedCertForView.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Verification Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedCertForView(null)}
                className="py-2 px-4 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
