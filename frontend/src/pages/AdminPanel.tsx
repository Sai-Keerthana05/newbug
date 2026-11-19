import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SidebarLayout from '../components/SidebarLayout';
import {
  Users,
  Code2,
  TrendingUp,
  CreditCard,
  Trash2,
  ArrowUpCircle,
  Loader2,
  AlertTriangle,
  Search
} from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  subscription: 'Free' | 'Prime';
  analysesUsed: number;
  role: 'User' | 'Admin';
  createdAt: string;
}

interface AnalyticsData {
  totalUsers: number;
  totalAnalyses: number;
  freeUsers: number;
  primeUsers: number;
  languageStats: { _id: string; count: number }[];
  averageAnalysesPerUser: string | number;
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Individual button action loaders
  const [upgradingId, setUpgradingId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/analytics')
      ]);

      setUsersList(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Access Denied: Administrative privileges required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAdminData();
    } else {
      setLoading(false);
      setError('Administrative role required to view this panel.');
    }
  }, [user]);

  const handleUpgradeUser = async (userId: string) => {
    if (!window.confirm('Upgrade this user to Prime subscription plan?')) return;
    setUpgradingId(userId);
    try {
      await api.put(`/admin/user/${userId}/upgrade`);
      // Update local state
      setUsersList((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, subscription: 'Prime' } : u))
      );
      // Re-fetch stats
      const analyticsRes = await api.get('/admin/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to upgrade user subscription.');
    } finally {
      setUpgradingId('');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('DANGER: Delete this user and all of their analysis history? This action is irreversible.')) return;
    setDeletingId(userId);
    try {
      await api.delete(`/admin/user/${userId}`);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      // Re-fetch stats
      const analyticsRes = await api.get('/admin/analytics');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    } finally {
      setDeletingId('');
    }
  };

  // Filter users list based on search bar query
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.subscription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.role !== 'Admin') {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 font-sans">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="font-outfit text-2xl font-extrabold text-white">403 - Forbidden</h1>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            You do not have the required permissions to access this administrative route.
          </p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans pb-10">
        {/* Header */}
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Admin Control Panel</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of global SaaS operations, database statistics, and user account management.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Registrants</span>
                    <p className="font-outfit text-3xl font-extrabold text-white">{analytics.totalUsers}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total AI Audits</span>
                    <p className="font-outfit text-3xl font-extrabold text-white">{analytics.totalAnalyses}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prime Users</span>
                    <p className="font-outfit text-3xl font-extrabold text-white">{analytics.primeUsers}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audits Per User</span>
                    <p className="font-outfit text-3xl font-extrabold text-white">{analytics.averageAnalysesPerUser}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}

            {/* Users Management List */}
            <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
              <div className="p-6 border-b border-slate-800/80 bg-[#050515]/60 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-outfit text-base font-bold text-white">Manage Users</h3>
                  <p className="text-[11px] text-slate-500">Edit plan subscriptions or delete registrants</p>
                </div>

                {/* Local search bar */}
                <div className="w-full sm:max-w-xs relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    className="w-full bg-[#070719]/60 border border-slate-800/85 focus:border-blue-500/50 rounded-xl pl-9 pr-4 py-2 text-xs outline-none text-slate-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-[#070719]/30 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Status / Role</th>
                      <th className="px-6 py-4">Daily Audits</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((item) => (
                      <tr key={item._id} className="hover:bg-white/5 transition-colors text-slate-300">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5 items-center">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                item.subscription === 'Prime'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                              }`}
                            >
                              {item.subscription}
                            </span>
                            {item.role === 'Admin' && (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-400">
                          {item.subscription === 'Prime' ? 'Unlimited' : `${item.analysesUsed} / 5`}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-semibold">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {item.subscription === 'Free' && (
                            <button
                              onClick={() => handleUpgradeUser(item._id)}
                              disabled={upgradingId === item._id}
                              className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/35 hover:bg-amber-500 hover:text-black hover:border-transparent text-[10px] font-bold text-amber-400 px-3 py-1.5 rounded-lg transition-all"
                              title="Upgrade to Prime"
                            >
                              {upgradingId === item._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <ArrowUpCircle className="w-3 h-3" />
                                  Upgrade
                                </>
                              )}
                            </button>
                          )}

                          {item.role !== 'Admin' && (
                            <button
                              onClick={() => handleDeleteUser(item._id)}
                              disabled={deletingId === item._id}
                              className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white hover:border-transparent text-[10px] font-bold text-red-400 px-3 py-1.5 rounded-lg transition-all"
                              title="Delete User"
                            >
                              {deletingId === item._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AdminPanel;
