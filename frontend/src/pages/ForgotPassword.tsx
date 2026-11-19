import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Bug, ArrowLeft, Loader2, MailCheck } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');

    if (!email) {
      setError('Please provide an email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03030c] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bug className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-sans">Get back access to your account</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border-white/5">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {message ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-400">
                <MailCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Request Submitted</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {message}
              </p>
              {resetLink && (
                <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-left">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1.5">Dev Test Link:</p>
                  <a
                    href={resetLink}
                    className="text-xs text-slate-300 hover:text-white underline break-all font-mono"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full bg-[#070719]/60 border border-slate-800/80 focus:border-blue-500/60 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
