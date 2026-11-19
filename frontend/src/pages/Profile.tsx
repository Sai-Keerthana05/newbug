import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import { User, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(name, email, password || undefined);
      setMessage('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans pb-10 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Profile Settings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Update your account details, password, and view subscription stats.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left Side: Stats Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center font-extrabold text-2xl text-slate-200 border-2 border-slate-700 mx-auto mb-4">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-outfit text-lg font-bold text-white truncate">{user?.name}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            <hr className="border-slate-800/80" />

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Account Tier:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    user?.subscription === 'Prime'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-700/30 text-slate-400 border border-slate-700/50'
                  }`}
                >
                  {user?.subscription}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Daily Usage:</span>
                <span className="text-slate-300 font-mono">
                  {user?.subscription === 'Prime' ? 'Unlimited' : `${user?.analysesUsed || 0} / 5 used`}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Total Audits:</span>
                <span className="text-slate-300 font-mono font-bold">{user?.totalAnalyses || 0}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Created On:</span>
                <span className="text-slate-400">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Update Profile Forms */}
          <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl">
            <h3 className="font-outfit text-base font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Account Information
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#050515]/60 border border-slate-800 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-[#050515]/60 border border-slate-800 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <hr className="border-slate-800/80 my-2" />

              <div>
                <h3 className="font-outfit text-base font-bold text-white mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" /> Change Password
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">Leave fields blank to keep current password.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    className="w-full bg-[#050515]/60 border border-slate-800 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    className="w-full bg-[#050515]/60 border border-slate-800 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
