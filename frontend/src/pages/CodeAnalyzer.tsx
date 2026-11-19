import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SidebarLayout from '../components/SidebarLayout';
import Editor from '@monaco-editor/react';
import {
  Code2,
  Play,
  Copy,
  Download,
  Mail,
  Video,
  Sun,
  Moon,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  Lock
} from 'lucide-react';

const LANGUAGE_TEMPLATES: Record<string, string> = {
  javascript: `// JavaScript bug demonstration
var userAge = "25";
if (userAge == 25) {
  var message = "Age matches!";
  console.log(message);
}`,
  typescript: `// TypeScript optimization suggestion
const numbers: number[] = [1, 2, 3];
const double = numbers.map(function(num) {
  return num * 2;
});`,
  python: `# Python file read without context manager
def load_data(filepath):
    file_handle = open(filepath, 'r')
    contents = file_handle.read()
    file_handle.close()
    return contents`,
  go: `// Go error check missing
package main
import (
	"fmt"
	"os"
)
func main() {
	f, _ := os.Open("data.txt")
	fmt.Println(f.Name())
}`,
  rust: `// Rust compile optimization
fn get_greeting(name: &str) -> String {
    let mut s = String::from("Hello, ");
    s.push_str(name);
    s
}`,
  java: `// Java memory / comparison issue
public class Main {
    public static void main(String[] args) {
        String str1 = new String("hello");
        String str2 = new String("hello");
        if (str1 == str2) {
            System.out.println("Equal!");
        }
    }
}`
};

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' }
];

const CodeAnalyzer: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.javascript);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  // Analysis Result States
  const [analysisId, setAnalysisId] = useState('');
  const [errorSummary, setErrorSummary] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [correctedCode, setCorrectedCode] = useState('');
  const [explanation, setExplanation] = useState('');

  // UI Flow States
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setLanguage(selected);
    setCode(LANGUAGE_TEMPLATES[selected] || `// Write your ${selected} code here\n`);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    setErrorMessage('');
    setAnalysisId('');
    setErrorSummary('');
    setRootCause('');
    setCorrectedCode('');
    setExplanation('');
    setVideoUrl('');

    try {
      const response = await api.post('/analyze', {
        originalCode: code,
        language
      });
      const data = response.data;
      setAnalysisId(data._id);
      setErrorSummary(data.errorSummary);
      setRootCause(data.rootCause);
      setCorrectedCode(data.correctedCode);
      setExplanation(data.explanation);

      // Refresh credits state
      await refreshUser();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || 'Code analysis failed. Please verify connection.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (!correctedCode) return;
    navigator.clipboard.writeText(correctedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReportFile = () => {
    const reportText = `BUG REPLIER ANALYSIS REPORT
==========================
Language: ${language.toUpperCase()}
Date: ${new Date().toLocaleDateString()}

ERROR SUMMARY:
--------------------------
${errorSummary}

ROOT CAUSE:
--------------------------
${rootCause}

CORRECTED CODE:
--------------------------
${correctedCode}

EXPLANATION:
--------------------------
${explanation}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bug-replier-${language}-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateVideo = async () => {
    if (!analysisId) return;
    if (user?.subscription !== 'Prime') return;

    setVideoGenerating(true);
    try {
      const response = await api.post('/video/generate', { analysisId });
      setVideoUrl(response.data.videoUrl);
    } catch (err: any) {
      console.error(err);
      alert('Failed to generate video explanation.');
    } finally {
      setVideoGenerating(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisId || !emailInput) return;
    if (user?.subscription !== 'Prime') return;

    setEmailSending(true);
    setEmailSuccess('');
    try {
      await api.post('/email/send', {
        analysisId,
        toEmail: emailInput
      });
      setEmailSuccess('Report successfully emailed!');
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailSuccess('');
      }, 2000);
    } catch (err: any) {
      console.error(err);
      alert('Failed to send email report.');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-fade-in font-sans pb-10">
        {/* Header */}
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Code Analyzer</h1>
          <p className="text-slate-400 text-sm mt-1">
            Write or paste your code snippet, choose the language, and trigger an automated AI audit.
          </p>
        </div>

        {/* Editor Settings Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#050515]/60 border border-slate-800/80 glass">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-[#0b0b26] border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500/50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
              className="p-2.5 rounded-xl border border-slate-700/60 hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              title="Toggle Editor Theme"
            >
              {theme === 'vs-dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !code.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4.5 h-4.5 fill-current" />
                Analyze Code
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Analysis Error</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Workspace Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Monaco Code Editor */}
          <div className="lg:col-span-6 space-y-4">
            <div className="glass-panel rounded-2xl overflow-hidden border-slate-800/80">
              <div className="px-5 py-3 border-b border-slate-800/80 bg-[#050515]/80 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Source Code</span>
                <span className="text-xs font-mono text-slate-600 uppercase">{language}</span>
              </div>
              <div className="h-[400px]">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  theme={theme}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    fontSize: 14,
                    lineNumbers: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Side: AI Audit Outputs */}
          <div className="lg:col-span-6 space-y-6">
            {!errorSummary && !analyzing && (
              <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-slate-800/80 min-h-[448px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-slate-800/40 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
                  <Code2 className="w-7 h-7" />
                </div>
                <h3 className="font-outfit text-lg font-bold text-slate-300">Ready to audit</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
                  Enter your source code on the left editor and hit "Analyze Code" to generate correction reports.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="glass-panel p-8 rounded-2xl space-y-6 min-h-[448px] animate-pulse">
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                  <div className="h-10 bg-slate-800/60 rounded" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-20 bg-slate-800/60 rounded" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                  <div className="h-24 bg-slate-800/60 rounded" />
                </div>
              </div>
            )}

            {errorSummary && !analyzing && (
              <div className="space-y-6">
                {/* Result Sections */}
                <div className="glass-panel rounded-2xl border-slate-800/80 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-800/80 bg-[#050515]/80 flex justify-between items-center">
                    <h3 className="font-outfit text-sm font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                      AI Audit Report
                    </h3>
                    {/* Action Panel */}
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
                        title="Copy Corrected Code"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={downloadReportFile}
                        className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all"
                        title="Download Text Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Error Summary */}
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1.5">Error Summary</span>
                      <p className="text-sm text-slate-300 font-semibold bg-red-500/5 border border-red-500/10 p-3 rounded-xl leading-relaxed">
                        {errorSummary}
                      </p>
                    </div>

                    {/* Root Cause */}
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1.5">Root Cause</span>
                      <p className="text-sm text-slate-400 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl leading-relaxed">
                        {rootCause}
                      </p>
                    </div>

                    {/* Corrected Code */}
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1.5">Corrected Code</span>
                      <pre className="text-xs font-mono text-slate-200 bg-[#02020a] border border-slate-800 p-4 rounded-xl overflow-x-auto max-h-[200px] leading-relaxed">
                        {correctedCode}
                      </pre>
                    </div>

                    {/* Beginner Explanation */}
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1.5">Detailed Explanation</span>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                        {explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prime Subscriptions Locks / Interactive Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Video Generator Action */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between items-start">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Video className="w-4.5 h-4.5 text-purple-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Video Explanation</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Generate a 10-second slide audit explaining the logic programmatically.
                      </p>
                    </div>

                    {user?.subscription !== 'Prime' ? (
                      <Link
                        to="/pricing"
                        className="w-full flex items-center justify-center gap-2 bg-slate-800/40 border border-slate-700/60 hover:bg-slate-700 text-[11px] font-bold text-slate-400 hover:text-white py-2.5 rounded-xl transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" /> Prime Only
                      </Link>
                    ) : videoUrl ? (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-center bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white py-2.5 rounded-xl transition-all"
                      >
                        Watch Generated Video
                      </a>
                    ) : (
                      <button
                        onClick={handleGenerateVideo}
                        disabled={videoGenerating}
                        className="w-full bg-[#0b0b26] hover:bg-white/5 border border-slate-700/60 text-[11px] font-bold text-slate-300 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        {videoGenerating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Working...
                          </>
                        ) : (
                          'Generate Video'
                        )}
                      </button>
                    )}
                  </div>

                  {/* Email Auditor Action */}
                  <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between items-start">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Mail className="w-4.5 h-4.5 text-blue-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Report</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Send the full code audit log directly to your or your client's email inbox.
                      </p>
                    </div>

                    {user?.subscription !== 'Prime' ? (
                      <Link
                        to="/pricing"
                        className="w-full flex items-center justify-center gap-2 bg-slate-800/40 border border-slate-700/60 hover:bg-slate-700 text-[11px] font-bold text-slate-400 hover:text-white py-2.5 rounded-xl transition-all"
                      >
                        <Lock className="w-3.5 h-3.5" /> Prime Only
                      </Link>
                    ) : (
                      <button
                        onClick={() => setEmailModalOpen(true)}
                        className="w-full bg-[#0b0b26] hover:bg-white/5 border border-slate-700/60 text-[11px] font-bold text-slate-300 py-2.5 rounded-xl transition-all"
                      >
                        Send to Email
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border-slate-700/60 w-full max-w-sm animate-fade-in relative">
            <h3 className="font-outfit text-base font-bold text-white mb-1.5 flex items-center gap-2">
              <Mail className="w-4.5 h-4.5 text-blue-400" /> Email Report
            </h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-normal">
              Enter target email to deliver the generated audit report and fixed code blocks.
            </p>

            {emailSuccess ? (
              <div className="py-4 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                {emailSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="user@domain.com"
                  className="w-full bg-[#050515]/60 border border-slate-800 focus:border-blue-500/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 text-xs font-semibold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-2.5 text-xs font-bold shadow-md"
                  >
                    {emailSending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default CodeAnalyzer;
