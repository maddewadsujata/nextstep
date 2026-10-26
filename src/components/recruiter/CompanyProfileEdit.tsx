import React, { useState } from 'react';
import { Building2, Globe, MapPin, ShieldCheck, AlertCircle, Save, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const CompanyProfileEdit: React.FC = () => {
  const { recruiterProfile, updateRecruiterProfile } = useData();

  const [companyName, setCompanyName] = useState(recruiterProfile.companyName);
  const [industry, setIndustry] = useState(recruiterProfile.industry);
  const [website, setWebsite] = useState(recruiterProfile.website);
  const [location, setLocation] = useState(recruiterProfile.location);
  const [companyDescription, setCompanyDescription] = useState(recruiterProfile.companyDescription);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRecruiterProfile({
      companyName,
      industry,
      website,
      location,
      companyDescription,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Employer Brand & Verification Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Update how students view your company profile, culture, and verified credentials.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        
        {/* Verification Status Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          recruiterProfile.verificationStatus === 'verified'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            {recruiterProfile.verificationStatus === 'verified' ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold capitalize">
                Status: {recruiterProfile.verificationStatus}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                {recruiterProfile.verificationStatus === 'verified'
                  ? 'Your company identity and corporate domain have been fully approved by platform administrators.'
                  : 'Your verification request is currently under review by administrators.'}
              </p>
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Company profile updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Website URL</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Headquarters / Office Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Company Description & Mission</label>
            <textarea
              rows={4}
              value={companyDescription}
              onChange={e => setCompanyDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Company Details</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
