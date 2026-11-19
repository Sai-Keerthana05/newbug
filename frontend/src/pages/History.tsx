import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import SidebarLayout from '../components/SidebarLayout';
import {
  Search,
  Trash2,
  ChevronRight,
  Code2,
  Download,
  Copy,
  Video,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AnalysisItem {
  _id: string;
  originalCode: string;
  correctedCode: string;
  language: string;
  errorSummary: string;
  rootCause: string;
  explanation: string;
  videoUrl?: string;
  createdAt: string;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const directId = searchParams.get('id');

  const [historyList, setHistoryList] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search/Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Selected item detail drawer/modal
  const [selectedItem, setSelectedItem] = useState<AnalysisItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/history');
      setHistoryList(response.data);

      // Handle deep-linking (if ?id=... is present in URL)
      if (directId) {
        const found = response.data.find((item: AnalysisItem) => item._id === directId);
        if (found) {
          setSelectedItem(found);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [directId]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent modal opening
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return;

    setDeletingId(id);
    try {
      await api.delete(`/history/${id}`);
      setHistoryList((prev) => prev.filter((item) => item._id !== id));
      if (selectedItem?._id === id) {
        setSelectedItem(null);
        // Clear query param
        setSearchParams({});
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete report.');
    } finally {
      setDeletingId('');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReport = (item: AnalysisItem) => {
    const reportText = `BUG REPLIER REPORT - ${item.language.toUpperCase()}
===========================
Date: ${new Date(item.createdAt).toLocaleDateString()}

ERROR SUMMARY:
${item.errorSummary}

ROOT CAUSE:
${item.rootCause}

CORRECTED CODE:
${item.correctedCode}

EXPLANATION:
${item.explanation}
`;
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bug-replier-${item.language}-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Extract unique languages present in history for the filter dropdown
  const uniqueLanguages = Array.from(new Set(historyList.map((item) => item.language)));

  // Filter & Search computation
  const filteredHistory = historyList.filter((item) => {
    const matchesSearch =
      item.errorSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.language.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage = selectedLanguage === '' || item.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans relative">
        {/* Header */}
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Analysis History</h1>
          <p className="text-slate-400 text-sm mt-1">
            {user?.subscription === 'Free' ? (
              <span className="text-blue-400 font-semibold">Free Tier: Storing reports for last 7 days. Upgrade to Prime for unlimited storage.</span>
            ) : (
              <span>Your Prime account has unlimited storage of all historical checks.</span>
            )}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-[#050515]/60 border border-slate-800/80 glass">
          <div className="w-full sm:max-w-md relative">
            <Search className="w-4.5 h-4.5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by error summary or language..."
              className="w-full bg-[#070719]/60 border border-slate-800/80 focus:border-blue-500/60 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none text-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <select
              className="w-full sm:w-44 bg-[#070719]/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500/50"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border-dashed border-slate-800/80 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-600 mb-5 border border-slate-800">
              <Code2 className="w-7 h-7" />
            </div>
            <h3 className="font-outfit text-lg font-bold text-slate-300">No reports found</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We couldn't find any reports fitting your filters. Create a new analysis or clear query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedItem(item);
                  setSearchParams({ id: item._id });
                }}
                className="p-5 rounded-2xl glass-panel glass-hover cursor-pointer flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold uppercase tracking-wider font-mono">
                      {item.language}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white line-clamp-2 leading-relaxed">
                    {item.errorSummary || 'Clean static validation'}
                  </h4>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/60">
                  <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>

                  <button
                    onClick={(e) => handleDelete(item._id, e)}
                    disabled={deletingId === item._id}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all"
                    title="Delete Audit Entry"
                  >
                    {deletingId === item._id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Slider / Modal Drawer */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-2xl h-screen bg-[#050515] border-l border-slate-800 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-slide-in relative">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setSearchParams({});
                }}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/60 border border-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6 flex-1 pb-10">
                {/* Drawer Title */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider font-mono">
                      {selectedItem.language}
                    </span>
                    <span className="text-xs text-slate-500">
                      Audit date: {new Date(selectedItem.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="font-outfit text-xl font-extrabold text-white pr-12 leading-relaxed">
                    Code Audit Log Details
                  </h2>
                </div>

                <hr className="border-slate-800/60" />

                {/* Audit Body */}
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1.5">Error Summary</span>
                    <p className="text-sm text-slate-300 font-semibold bg-red-500/5 border border-red-500/10 p-4 rounded-xl leading-relaxed">
                      {selectedItem.errorSummary}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1.5">Root Cause</span>
                    <p className="text-sm text-slate-400 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl leading-relaxed">
                      {selectedItem.rootCause}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Original Submitted Code</span>
                    <pre className="text-xs font-mono text-slate-300 bg-[#02020a] border border-slate-850 p-4 rounded-xl overflow-x-auto max-h-[160px] leading-relaxed">
                      {selectedItem.originalCode}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1.5">Corrected Fixed Code</span>
                    <pre className="text-xs font-mono text-slate-200 bg-[#02020a] border border-slate-850 p-4 rounded-xl overflow-x-auto max-h-[160px] leading-relaxed">
                      {selectedItem.correctedCode}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1.5">Beginner-Friendly Explanation</span>
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                      {selectedItem.explanation}
                    </p>
                  </div>

                  {selectedItem.videoUrl && (
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1.5">Video Explanation Link</span>
                      <a
                        href={selectedItem.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 transition-all"
                      >
                        <Video className="w-4 h-4" /> Watch Explanatory Video
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-slate-800/80 flex gap-4">
                <button
                  onClick={() => copyCode(selectedItem.correctedCode)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0b0b26] hover:bg-white/5 border border-slate-700/60 rounded-xl py-3 text-xs font-bold text-white transition-all"
                >
                  {copied ? <X className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Corrected Code'}
                </button>
                <button
                  onClick={() => downloadReport(selectedItem)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl py-3 text-xs font-bold text-white shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default History;
