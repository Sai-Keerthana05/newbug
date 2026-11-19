import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import api from '../utils/api';
import {
  User,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Mail,
  CheckCircle2,
  Unlink,
  Link2,
  Sparkles
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile, disconnectGmail, connectGmailDev, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Gmail OAuth states
  const [gmailLoading, setGmailLoading] = useState(false);
  const [devGmailInput, setDevGmailInput] = useState('');
  const [showDevInput, setShowDevInput] = useState(false);

  useEffect(() => {
    const gmailStatus = searchParams.get('gmail');
    const gmailError = searchParams.get('gmail_error');

    if (gmailStatus === 'connected') {
      setMessage('Your Gmail account has been successfully connected via Google OAuth 2.0!');
      refreshUser();
      searchParams.delete('gmail');
      setSearchParams(searchParams);
    } else if (gmailError) {
      setError(`Google OAuth Error: ${decodeURIComponent(gmailError)}`);
      searchParams.delete('gmail_error');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

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

  const handleConnectGmail = async () => {
    setGmailLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.get('/auth/google/url');
      if (response.data.configured && response.data.url) {
        // Redirect user to official Google OAuth consent screen
        window.location.href = response.data.url;
      } else {
        // Fallback: Show developer test connect option if Google Client ID not yet configured
        setShowDevInput(true);
        setMessage('Google OAuth keys are not yet configured in backend .env. You can connect in Development Mode below.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate Google OAuth.');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleDisconnectGmail = async () => {
    setGmailLoading(true);
    setError('');
    setMessage('');

    try {
      await disconnectGmail();
      setMessage('Gmail account disconnected successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect Gmail.');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleDevConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setGmailLoading(true);
    setError('');
    setMessage('');

    try {
      await connectGmailDev(devGmailInput || user?.email);
      setMessage(`Gmail account (${devGmailInput || user?.email}) connected successfully in Development Mode!`);
      setShowDevInput(false);
      setDevGmailInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect Gmail in dev mode.');
    } finally {
      setGmailLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans pb-10 max-w-5xl">
        {/* Header */}
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Profile & Integrations</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account settings, connected email providers (Gmail & SMTP), and subscription stats.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Stats Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center font-extrabold text-2xl text-slate-200 border-2 border-slate-700 mx-auto mb-4 shadow-md">
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
                <span className="text-slate-500 font-semibold">Gmail Provider:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    user?.gmailConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {user?.gmailConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Integrations & Profile Forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Email Integrations Card (Gmail OAuth) */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5 border border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-400" />
                  <h3 className="font-outfit text-base font-bold text-white">Email Providers & Integrations</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                  Google OAuth 2.0
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your Gmail account to send complete AI bug resolution reports directly from your authenticated email address.
                We request only the minimum required permission (<code className="text-orange-400 bg-slate-900 px-1 py-0.5 rounded">gmail.send</code>).
              </p>

              {/* Gmail Connection Status */}
              <div className="bg-[#101022] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    user?.gmailConnected ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-slate-800 text-slate-400'
                  }`}>
                    G
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Gmail (Google OAuth 2.0)</span>
                      {user?.gmailConnected && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                          Connected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {user?.gmailConnected ? (
                        <span>Authorized address: <strong className="text-slate-200">{user.gmailEmail}</strong></span>
                      ) : (
                        'No Google account connected'
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {user?.gmailConnected ? (
                    <button
                      onClick={handleDisconnectGmail}
                      disabled={gmailLoading}
                      className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      {gmailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5" />}
                      <span>Disconnect Gmail</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleConnectGmail}
                        disabled={gmailLoading}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        {gmailLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                        <span>Connect Gmail</span>
                      </button>

                      <button
                        onClick={() => setShowDevInput(!showDevInput)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 px-2.5 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60"
                        title="Development Mode Quick Connect"
                      >
                        Dev Test
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dev quick-connect form if Google Client ID not yet set */}
              {showDevInput && !user?.gmailConnected && (
                <form onSubmit={handleDevConnect} className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Development Mode Gmail Test Connector
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Enter the Gmail address you want to simulate sending reports from in this local environment:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={devGmailInput}
                      onChange={(e) => setDevGmailInput(e.target.value)}
                      placeholder={user?.email || 'developer@gmail.com'}
                      className="flex-1 bg-[#141424] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={gmailLoading}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white rounded-xl"
                    >
                      Connect
                    </button>
                  </div>
                </form>
              )}

              {/* Platform Mail (SMTP) Status */}
              <div className="bg-[#101022] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Platform Mail (SMTP Server)</span>
                    <span className="text-[10px] text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded-full font-semibold">
                      Always Active
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Fallback email provider managed by Bug Replier for all users.
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information Form */}
            <div className="glass-panel p-6 sm:p-7 rounded-2xl">
              <h3 className="font-outfit text-base font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" /> Account Details
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
                      className="w-full bg-[#050515]/60 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
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
                      className="w-full bg-[#050515]/60 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
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
                      className="w-full bg-[#050515]/60 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
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
                      className="w-full bg-[#050515]/60 border border-slate-800 focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    {loading && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
