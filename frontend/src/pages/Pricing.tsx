import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import api from '../utils/api';
import { ShieldCheck, Loader2, Star, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

const Pricing: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpgradeRazorpay = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Create Razorpay order on backend
      const orderRes = await api.post('/subscription/create-order');
      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. In browser with live Razorpay SDK or test verification
      const razorpayOptions = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Bug Replier',
        description: 'Monthly Premium Subscription (Unlimited AI Debugging)',
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#F28C45'
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await api.post('/subscription/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            setSuccessMsg(verifyRes.data.message || 'Payment verified! You are now a Premium subscriber.');
            await refreshUser();
          } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Payment signature verification failed.');
          }
        }
      };

      // Check if Razorpay script is loaded on window
      if (typeof (window as any).Razorpay !== 'undefined') {
        const rzp = new (window as any).Razorpay(razorpayOptions);
        rzp.open();
      } else {
        // Direct test mode verification fallback
        const verifyRes = await api.post('/subscription/verify-payment', {
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_verified_signature'
        });
        setSuccessMsg(verifyRes.data.message || 'Test payment verified! You are now a Premium subscriber.');
        await refreshUser();
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to initiate Razorpay checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your Premium subscription? You will be reverted to the Free plan (5 analyses/day).')) {
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/subscription/cancel');
      setSuccessMsg(res.data.message || 'Subscription cancelled successfully.');
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans pb-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="font-outfit text-3xl font-extrabold text-white">Subscription & Pricing</h1>
          <p className="text-slate-400 text-sm">
            Choose the ideal plan for your development workflow. Transparent pricing with Indian Rupee (INR) billing.
          </p>
        </div>

        {successMsg && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center text-sm font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center text-sm font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4">
          {/* Free Plan */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border border-slate-800 hover:border-slate-700 transition-all shadow-xl">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">Free Plan</h3>
                {user?.subscription === 'Free' && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mb-6">Essential AI debugging for individual developers and students.</p>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white font-outfit">₹0</span>
                <span className="text-slate-400 text-sm ml-2">/ forever</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>5 successful AI analyses per calendar day</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>All 8 supported programming languages</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>Deep AI error explanations & root cause diagnosis</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>Complete corrected code suggestions</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>Side-by-side Monaco Diff code comparison</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>Email sharing via Platform SMTP & Gmail</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-400 flex-shrink-0" />
                  <span>Full bug analysis history</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                disabled
                className="w-full bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-semibold py-3.5 rounded-xl text-center"
              >
                {user?.subscription === 'Free' ? 'Active Plan' : 'Free Tier'}
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="glass-panel p-8 rounded-3xl border border-orange-500/40 glow-border-purple flex flex-col justify-between hover:scale-[1.01] transition-all relative shadow-2xl">
            <div className="absolute -top-3.5 right-8 bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md shadow-orange-500/20">
              Recommended
            </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
                  Premium Plan
                  <Star className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                </h3>
                {user?.subscription === 'Prime' && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                    Current Plan
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mb-6">For engineers, teams, and active builders needing unlimited power.</p>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white font-outfit">₹199</span>
                <span className="text-slate-400 text-sm ml-2">/ month</span>
              </div>
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span className="font-bold text-white">Unlimited AI analyses (no daily 5-run limit)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span>All 8 supported programming languages</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span>Priority AI analysis & faster responses</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span>Complete corrected code with auto-imports</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span>Full bug history archive with unlimited retention</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span>On-demand email reports (Gmail & SMTP)</span>
                </li>
                <li className="flex items-center gap-3 text-slate-200 text-xs">
                  <ShieldCheck className="w-4.5 h-4.5 text-orange-400 flex-shrink-0" />
                  <span>Verified cryptographic Razorpay payment security</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              {user?.subscription === 'Free' ? (
                <button
                  onClick={handleUpgradeRazorpay}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade to Premium (₹199/mo)'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/25 rounded-xl py-2.5 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> Active Premium Subscription
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="w-full text-slate-500 hover:text-red-400 text-[11px] font-semibold py-1.5 transition-all text-center"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Pricing;
