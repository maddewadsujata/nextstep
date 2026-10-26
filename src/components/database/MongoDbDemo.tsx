import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Key, 
  Copy, 
  Check, 
  ExternalLink,
  Code2,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  X,
  Loader2
} from 'lucide-react';
import { MongoInternshipRecord, MongoDbStatus } from '../../types';

interface MongoDbDemoProps {
  onBackToDashboard?: () => void;
}

export const MongoDbDemo: React.FC<MongoDbDemoProps> = ({ onBackToDashboard }) => {
  const [records, setRecords] = useState<MongoInternshipRecord[]>([]);
  const [dbStatus, setDbStatus] = useState<MongoDbStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Feedback alerts
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Panels
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [viewingRecord, setViewingRecord] = useState<MongoInternshipRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<MongoInternshipRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MongoInternshipRecord | null>(null);
  const [showConnectionPanel, setShowConnectionPanel] = useState<boolean>(false);
  const [customUriInput, setCustomUriInput] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'crud' | 'endpoints' | 'schema' | 'viva'>('crud');

  // Form states for Create
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Pune, Maharashtra');
  const [newSkills, setNewSkills] = useState('React, TypeScript, MongoDB');
  const [newDescription, setNewDescription] = useState('');
  const [newStipend, setNewStipend] = useState('₹18,000 / month');
  const [newOpenings, setNewOpenings] = useState(2);
  const [newWorkType, setNewWorkType] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStipend, setEditStipend] = useState('');
  const [editOpenings, setEditOpenings] = useState(1);
  const [editWorkType, setEditWorkType] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');

  // Load database status & records
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error('Failed to query db status:', err);
    }
  };

  const fetchRecords = async (showToast = false) => {
    setLoading(true);
    try {
      const res = await fetch('/api/internships');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        if (showToast) {
          showSuccess(`Refreshed ${json.data.length} records from ${json.source === 'mongodb' ? 'MongoDB database' : 'NoSQL data store'}.`);
        }
      } else {
        setErrorMessage(json.error || 'Failed to retrieve records');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Network error fetching MongoDB records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
    fetchRecords();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage(null);
  };

  // 1. CREATE Operation
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim() || !newLocation.trim() || !newDescription.trim() || !newSkills.trim()) {
      showError('Please fill in all required fields (Title, Company, Location, Skills, Description).');
      return;
    }

    setActionLoading(true);
    try {
      const skillsArray = newSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/internships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          company: newCompany.trim(),
          location: newLocation.trim(),
          skills: skillsArray,
          description: newDescription.trim(),
          stipend: newStipend.trim(),
          openings: Number(newOpenings),
          workType: newWorkType,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(`Success: Document created with MongoDB ObjectId "${json.data._id}"!`);
        setShowCreateForm(false);
        // Reset form
        setNewTitle('');
        setNewCompany('');
        setNewDescription('');
        setNewSkills('React, TypeScript, MongoDB');
        // Refresh table
        await fetchRecords();
      } else {
        showError(json.error || 'Failed to create document in MongoDB');
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error creating MongoDB record');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. UPDATE Operation
  const handleStartEdit = (record: MongoInternshipRecord) => {
    setEditingRecord(record);
    setEditTitle(record.title);
    setEditCompany(record.company);
    setEditLocation(record.location);
    setEditSkills(Array.isArray(record.skills) ? record.skills.join(', ') : '');
    setEditDescription(record.description);
    setEditStipend(record.stipend || '₹18,000 / month');
    setEditOpenings(record.openings || 1);
    setEditWorkType(record.workType || 'Hybrid');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    setActionLoading(true);
    try {
      const skillsArray = editSkills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch(`/api/internships/${editingRecord._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          company: editCompany.trim(),
          location: editLocation.trim(),
          skills: skillsArray,
          description: editDescription.trim(),
          stipend: editStipend.trim(),
          openings: Number(editOpenings),
          workType: editWorkType,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(`Updated document "${editingRecord._id}" successfully!`);
        setEditingRecord(null);
        await fetchRecords();
      } else {
        showError(json.error || 'Failed to update MongoDB record');
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error updating MongoDB record');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. DELETE Operation
  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/internships/${deletingRecord._id}`, {
        method: 'DELETE',
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(`Deleted document "${deletingRecord._id}" from database.`);
        setDeletingRecord(null);
        await fetchRecords();
      } else {
        showError(json.error || 'Failed to delete record from MongoDB');
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error deleting MongoDB document');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. SEED SAMPLE RECORDS
  const handleSeedData = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/internships/seed', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) {
        showSuccess(json.message || 'Seeded sample documents successfully.');
        await fetchRecords();
      } else {
        showError(json.error || 'Failed to seed sample documents');
      }
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Error during sample database seed');
    } finally {
      setActionLoading(false);
    }
  };

  // Connect to custom MongoDB URI
  const handleConnectCustomUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUriInput.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/db/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUriInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        showSuccess(`Connected to MongoDB Atlas: ${json.message}`);
        setShowConnectionPanel(false);
        setCustomUriInput('');
      } else {
        showError(`MongoDB connection error: ${json.message}`);
      }
      await fetchDbStatus();
      await fetchRecords();
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Failed to reach MongoDB server');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered records
  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    const skillsMatch = Array.isArray(r.skills) && r.skills.some(s => s.toLowerCase().includes(q));
    return (
      r.title.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      r._id.toLowerCase().includes(q) ||
      skillsMatch
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner / Breadcrumb */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>MongoDB & Mongoose NoSQL Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              MongoDB Database Operations & CRUD Demo
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Demonstrates complete document-oriented NoSQL lifecycle operations: <strong>Create</strong>, <strong>Read</strong>, <strong>Update</strong>, and <strong>Delete</strong> on the NextStep backend using Mongoose ODM, strict schema validation, and valid MongoDB ObjectIds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                ← Back to Dashboard
              </button>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Record</span>
            </button>
          </div>
        </div>

        {/* Database Live Status Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Connection Status:</span>
              {dbStatus?.isLiveMongo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Connected to MongoDB ({dbStatus.database || 'nextstep'})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  In-Memory NoSQL Fallback (Ready for Atlas)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>Driver:</span>
              <span className="font-mono text-slate-300">{dbStatus?.driver || 'Mongoose v9.x'}</span>
            </div>

            {dbStatus?.maskedUri && (
              <div className="flex items-center gap-2 text-slate-400 font-mono hidden md:flex">
                <span>URI:</span>
                <span className="text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                  {dbStatus.maskedUri}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConnectionPanel(!showConnectionPanel)}
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{showConnectionPanel ? 'Hide Connection Config' : 'Configure MongoDB URI'}</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => fetchRecords(true)}
              disabled={loading}
              className="text-slate-300 hover:text-white font-medium inline-flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Collapsible Custom MongoDB URI Connector */}
        {showConnectionPanel && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Connect Live MongoDB Atlas Cluster or Local mongod</span>
              </h4>
              <button
                onClick={() => setShowConnectionPanel(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Enter your MongoDB connection string below. The backend uses Mongoose to connect securely without hardcoding credentials:
            </p>
            <form onSubmit={handleConnectCustomUri} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/nextstep?retryWrites=true&w=majority"
                value={customUriInput}
                onChange={e => setCustomUriInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                <span>Connect Cluster</span>
              </button>
            </form>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-2 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Info className="w-3.5 h-3.5" />
                <span>Auto-URL-Encodes: Special characters like <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">@</code> in passwords are automatically escaped to <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">%40</code>.</span>
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <span>Atlas Note: Set Network Access to <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300">0.0.0.0/0</code></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 dark:text-emerald-300 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 dark:text-rose-300 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('crud')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'crud'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MongoDB Records Explorer</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-black/20 text-white font-mono">
            {records.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'endpoints'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>REST API Endpoints</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schema'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mongoose Schema & Validation</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'viva'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Viva & Presentation Prep (Sujata)</span>
        </button>
      </div>

      {/* TAB 1: CRUD OPERATIONS EXPLORER */}
      {activeTab === 'crud' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Title, Company, Skill, or ObjectId..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={handleSeedData}
                disabled={actionLoading}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                title="Populate collection with standard sample internship records"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Seed Sample Data</span>
              </button>

              <button
                onClick={() => setShowCreateForm(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Document</span>
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Internship Collection Documents</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                    {filteredRecords.length} document{filteredRecords.length === 1 ? '' : 's'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each record contains a unique 24-character hexadecimal MongoDB ObjectId (_id)
                </p>
              </div>

              {dbStatus?.isLiveMongo ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" />
                  <span>Collection: internships (Live MongoDB)</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>NoSQL In-Memory Collection (Mongoose Mode)</span>
                </span>
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-sm">Fetching documents from MongoDB...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Database className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  No MongoDB documents found
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No records matched your search query "${searchQuery}".`
                    : 'The collection is currently empty. Click "Seed Sample Data" or "Create Document" to add records.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleSeedData}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                  >
                    Seed 4 Sample Records
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-6">MongoDB ObjectId (_id)</th>
                      <th className="py-3.5 px-6">Title & Company</th>
                      <th className="py-3.5 px-6">Location & Type</th>
                      <th className="py-3.5 px-6">Skills Array</th>
                      <th className="py-3.5 px-6">Stipend</th>
                      <th className="py-3.5 px-6 text-right">CRUD Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredRecords.map(item => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* ObjectId */}
                        <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono text-xs border border-slate-200 dark:border-slate-700">
                              {item._id.substring(0, 10)}...{item._id.substring(item._id.length - 4)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(item._id, item._id)}
                              className="text-slate-400 hover:text-emerald-500 transition-colors"
                              title="Copy full 24-char ObjectId"
                            >
                              {copiedId === item._id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Title & Company */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {item.company}
                          </div>
                        </td>

                        {/* Location & Type */}
                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <div>{item.location}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.workType === 'Remote'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : item.workType === 'Hybrid'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.workType || 'Hybrid'}
                          </span>
                        </td>

                        {/* Skills */}
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Array.isArray(item.skills) && item.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {Array.isArray(item.skills) && item.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400 self-center">
                                +{item.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stipend */}
                        <td className="py-4 px-6 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {item.stipend || '₹18,000 / mo'}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingRecord(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                              title="View Document Details (JSON/BSON)"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                              title="Update Document in MongoDB"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingRecord(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="Delete Document from MongoDB"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REST API ENDPOINTS */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-500" />
                <span>NextStep MongoDB REST API Architecture</span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All endpoints are built using Express.js routers and interact directly with the Mongoose Internship model.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* GET /api/internships */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    GET
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/internships
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Retrieves all saved internship documents sorted by creation date descending.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`InternshipModel.find().sort({ createdAt: -1 })`}
                </div>
              </div>

              {/* GET /api/internships/:id */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono">
                    GET
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/internships/:id
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fetches a single document by its 24-character hexadecimal ObjectId with format validation.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`InternshipModel.findById(id)`}
                </div>
              </div>

              {/* POST /api/internships */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                    POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/internships
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Validates incoming payload and saves a new Internship document into MongoDB collection.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`InternshipModel.create({ title, company, ... })`}
                </div>
              </div>

              {/* PUT /api/internships/:id */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-mono">
                    PUT
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/internships/:id
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modifies an existing record and executes schema validators on the updated fields.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`InternshipModel.findByIdAndUpdate(id, data, { new: true })`}
                </div>
              </div>

              {/* DELETE /api/internships/:id */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-mono">
                    DELETE
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/internships/:id
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Removes document permanently from MongoDB collection after user confirmation.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`InternshipModel.findByIdAndDelete(id)`}
                </div>
              </div>

              {/* GET /api/db/status */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-mono">
                    GET
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/db/status
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Returns readyState (0: disconnected, 1: connected, 2: connecting), driver version, and masked URI.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`mongoose.connection.readyState`}
                </div>
              </div>

              {/* GET /api/students */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-mono">
                    GET / POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/students
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fetches student profiles or creates new student documents using StudentModel (PICT Pune student profile).
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`StudentModel.find() / StudentModel.create({ userId, fullName, ... })`}
                </div>
              </div>

              {/* GET /api/companies */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-mono">
                    GET / POST
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/companies
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fetches employer company profiles or registers verified recruiting organizations using CompanyModel.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`CompanyModel.find() / CompanyModel.create({ companyName, ... })`}
                </div>
              </div>

              {/* GET /api/applications */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-mono">
                    CRUD
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    /api/applications
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manages end-to-end applicant tracking pipeline (applied, shortlisted, interview scheduled, offers) with ApplicationModel.
                </p>
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded text-xs font-mono overflow-x-auto">
                  {`ApplicationModel.find({ studentId }) / ApplicationModel.findByIdAndUpdate(id)`}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCHEMA & VALIDATION */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span>Mongoose Internship Schema Definition</span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Located in <code className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">server/models/Internship.ts</code>
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`const InternshipSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Skills must contain at least one skill tag',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    stipend: {
      type: String,
      default: '₹18,000 / month',
    },
    openings: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 opening'],
    },
    workType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Hybrid',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);`}
            </div>
          </div>

          {/* Student Mongoose Schema */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-500" />
                <span>Mongoose Student Schema Definition</span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Located in <code className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">server/models/Student.ts</code>
              </p>
            </div>
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`const StudentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    college: { type: String, required: true, default: 'PICT Pune' },
    degree: { type: String, default: 'Bachelor of Technology (B.Tech)' },
    branch: { type: String, default: 'Computer Science and Engineering' },
    graduationYear: { type: String, default: '2026' },
    cgpa: { type: String, default: '9.2 / 10.0' },
    skills: { type: [String], default: ['React', 'Node.js', 'Express', 'MongoDB'] },
    preferredRoles: { type: [String], default: ['Full-Stack Developer Intern'] },
    remotePreference: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Flexible'], default: 'Flexible' },
    resumeName: { type: String, default: 'Sujata_Software_Engineer_Resume.pdf' },
  },
  { timestamps: true }
);`}
            </div>
          </div>

          {/* Application Mongoose Schema */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                <span>Mongoose Application Pipeline Schema Definition</span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Located in <code className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">server/models/Application.ts</code>
              </p>
            </div>
            <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`const ApplicationSchema: Schema = new Schema(
  {
    internshipId: { type: String, required: true, index: true },
    internshipTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'offer_received', 'accepted', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    coverLetter: { type: String, default: '' },
    history: [{ status: String, timestamp: { type: Date, default: Date.now }, note: String }],
    interviewDetails: { date: String, time: String, timezone: String, meetingUrl: String, instructions: String },
    offerDetails: { stipend: String, duration: String, startDate: String, expiryDate: String },
  },
  { timestamps: true }
);`}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VIVA & PRESENTATION PREPARATION */}
      {activeTab === 'viva' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>College Project Defense & Viva Cheat Sheet</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                How Sujata Can Explain MongoDB in NextStep to Faculty
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Prepared specifically for your external viva presentation to answer any technical database questions with confidence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                  Why did we choose MongoDB (NoSQL) for NextStep?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "Respected faculty, career postings and candidate profiles have highly dynamic and nested attributes like variable skill tags, diverse stipend ranges, and rich descriptions. MongoDB’s schema flexibility and JSON/BSON document model naturally align with JavaScript and TypeScript objects, reducing object-relational impedance mismatch."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                  What is Mongoose and what does it do?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It enforces strong schema typing, built-in validation rules, custom validators, pre/post middleware hooks, and automatic timestamp tracking (createdAt, updatedAt) before documents are persisted to the database."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                  How does MongoDB generate the _id?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "Every MongoDB document automatically receives a unique 12-byte (24-character hexadecimal) ObjectId. It consists of a 4-byte Unix timestamp representing document creation time, a 5-byte random value unique to the machine and process, and a 3-byte incrementing counter."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                  How is database security ensured?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  "Credentials are never hardcoded in source code; they are loaded securely through process.env.MONGODB_URI. We also validate all ObjectIds using mongoose.Types.ObjectId.isValid() before querying to protect against injection and invalid cast exceptions."
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Create MongoDB Document
                </h3>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internship Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full-Stack Software Engineering Intern"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NextWave Technologies"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune, Maharashtra / Remote"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Type
                  </label>
                  <select
                    value={newWorkType}
                    onChange={e => setNewWorkType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    placeholder="₹18,000 / month"
                    value={newStipend}
                    onChange={e => setNewStipend(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOpenings}
                    onChange={e => setNewOpenings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (Comma separated) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="React, TypeScript, Node.js, MongoDB"
                  value={newSkills}
                  onChange={e => setNewSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed internship responsibilities, requirements, and scope..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Save to MongoDB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Update MongoDB Document
                  </h3>
                  <p className="font-mono text-xs text-slate-500">
                    ID: {editingRecord._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internship Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={e => setEditCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={e => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Type
                  </label>
                  <select
                    value={editWorkType}
                    onChange={e => setEditWorkType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    value={editStipend}
                    onChange={e => setEditStipend(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editOpenings}
                    onChange={e => setEditOpenings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={editSkills}
                  onChange={e => setEditSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW JSON / BSON DETAILS MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  MongoDB Document Structure (JSON/BSON)
                </h3>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
              <pre>{JSON.stringify(viewingRecord, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                Created: {viewingRecord.createdAt ? new Date(viewingRecord.createdAt).toLocaleString() : 'N/A'}
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(viewingRecord, null, 2), 'full_json')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                {copiedId === 'full_json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'full_json' ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 dark:border-rose-900/60 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm MongoDB Deletion
                </h3>
                <p className="text-xs text-slate-500">
                  This action permanently removes the document from MongoDB.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                {deletingRecord.title}
              </div>
              <div className="text-slate-500">{deletingRecord.company}</div>
              <div className="font-mono text-[11px] text-slate-400">
                _id: {deletingRecord._id}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
