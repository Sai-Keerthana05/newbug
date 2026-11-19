import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import {
  Code2,
  Terminal,
  Zap,
  Mail,
  Video,
  ChevronDown,
  ShieldCheck,
  Star,
  ArrowRight,
  Sparkles,
  Bug
} from 'lucide-react';

const Landing: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const features = [
    {
      icon: Terminal,
      title: 'Analyze Source Code',
      description: 'Supports over 19 programming languages including Python, TypeScript, Rust, and Go.'
    },
    {
      icon: Zap,
      title: 'Detect Bugs Instantly',
      description: 'Pinpoint structural problems, syntax issues, logical bugs, and performance bottlenecks.'
    },
    {
      icon: Code2,
      title: 'Generate Corrected Code',
      description: 'Get fully functional corrected code blocks, ready to copy and paste right into your editor.'
    },
    {
      icon: Sparkles,
      title: 'Beginner-Friendly Explanations',
      description: 'Learn why the bug happened and understand the underlying logic with clear explanations.'
    },
    {
      icon: Video,
      title: 'AI Video Explanations',
      description: 'Generates animated video walkthroughs of your bug and fix (Prime subscribers only).'
    },
    {
      icon: Mail,
      title: 'Email Reports on Demand',
      description: 'Send code audits and video links to your inbox or team members (Prime subscribers only).'
    }
  ];

  const faqs = [
    {
      question: 'Which programming languages are supported?',
      answer: 'We support 19+ languages, including JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, SQL, HTML, CSS, Bash, and PowerShell.'
    },
    {
      question: 'How does the daily analysis limit work?',
      answer: 'Free users can analyze up to 5 scripts per day. Prime users enjoy unlimited code reviews, advanced AI explanations, video generation, and email report capabilities.'
    },
    {
      question: 'How are the video explanations generated?',
      answer: 'When you request a video, our backend generates an explanatory slide sequence showing your code issues, uses FFmpeg to compile it, and links it in your dashboard for immediate viewing.'
    },
    {
      question: 'Can I cancel my Prime subscription anytime?',
      answer: 'Yes! You can manage your subscription directly from your profile dashboard and upgrade or change plans instantly.'
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-6 h-6 text-blue-500" />
            <span className="font-outfit font-extrabold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Bug Replier
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold hover:text-blue-400 transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-20 px-4">
        <ParticleBackground />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" /> Powered by Advanced AI
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-outfit text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent"
          >
            Fix Bugs Faster <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              with AI
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Analyze code, understand errors, generate fixes, and improve your coding productivity using AI.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-blue-500/15 flex items-center justify-center gap-2 group transition-all"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 font-bold px-8 py-4 rounded-xl flex items-center justify-center transition-all"
            >
              View Features
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#050515]/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to debug code
            </h2>
            <p className="text-slate-400">
              Stop wasting hours searching StackOverflow. Let Bug Replier explain and correct your code in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl glass-hover transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-md shadow-blue-500/10">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-slate-400">Fix your software issues in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="glass-panel p-8 rounded-2xl relative text-center">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Paste Your Code</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Select your language and paste the broken script inside our Monaco-powered IDE.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl relative text-center">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Analyze with AI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our AI instantly scans your code, generates explanations, and constructs corrected output.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl relative text-center">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-white mt-4 mb-2">Review & Export</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Copy the corrected code, watch generated video tutorials, or email audit reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-[#050515]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-slate-400">Choose the perfect plan to boost your engineering workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col hover:border-slate-700 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">Free Plan</h3>
              <p className="text-slate-400 text-sm mb-6">Perfect for students and casual coding checkups.</p>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white font-outfit">$0</span>
                <span className="text-slate-400 text-sm ml-2">/ forever</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  Maximum 5 analyses per day
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  Basic bug detection
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  Corrected code generation
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  History stored for 7 days
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
                  No video explanations
                </li>
                <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
                  No email reports
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-center font-bold py-3.5 rounded-xl transition-all"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Prime Plan */}
            <div className="glass-panel p-8 rounded-3xl border-purple-500/30 glow-border-purple flex flex-col hover:scale-[1.02] transition-all relative">
              <div className="absolute -top-4 right-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-blue-500/20">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Prime Plan</h3>
              <p className="text-slate-400 text-sm mb-6">For professional developers demanding full power.</p>
              <div className="flex items-baseline mb-8">
                <span className="text-4xl font-extrabold text-white font-outfit">$19</span>
                <span className="text-slate-400 text-sm ml-2">/ month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Unlimited analyses
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Advanced AI explanations
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Unlimited analysis history
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  AI video explanations enabled
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  On-demand email reports
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm">
                  <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  Priority processing
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-center font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/10 transition-all"
              >
                Get Prime Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">Loved by Developers</h2>
            <p className="text-slate-400">See how engineers are upgrading their daily workflow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
                "Bug Replier reduced my debugging session lengths by at least 50%. The beginner-friendly explanations are amazing, especially when working in unfamiliar languages like Rust."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
                  JS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">James Schmidt</h4>
                  <span className="text-xs text-slate-500">Frontend Engineer</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
                "The email report feature has been a game-changer for our team. We paste broken snippets, run reviews, and mail code audits with video explanations to our PR reviews."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
                  TL
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Tanya Liu</h4>
                  <span className="text-xs text-slate-500">Tech Lead</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic mb-6">
                "Programmatic video explanation is insane! I literally watch a 10-second slide walkthrough showing my bug and how to fix it while drinking coffee. Absolutely worth the Prime plan."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center font-bold text-xs">
                  MK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Marcus K.</h4>
                  <span className="text-xs text-slate-500">Fullstack Developer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-[#050515]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Have questions? We have answers.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="glass-panel rounded-2xl overflow-hidden transition-all">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-white hover:bg-white/5 transition-all"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-250 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-slate-400 text-sm leading-relaxed border-t border-white/5 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#03030c] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-blue-500" />
            <span className="font-outfit font-bold text-lg text-white">Bug Replier</span>
          </div>
          <p className="text-slate-500 text-xs">&copy; 2026 Bug Replier. All rights reserved. Empowering developers worldwide.</p>
          <div className="flex gap-4">
            <Link to="/register" className="text-xs text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <a href="#features" className="text-xs text-slate-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="mailto:support@bugreplier.com" className="text-xs text-slate-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
