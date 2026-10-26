import React, { useState } from 'react';
import { Plus, Edit2, Copy, XCircle, CheckCircle, Search, Filter } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Internship, InternshipDomain, InternshipWorkType } from '../../types';

export const ManageInternships: React.FC = () => {
  const { 
    internships, 
    createInternship, 
    updateInternship, 
    duplicateInternship, 
    changeInternshipStatus, 
    recruiterProfile 
  } = useData();
  const { currentUser } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState<InternshipDomain>('Engineering');
  const [type, setType] = useState<InternshipWorkType>('Hybrid');
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [stipend, setStipend] = useState('₹18,000 / month');
  const [stipendNumeric, setStipendNumeric] = useState(18000);
  const [duration, setDuration] = useState('6 Months');
  const [openings, setOpenings] = useState(2);
  const [deadline, setDeadline] = useState('2026-12-31T23:59:59Z');
  const [experienceLevel, setExperienceLevel] = useState<'All Levels' | 'Beginner' | 'Intermediate'>('Beginner');
  const [description, setDescription] = useState('');
  const [responsibilitiesStr, setResponsibilitiesStr] = useState('');
  const [eligibilityStr, setEligibilityStr] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  const myListings = internships.filter(i => i.recruiterId === currentUser?.id || i.recruiterId === 'user-recruiter-marcus-01');

  const filteredListings = myListings.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setDomain('Engineering');
    setType('Hybrid');
    setLocation('Pune, Maharashtra (or Remote)');
    setStipend('₹18,000 / month');
    setStipendNumeric(18000);
    setDuration('3 Months');
    setOpenings(2);
    setDeadline('2026-12-31T23:59:59Z');
    setExperienceLevel('Beginner');
    setDescription('');
    setResponsibilitiesStr('Design and ship high-impact features\nCollaborate on clean GitHub pull requests\nWrite unit and integration tests');
    setEligibilityStr('Undergraduate or graduate in Computer Science or related engineering\nProficiency in modern TypeScript or Python\nStrong collaborative problem solving');
    setSkillsStr('React, TypeScript, Tailwind CSS, Node.js, Git');
    setShowModal(true);
  };

  const handleOpenEdit = (item: Internship) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDomain(item.domain);
    setType(item.type);
    setLocation(item.location);
    setStipend(item.stipend);
    setStipendNumeric(item.stipendNumeric);
    setDuration(item.duration);
    setOpenings(item.openings);
    setDeadline(item.deadline);
    setExperienceLevel(item.experienceLevel);
    setDescription(item.description);
    setResponsibilitiesStr(item.responsibilities.join('\n'));
    setEligibilityStr(item.eligibility.join('\n'));
    setSkillsStr(item.requiredSkills.join(', '));
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const responsibilities = responsibilitiesStr.split('\n').map(s => s.trim()).filter(Boolean);
    const eligibility = eligibilityStr.split('\n').map(s => s.trim()).filter(Boolean);
    const requiredSkills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

    if (editingId) {
      updateInternship(editingId, {
        title,
        domain,
        type,
        location,
        stipend,
        stipendNumeric,
        duration,
        openings,
        deadline,
        experienceLevel,
        description,
        responsibilities,
        eligibility,
        requiredSkills,
      });
    } else {
      createInternship({
        title,
        companyName: recruiterProfile.companyName,
        description,
        responsibilities,
        eligibility,
        requiredSkills,
        stipend,
        stipendNumeric,
        duration,
        location,
        type,
        openings,
        deadline,
        experienceLevel,
        domain,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manage Internship Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, modify, duplicate, and publish opportunities for collegiate candidates.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Internship</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'published', 'draft', 'pending_approval', 'closed'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize whitespace-nowrap ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Role Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Mode & Location</th>
                <th className="py-3 px-4">Stipend</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredListings.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <span className="text-[10px] text-slate-400">Created {new Date(item.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">{item.domain}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {item.location} ({item.type})
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{item.stipend}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      item.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'draft'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        : item.status === 'pending_approval'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => duplicateInternship(item.id)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        title="Duplicate Listing"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {item.status === 'published' ? (
                        <button
                          onClick={() => changeInternshipStatus(item.id, 'closed')}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Close Listing"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => changeInternshipStatus(item.id, 'published')}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Publish Listing"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit Internship Listing' : 'Post New Internship Opportunity'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium mb-1">Role Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. AI Platforms Software Engineer Intern"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Domain</label>
                  <select
                    value={domain}
                    onChange={e => setDomain(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Work Mode</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Stipend (Display String)</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={e => setStipend(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Numeric Stipend (for filtering)</label>
                  <input
                    type="number"
                    value={stipendNumeric}
                    onChange={e => setStipendNumeric(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Openings</label>
                  <input
                    type="number"
                    value={openings}
                    onChange={e => setOpenings(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={e => setExperienceLevel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={e => setSkillsStr(e.target.value)}
                  placeholder="React, TypeScript, Python, Tailwind"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Overview Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Key Responsibilities (one per line)</label>
                <textarea
                  rows={3}
                  value={responsibilitiesStr}
                  onChange={e => setResponsibilitiesStr(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Eligibility Criteria (one per line)</label>
                <textarea
                  rows={3}
                  value={eligibilityStr}
                  onChange={e => setEligibilityStr(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
                >
                  {editingId ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
