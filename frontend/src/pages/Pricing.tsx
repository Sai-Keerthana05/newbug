import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import { ShieldCheck, Loader2, Star, Check } from 'lucide-react';

const Pricing: React.FC = () => {
  const { user, upgradeSubscription } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeSubscription();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Subscription upgrade failed. Try again.');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans pb-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="font-outfit text-3xl font-extrabold text-white">Subscription Plans</h1>
          <p className="text-slate-400 text-sm">
            Choose the perfect plan to streamline your bug detection and code audit workflow.
          </p>
        </div>

        {success && (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-sm font-semibold">
            🎉 Upgrade successful! You are now a Prime Subscriber.
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-6">
          {/* Free Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between hover:border-slate-800 transition-all">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">Free Plan</h3>
                {user?.subscription === 'Free' && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs mb-6">Perfect for students and casual coding checkups.</p>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white font-outfit">$0</span>
                <span className="text-slate-400 text-sm ml-2">/ forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  Maximum 5 analyses per day
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  Basic bug detection
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  Corrected code generation
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  History stored for 7 days
                </li>
                <li className="flex items-center gap-3 text-slate-650 text-xs line-through">
                  No video explanations
                </li>
                <li className="flex items-center gap-3 text-slate-650 text-xs line-through">
                  No email reports
                </li>
              </ul>
            </div>
            <button
              disabled
              className="w-full bg-slate-800/40 border border-slate-700/60 text-slate-500 text-xs font-semibold py-3.5 rounded-xl text-center"
            >
              {user?.subscription === 'Free' ? 'Active Plan' : 'Free Plan'}
            </button>
          </div>

          {/* Prime Plan */}
          <div className="glass-panel p-8 rounded-3xl border-purple-500/30 glow-border-purple flex flex-col justify-between hover:scale-[1.01] transition-all relative">
            <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md shadow-blue-500/20">
              Most Popular
            </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                  Prime Plan
                  <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                </h3>
                {user?.subscription === 'Prime' && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mb-6">For professional developers demanding full power.</p>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white font-outfit">$19</span>
                <span className="text-slate-400 text-sm ml-2">/ month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Unlimited analyses
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Advanced AI explanations
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Unlimited analysis history
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  AI video explanations enabled
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  On-demand email reports
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-xs">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Priority processing
                </li>
              </ul>
            </div>

            {user?.subscription === 'Free' ? (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade to Prime'}
              </button>
            ) : (
              <div className="w-full bg-purple-500/10 border border-purple-500/25 rounded-xl py-3.5 text-center text-xs font-bold text-purple-400 flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Active Prime subscription
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Pricing;
