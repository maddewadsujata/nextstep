import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Bookmark, 
  Share2, 
  AlertTriangle, 
  ArrowUpDown, 
  MapPin, 
  Clock, 
  Building2, 
  CheckCircle2, 
  X, 
  Briefcase, 
  Sparkles, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Internship } from '../../types';

export interface InternshipDiscoveryProps {
  initialQuery?: string;
  initialCategory?: string;
  initialCompany?: string;
  initialLocation?: string;
  onSelectInternship: (internship: Internship) => void;
  onOpenReportModal: (internship: Internship) => void;
}

export const InternshipDiscovery: React.FC<InternshipDiscoveryProps> = ({
  initialQuery = '',
  initialCategory = 'All',
  initialCompany = 'All',
  initialLocation = 'All',
  onSelectInternship,
  onOpenReportModal,
}) => {
  const { internships, savedInternshipIds, toggleSaveInternship, applications, studentProfile } = useData();
  const { currentUser } = useAuth();

  // Search & Filter States
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [minStipend, setMinStipend] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'stipend' | 'deadline' | 'company'>('newest');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Sync with initial props if they change
  useEffect(() => {
    if (initialQuery) setSearch(initialQuery);
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialCompany) setSelectedCompany(initialCompany);
    if (initialLocation) setSelectedLocation(initialLocation);
  }, [initialQuery, initialCategory, initialCompany, initialLocation]);

  // Check which internships current student has already applied to
  const appliedInternshipIds = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set(applications.filter(a => a.studentId === currentUser.id).map(a => a.internshipId));
  }, [applications, currentUser]);

  // Published internships list
  const publishedInternships = useMemo(() => {
    return internships.filter(i => i.status === 'published');
  }, [internships]);

  // Dynamically extract unique categories with counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedInternships.forEach(i => {
      const cat = i.domain || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [publishedInternships]);

  // Dynamically extract unique company names with counts
  const companyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedInternships.forEach(i => {
      const comp = i.companyName?.trim();
      if (comp) {
        counts[comp] = (counts[comp] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [publishedInternships]);

  // Dynamically extract unique locations with counts
  const locationStats = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedInternships.forEach(i => {
      const loc = i.location?.trim();
      if (loc) {
        counts[loc] = (counts[loc] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [publishedInternships]);

  // Filtered & Sorted internships
  const filteredList = useMemo(() => {
    return publishedInternships
      .filter(i => {
        // Keyword Search across title, company, skills, location, description
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchesTitle = i.title.toLowerCase().includes(q);
          const matchesCompany = i.companyName.toLowerCase().includes(q);
          const matchesSkills = i.requiredSkills.some(s => s.toLowerCase().includes(q));
          const matchesLocation = i.location.toLowerCase().includes(q);
          const matchesDescription = i.description?.toLowerCase().includes(q);
          const matchesDomain = i.domain?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesLocation && !matchesDescription && !matchesDomain) {
            return false;
          }
        }

        // Category / Domain filter
        if (selectedCategory !== 'All' && i.domain !== selectedCategory) {
          return false;
        }

        // Company filter
        if (selectedCompany !== 'All' && i.companyName.toLowerCase() !== selectedCompany.toLowerCase()) {
          return false;
        }

        // Location filter (handles exact and substring match, e.g. "Pune" matches "Pune, Maharashtra (or Remote)")
        if (selectedLocation !== 'All') {
          const locLower = i.location.toLowerCase();
          const filterLower = selectedLocation.toLowerCase();
          if (filterLower === 'remote') {
            if (!locLower.includes('remote') && i.type !== 'Remote') return false;
          } else if (!locLower.includes(filterLower) && !filterLower.includes(locLower)) {
            return false;
          }
        }

        // Work Mode filter (Remote/Hybrid/On-site)
        if (selectedType !== 'All' && i.type !== selectedType) {
          return false;
        }

        // Experience filter
        if (selectedExperience !== 'All' && i.experienceLevel !== selectedExperience) {
          return false;
        }

        // Minimum stipend
        if (i.stipendNumeric < minStipend) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'stipend') {
          return b.stipendNumeric - a.stipendNumeric;
        }
        if (sortBy === 'deadline') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'company') {
          return a.companyName.localeCompare(b.companyName);
        }
        return 0;
      });
  }, [
    publishedInternships, 
    search, 
    selectedCategory, 
    selectedCompany, 
    selectedLocation, 
    selectedType, 
    selectedExperience, 
    minStipend, 
    sortBy
  ]);

  // Skill match scoring for current student (e.g. Sujata Maddewad)
  const studentSkills = useMemo(() => {
    return studentProfile?.skills || [];
  }, [studentProfile]);

  const calculateMatch = (internship: Internship) => {
    if (!studentSkills || studentSkills.length === 0) return null;
    const matched = internship.requiredSkills.filter(req => 
      studentSkills.some(userSkill => 
        userSkill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    return Math.round((matched.length / Math.max(1, internship.requiredSkills.length)) * 100);
  };

  const handleShare = (internship: Internship, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?internship=${internship.id}`;
    navigator.clipboard.writeText(url);
    setCopyFeedback(internship.id);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedCompany('All');
    setSelectedLocation('All');
    setSelectedType('All');
    setSelectedExperience('All');
    setMinStipend(0);
  };

  const hasActiveFilters = 
    Boolean(search.trim()) || 
    selectedCategory !== 'All' || 
    selectedCompany !== 'All' || 
    selectedLocation !== 'All' || 
    selectedType !== 'All' || 
    selectedExperience !== 'All' || 
    minStipend > 0;

  // Pre-defined category list with user friendly labels
  const allCategories = [
    { key: 'All', label: 'All Categories', count: publishedInternships.length },
    { key: 'Engineering', label: 'Engineering', count: categoryStats['Engineering'] || 0 },
    { key: 'Data Science', label: 'Data Science & AI', count: categoryStats['Data Science'] || 0 },
    { key: 'Design', label: 'UI/UX Design', count: categoryStats['Design'] || 0 },
    { key: 'DevOps', label: 'Cloud & DevOps', count: categoryStats['DevOps'] || 0 },
    { key: 'Product', label: 'Product Management', count: categoryStats['Product'] || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Page Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2 border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Opportunity Finder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Browse Available Internships
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Search and filter curated opportunities across diverse categories, top-tier hiring companies, and preferred work locations.
          </p>
        </div>

        {/* Live Opportunities Count & Sort Selector */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span><strong className="text-slate-900 dark:text-white">{publishedInternships.length}</strong> Total Opportunities</span>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              <option value="newest">Newest Posted</option>
              <option value="stipend">Highest Stipend</option>
              <option value="deadline">Approaching Deadline</option>
              <option value="company">Company (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* QUICK CATEGORY TABS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {allCategories.map(cat => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND FILTER CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        
        {/* Main Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by role title, technical skill (e.g. React, Python), keyword, company, or location..."
            className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* PRIMARY FILTERS: Categories, Company Names, Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* 1. Category Filter */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                <span>Category / Domain</span>
              </span>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="All">All Categories ({publishedInternships.length})</option>
                <option value="Engineering">Engineering ({categoryStats['Engineering'] || 0})</option>
                <option value="Data Science">Data Science & AI ({categoryStats['Data Science'] || 0})</option>
                <option value="Design">UI/UX Design ({categoryStats['Design'] || 0})</option>
                <option value="DevOps">Cloud & DevOps ({categoryStats['DevOps'] || 0})</option>
                <option value="Product">Product Management ({categoryStats['Product'] || 0})</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 2. Company Name Filter */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Company Name</span>
              </span>
              {selectedCompany !== 'All' && (
                <button
                  onClick={() => setSelectedCompany('All')}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="All">All Companies ({publishedInternships.length})</option>
                {companyStats.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* 3. Location Filter */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Location</span>
              </span>
              {selectedLocation !== 'All' && (
                <button
                  onClick={() => setSelectedLocation('All')}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none pr-8 cursor-pointer"
              >
                <option value="All">All Locations ({publishedInternships.length})</option>
                <option value="Remote">Remote Only</option>
                {locationStats
                  .filter(l => !l.name.toLowerCase().includes('remote only'))
                  .map(l => (
                    <option key={l.name} value={l.name}>
                      {l.name} ({l.count})
                    </option>
                  ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* QUICK SHORTCUT FILTER CHIPS: Top Companies & Top Locations */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          {/* Quick Companies */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>Companies:</span>
            </span>
            {companyStats.map(c => {
              const isActive = selectedCompany === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCompany(isActive ? 'All' : c.name)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.name} <span className="opacity-70">({c.count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Locations */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Locations:</span>
            </span>
            {['Pune, Maharashtra', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Noida, Uttar Pradesh', 'Remote'].map(loc => {
              const isActive = selectedLocation.toLowerCase().includes(loc.toLowerCase());
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(isActive ? 'All' : loc)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* TOGGLE ADVANCED FILTERS (Work Mode, Experience Level, Min Stipend) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedFilters ? 'Hide' : 'Show'} Additional Filters (Work Mode, Experience, Stipend)</span>
          </button>

          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 mt-3 border-t border-dashed border-slate-200 dark:border-slate-700 animate-fadeIn">
              
              {/* Work Mode */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Work Mode
                </label>
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Modes</option>
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Experience Level
                </label>
                <select
                  value={selectedExperience}
                  onChange={e => setSelectedExperience(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Experience</option>
                  <option value="Beginner">Beginner / Student</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              {/* Minimum Stipend */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span>Min Stipend</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">₹{minStipend.toLocaleString('en-IN')}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40000"
                  step="2500"
                  value={minStipend}
                  onChange={e => setMinStipend(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer mt-1"
                />
              </div>

            </div>
          )}
        </div>

        {/* ACTIVE FILTERS SUMMARY CHIPS & RESET ACTION */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Active Filters:</span>
              
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px]">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-indigo-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px]">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-indigo-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCompany !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]">
                  Company: {selectedCompany}
                  <button onClick={() => setSelectedCompany('All')} className="hover:text-blue-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedLocation !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                  Location: {selectedLocation}
                  <button onClick={() => setSelectedLocation('All')} className="hover:text-emerald-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedType !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                  Mode: {selectedType}
                  <button onClick={() => setSelectedType('All')} className="hover:text-slate-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedExperience !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px]">
                  Level: {selectedExperience}
                  <button onClick={() => setSelectedExperience('All')} className="hover:text-slate-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minStipend > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px]">
                  Min Stipend: ₹{minStipend.toLocaleString('en-IN')}/mo
                  <button onClick={() => setMinStipend(0)} className="hover:text-amber-900 dark:hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">
                Found <strong className="text-slate-900 dark:text-white tabular-nums">{filteredList.length}</strong> matching roles
              </span>
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold text-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RESULTS COUNT & SUMMARY */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white font-semibold tabular-nums">{filteredList.length}</strong> of{' '}
          <strong className="text-slate-900 dark:text-white font-semibold tabular-nums">{publishedInternships.length}</strong> available opportunities
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {selectedCompany !== 'All' && ` at ${selectedCompany}`}
          {selectedLocation !== 'All' && ` in ${selectedLocation}`}
        </span>
      </div>

      {/* INTERNSHIP CARDS GRID */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No internship opportunities found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No roles match your combined filters for category, company, and location. Try resetting your filters or adjusting your search keyword.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map(internship => {
            const isSaved = savedInternshipIds.includes(internship.id);
            const isApplied = appliedInternshipIds.has(internship.id);
            const matchScore = calculateMatch(internship);

            return (
              <div
                key={internship.id}
                onClick={() => onSelectInternship(internship)}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top row: Company, Category badge & Quick Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-slate-800 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm shrink-0">
                        {internship.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{internship.companyName}</span>
                        </p>
                        <span className="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md mt-0.5">
                          {internship.domain}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleShare(internship, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Copy Share Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveInternship(internship.id);
                        }}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          isSaved ? 'text-indigo-600 fill-indigo-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save Internship'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-600' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenReportModal(internship);
                        }}
                        className="p-1.5 text-slate-300 hover:text-amber-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Report Listing"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {internship.title}
                  </h3>

                  {/* Metadata line: Location, Mode, Duration */}
                  <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 mb-2.5">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{internship.location}</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
                      {internship.type}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{internship.duration}</span>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {internship.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {internship.requiredSkills.slice(0, 4).map(skill => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/70 px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                    {internship.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
                        +{internship.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* ATS Skill Match Badge for logged in student */}
                  {matchScore !== null && (
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            matchScore >= 70 ? 'bg-emerald-500' : matchScore >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${matchScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {matchScore}% Profile Match
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Stipend, Deadline & Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block text-sm text-emerald-600 dark:text-emerald-400">
                      {internship.stipend}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Deadline: {new Date(internship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  </div>

                  {isApplied ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl transition-all shadow-sm group-hover:shadow-md">
                      <span>View & Apply</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </span>
                  )}
                </div>

                {/* Copy feedback toast */}
                {copyFeedback === internship.id && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-xl animate-fade-in border border-slate-700">
                    Share link copied to clipboard!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

