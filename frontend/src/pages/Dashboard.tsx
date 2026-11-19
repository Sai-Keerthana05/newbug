import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SidebarLayout from '../components/SidebarLayout';
import {
  Code2,
  TrendingUp,
  CreditCard,
  History,
  ArrowRight,
  Plus,
  Loader2,
  Bug,
  AlertCircle
} from 'lucide-react';

interface AnalysisItem {
  _id: string;
  language: string;
  errorSummary: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      // Refetches user stats in AuthContext to make sure credits are synchronized
      await refreshUser();

      // Fetch history for list
      const response = await api.get('/history');
      setRecentAnalyses(response.data.slice(0, 4)); // Get top 4 recent analyses
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getRemainingCredits = () => {
    if (!user) return 0;
    if (user.subscription === 'Prime') return 'Unlimited';
    return Math.max(0, 5 - user.analysesUsed);
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-outfit text-3xl font-extrabold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back, {user?.name}. Check your analysis metrics and credits.
            </p>
          </div>
          <button
            onClick={() => navigate('/analyze')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Analyze Code
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Analyses */}
          <div className="glass-panel p-6 rounded-2xl hover:border-slate-800 transition-all flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Analyses</span>
              <p className="font-outfit text-4xl font-extrabold text-white">
                {user?.totalAnalyses ?? 0}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Lifetime checks</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Code2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Remaining Daily Credits */}
          <div className="glass-panel p-6 rounded-2xl hover:border-slate-800 transition-all flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily Credits Left</span>
              <p className="font-outfit text-4xl font-extrabold text-white">
                {getRemainingCredits()}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                {user?.subscription === 'Prime' ? (
                  <span className="text-purple-400 font-bold uppercase tracking-wider">Prime Active</span>
                ) : (
                  <span>Out of 5 daily analyses</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Bug className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Subscription Plan */}
          <div className="glass-panel p-6 rounded-2xl hover:border-slate-800 transition-all flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Status</span>
              <p className="font-outfit text-4xl font-extrabold text-white flex items-center gap-2">
                <span
                  className={
                    user?.subscription === 'Prime'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent'
                      : 'text-slate-300'
                  }
                >
                  {user?.subscription}
                </span>
              </p>
              <div>
                {user?.subscription === 'Free' ? (
                  <Link to="/pricing" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-1">
                    Upgrade to Prime <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-[11px] text-amber-400/80 font-semibold">Priority access unlocked</span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section: Recent Analyses */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col min-h-[350px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-outfit text-lg font-bold text-white">Recent Analyses</h3>
                <p className="text-xs text-slate-500">Your latest code submissions and diagnostics</p>
              </div>
              <Link to="/history" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                View History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/80 rounded-2xl bg-[#050515]/20">
                <div className="w-12 h-12 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-600 mb-4">
                  <Code2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-300 mb-1">No analyses yet</h4>
                <p className="text-xs text-slate-500 max-w-[280px] mb-4 leading-relaxed">
                  Run your first AI check in seconds to examine source code for issues.
                </p>
                <button
                  onClick={() => navigate('/analyze')}
                  className="bg-white/5 hover:bg-white/10 text-xs font-semibold px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl transition-all"
                >
                  Analyze First Script
                </button>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {recentAnalyses.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/history?id=${item._id}`)}
                    className="p-4 rounded-xl border border-slate-800/60 hover:border-slate-700/80 bg-[#070719]/40 hover:bg-white/5 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider font-mono">
                          {item.language}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-semibold truncate">
                        {item.errorSummary || 'No errors detected'}
                      </p>
                    </div>
                    <div className="pl-4">
                      <ArrowRight className="w-4.5 h-4.5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Subscription & Credits Info */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-outfit text-lg font-bold text-white mb-2">Subscription & Credits</h3>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Free plan members get 5 basic analyses per day. Prime members get unlimited reviews, code fixing, video summaries, and email integration.
              </p>

              {user?.subscription === 'Free' ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-300 font-bold">Daily Usage Tracker</span>
                    <span className="text-xs text-slate-400 font-semibold">{user.analysesUsed} / 5 used</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ width: `${(user.analysesUsed / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <History className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Unlimited Analyses</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Your Prime plan has no daily usage limits.</p>
                  </div>
                </div>
              )}
            </div>

            {user?.subscription === 'Free' ? (
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
              >
                Upgrade to Prime
              </button>
            ) : (
              <div className="text-center p-3 border border-dashed border-amber-500/20 rounded-xl bg-amber-500/5">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Prime Benefits Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
