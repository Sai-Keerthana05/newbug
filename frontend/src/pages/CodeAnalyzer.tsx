import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SidebarLayout from '../components/SidebarLayout';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  Code2,
  Play,
  Copy,
  Download,
  Mail,
  Sun,
  Moon,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  GitCompare,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  FileCode,
  CheckCircle2,
  XCircle,
  X,
  Link2
} from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python', monaco: 'python', ext: 'py' },
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript', ext: 'js' },
  { value: 'java', label: 'Java', monaco: 'java', ext: 'java' },
  { value: 'cpp', label: 'C++', monaco: 'cpp', ext: 'cpp' },
  { value: 'c', label: 'C', monaco: 'c', ext: 'c' },
  { value: 'csharp', label: 'C#', monaco: 'csharp', ext: 'cs' },
  { value: 'php', label: 'PHP', monaco: 'php', ext: 'php' },
  { value: 'sql', label: 'SQL', monaco: 'sql', ext: 'sql' }
];

const LANGUAGE_TEMPLATES: Record<string, string> = {
  python: `# Python Bug Demo: Bare except, missing imports & division error
def calculate_ratio(items, total):
    try:
        ratio = len(items) / total
        return round(ratio, 4)
    except:
        return "Failed"

print(calculate_ratio([10, 20, 30], 0))`,

  javascript: `// JavaScript Bug Demo: Loose equality, var scoping & unhandled promise
function fetchUser(userId) {
    var queryId = "101";
    if (userId == 101) {
        return Promise.resolve({ id: userId, role: "admin" });
    }
    return Promise.reject(new Error("User not found"));
}

fetchUser("101").then(u => console.log("Logged in:", u.role));`,

  java: `// Java Bug Demo: Object reference comparison instead of .equals()
public class UserVerification {
    public static void main(String[] args) {
        String inputToken = new String("auth_secret_key");
        String actualToken = new String("auth_secret_key");

        // Bug: '==' compares object memory addresses, not string value content
        if (inputToken == actualToken) {
            System.out.println("Access Authorized");
        } else {
            System.out.println("Access Denied");
        }
    }
}`,

  cpp: `// C++ Bug Demo: Missing <vector> header and out-of-bounds indexing
#include <iostream>

int main() {
    std::vector<int> grades = {88, 92, 79};
    // Bug: Accessing out-of-bounds index 5 without boundary check
    std::cout << "Grade: " << grades[5] << std::endl;
    return 0;
}`,

  c: `// C Bug Demo: Missing standard I/O header and format specifier mismatch
int main() {
    int userAge = 25;
    // Bug: %s string specifier used for integer variable, missing stdio.h
    printf("User age is: %s\\n", userAge);
    return 0;
}`,

  csharp: `// C# Bug Demo: NullReferenceException on uninitialized string
using System;

class Program {
    static void Main(string[] args) {
        string userRole = null;
        // Bug: Calling instance method on null reference
        Console.WriteLine(userRole.ToUpper());
    }
}`,

  php: `<?php
// PHP Bug Demo: Loose comparison vulnerability and missing variable check
function checkAccess($role) {
    if ($role == 0) {
        return "Admin Area Authorized";
    }
    return "Standard User Area";
}

echo checkAccess("guest_token");`,

  sql: `-- SQL Bug Demo: Incorrect clause order (WHERE after GROUP BY)
SELECT department_id, COUNT(*) AS employee_count
FROM employees
GROUP BY department_id
WHERE salary > 60000;`
};

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface AnalysisData {
  _id: string;
  bugTitle: string;
  errorType: string;
  errorExplanation: string;
  rootCause: string;
  problematicCode: string;
  correctedCode: string;
  correctionExplanation: string;
  changesMade: string[];
  verificationStatus: string;
  testCases: TestCase[];
  preventionTips: string[];
  originalCode: string;
  language: string;
}

const CodeAnalyzer: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Inputs
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
  const [bugDescription, setBugDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  // Analysis result state
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [isDiffMode, setIsDiffMode] = useState(false);

  // Flow states
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailProvider, setEmailProvider] = useState<'gmail' | 'smtp'>('gmail');
  const [recipientEmail, setRecipientEmail] = useState(user?.email || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const currentLangConfig = SUPPORTED_LANGUAGES.find((l) => l.value === language) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setLanguage(selected);
    setCode(LANGUAGE_TEMPLATES[selected] || `// Write your ${selected} code here\n`);
    setResult(null);
    setIsDiffMode(false);
  };

  const handleClearCode = () => {
    setCode('');
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setAnalysisError('Please provide source code to analyze.');
      return;
    }

    setAnalyzing(true);
    setAnalysisError('');
    setIsDiffMode(false);

    try {
      const response = await api.post('/analyze', {
        originalCode: code,
        language,
        bugDescription,
        errorMessage
      });

      const data = response.data;
      setResult({
        _id: data._id,
        bugTitle: data.bugTitle || `${language.toUpperCase()} Bug Resolution`,
        errorType: data.errorType || 'Bug / Syntax Issue',
        errorExplanation: data.errorExplanation || data.errorSummary || 'Issue detected in submitted code.',
        rootCause: data.rootCause || 'Root cause analyzed.',
        problematicCode: data.problematicCode || '',
        correctedCode: data.correctedCode || code,
        correctionExplanation: data.correctionExplanation || data.explanation || '',
        changesMade: Array.isArray(data.changesMade) && data.changesMade.length > 0 ? data.changesMade : ['Applied code syntax, boundary, and error handling corrections.'],
        verificationStatus: data.verificationStatus || 'AI-Generated (Static Structure Checked)',
        testCases: Array.isArray(data.testCases) ? data.testCases : [],
        preventionTips: Array.isArray(data.preventionTips) && data.preventionTips.length > 0 ? data.preventionTips : ['Follow language style guidelines and compile with strict warnings.'],
        originalCode: data.originalCode || code,
        language: data.language || language
      });

      // Refresh daily usage / user quota
      await refreshUser();
    } catch (err: any) {
      console.error('Error analyzing bug:', err);
      setAnalysisError(
        err.response?.data?.message || 'Failed to analyze code. Please verify your connection or limit.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyCode = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    if (!result) return;
    const blob = new Blob([result.correctedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `corrected_${language}_code.${currentLangConfig.ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openEmailModal = (provider: 'gmail' | 'smtp') => {
    setEmailProvider(provider);
    setEmailStatus(null);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result?._id || !recipientEmail) return;

    setSendingEmail(true);
    setEmailStatus(null);

    try {
      const endpoint = emailProvider === 'gmail' ? '/email/send-gmail' : '/email/send';
      const response = await api.post(endpoint, {
        analysisId: result._id,
        toEmail: recipientEmail
      });

      setEmailStatus({ success: true, msg: response.data.message || 'Report sent successfully!' });
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailStatus(null);
      }, 2400);
    } catch (err: any) {
      setEmailStatus({
        success: false,
        msg: err.response?.data?.message || 'Failed to send email. Please check configuration.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header & Quota Bar */}
        <div className="bg-[#12121e]/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                AI Multi-Language Code Repair Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Submit code and optional error logs to receive deep root-cause diagnosis and complete, working corrected code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">
                Plan:{' '}
                <span className={`font-bold ${user?.subscription === 'Prime' ? 'text-amber-400' : 'text-blue-400'}`}>
                  {user?.subscription || 'Free'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {user?.subscription === 'Prime' ? (
                  'Unlimited Analyses'
                ) : (
                  `Usage: ${user?.analysesUsed || 0} / 5 today`
                )}
              </div>
            </div>

            <button
              onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition-all"
              title="Toggle Monaco Theme"
            >
              {editorTheme === 'vs-dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Editor Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Language Selector, Code Editor, Bug Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0e0e1a]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">

              {/* Controls bar above editor */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-orange-400" />
                  <label htmlFor="languageSelect" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Language:
                  </label>
                  <select
                    id="languageSelect"
                    value={language}
                    onChange={handleLanguageChange}
                    className="bg-[#181829] border border-slate-700 text-xs font-semibold text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-orange-500 transition-all cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCode(code)}
                    className="text-[11px] font-medium text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition-all flex items-center gap-1.5"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={handleClearCode}
                    className="text-[11px] font-medium text-slate-400 hover:text-red-400 px-2.5 py-1 rounded bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 transition-all flex items-center gap-1.5"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>
              </div>

              {/* Monaco Editor Container */}
              <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner">
                <Editor
                  height="360px"
                  language={currentLangConfig.monaco}
                  theme={editorTheme}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    tabSize: 4,
                    wordWrap: 'on'
                  }}
                />
              </div>

              {/* Bug Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  Bug Description / Expected Behavior (Optional)
                </label>
                <textarea
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="e.g. Expected function to return average grade, but returned NaN or threw zero division error..."
                  rows={2}
                  className="w-full bg-[#141424] border border-slate-800 focus:border-orange-500 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Error Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Compiler Error / Runtime Exception Traceback (Optional)
                </label>
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  placeholder="e.g. TypeError: Cannot read properties of undefined, or gcc: error: undefined reference to..."
                  rows={2}
                  className="w-full bg-[#141424] border border-slate-800 focus:border-orange-500 rounded-xl p-3 text-xs font-mono text-amber-300/90 placeholder-slate-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Error Banner if any */}
              {analysisError && (
                <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Submit Action */}
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Code & Generating Solution...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Analyze My Bug</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: AI Analysis Result Display */}
          <div className="lg:col-span-5 space-y-4">
            {result ? (
              <div className="bg-[#0e0e1a]/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">

                {/* Result Header & Status */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/50 border border-orange-800/50 px-2 py-0.5 rounded-md inline-block mb-1">
                      {result.errorType}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {result.bugTitle}
                    </h3>
                  </div>

                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {result.verificationStatus}
                  </span>
                </div>

                {/* Error Summary & Root Cause */}
                <div className="space-y-3">
                  <div className="bg-[#141424] border border-slate-800/80 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      Identified Error
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {result.errorExplanation}
                    </p>
                  </div>

                  <div className="bg-[#141424] border border-slate-800/80 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Root Cause
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.rootCause}
                    </p>
                  </div>
                </div>

                {/* Changes Made */}
                {result.changesMade && result.changesMade.length > 0 && (
                  <div className="bg-[#141424] border border-slate-800/80 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Changes Made
                    </div>
                    <ul className="space-y-1.5">
                      {result.changesMade.map((change, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons Toolbar with explicit Send via Gmail & Send via Email */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleCopyCode(result.correctedCode)}
                      className="py-2 px-2.5 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={handleDownloadCode}
                      className="py-2 px-2.5 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => setIsDiffMode(!isDiffMode)}
                      className={`py-2 px-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                        isDiffMode
                          ? 'bg-orange-500 text-white border-orange-400'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60'
                      }`}
                      title="Toggle side-by-side diff comparison"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>{isDiffMode ? 'Close Diff' : 'Diff'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Send via Gmail Button */}
                    <button
                      onClick={() => openEmailModal('gmail')}
                      className="py-2.5 px-3 bg-gradient-to-r from-red-600/90 to-orange-600/90 hover:from-red-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="font-extrabold text-[13px] bg-white text-red-600 w-4 h-4 rounded-full flex items-center justify-center">G</span>
                      <span>Send via Gmail</span>
                    </button>

                    {/* Send via Platform Mail (SMTP) Button */}
                    <button
                      onClick={() => openEmailModal('smtp')}
                      className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-orange-400" />
                      <span>Send via Email</span>
                    </button>
                  </div>
                </div>

                {/* Test Cases */}
                {result.testCases && result.testCases.length > 0 && (
                  <div className="bg-[#141424] border border-slate-800/80 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Verification Test Cases
                    </div>
                    <div className="space-y-2">
                      {result.testCases.map((tc, idx) => (
                        <div key={idx} className="bg-[#1a1a2e] rounded-lg p-2.5 text-[11px] space-y-1 border border-slate-800">
                          {tc.description && (
                            <div className="text-slate-400 font-medium">{tc.description}</div>
                          )}
                          <div className="text-slate-300">
                            <span className="text-slate-500 font-mono">Input:</span> {tc.input}
                          </div>
                          <div className="text-emerald-400">
                            <span className="text-slate-500 font-mono">Expected:</span> {tc.expectedOutput}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prevention Tips */}
                {result.preventionTips && result.preventionTips.length > 0 && (
                  <div className="bg-[#141424] border border-slate-800/80 rounded-xl p-3.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Prevention Recommendations
                    </div>
                    <ul className="space-y-1.5">
                      {result.preventionTips.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ) : (
              /* Empty state before analysis */
              <div className="h-full min-h-[460px] bg-[#0e0e1a]/60 border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4">
                  <Code2 className="w-8 h-8 text-orange-400/70" />
                </div>
                <h3 className="text-sm font-bold text-slate-200 mb-1">
                  Ready for AI Code Diagnosis
                </h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
                  Select your programming language, paste your code, and click <strong>Analyze My Bug</strong> to generate verified corrected code and root-cause explanations.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] text-slate-400">
                  <span className="bg-slate-800/60 px-2 py-1 rounded">Python</span>
                  <span className="bg-slate-800/60 px-2 py-1 rounded">Java</span>
                  <span className="bg-slate-800/60 px-2 py-1 rounded">C / C++</span>
                  <span className="bg-slate-800/60 px-2 py-1 rounded">JavaScript</span>
                  <span className="bg-slate-800/60 px-2 py-1 rounded">PHP</span>
                  <span className="bg-slate-800/60 px-2 py-1 rounded">C#</span>
                  <span className="bg-slate-800/60 px-2 py-1 rounded">SQL</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Side-by-Side Diff Comparison View or Full Corrected Code Block */}
        {result && (
          <div className="bg-[#0e0e1a]/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {isDiffMode ? 'Side-by-Side Code Diff (Original vs Corrected)' : 'Complete Corrected Code'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDiffMode(!isDiffMode)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  {isDiffMode ? 'Switch to Standard View' : 'Switch to Side-by-Side Diff'}
                </button>
                <button
                  onClick={() => handleCopyCode(result.correctedCode)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Corrected Code'}
                </button>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
              {isDiffMode ? (
                <DiffEditor
                  height="420px"
                  language={currentLangConfig.monaco}
                  theme={editorTheme}
                  original={result.originalCode}
                  modified={result.correctedCode}
                  options={{
                    fontSize: 13,
                    readOnly: true,
                    renderSideBySide: true,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    wordWrap: 'on'
                  }}
                />
              ) : (
                <Editor
                  height="420px"
                  language={currentLangConfig.monaco}
                  theme={editorTheme}
                  value={result.correctedCode}
                  options={{
                    fontSize: 13,
                    readOnly: true,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    lineNumbers: 'on',
                    wordWrap: 'on'
                  }}
                />
              )}
            </div>
          </div>
        )}

      </div>

      {/* Email Report Modal with Gmail & SMTP provider switching */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121222] border border-slate-700/80 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-400" />
                <h3 className="text-sm font-bold text-white">Share Bug Report</h3>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Provider Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0b0b18] border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEmailProvider('gmail');
                  setEmailStatus(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  emailProvider === 'gmail'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="font-extrabold text-[12px] bg-white text-red-600 w-3.5 h-3.5 rounded-full flex items-center justify-center">G</span>
                <span>Gmail (OAuth 2.0)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmailProvider('smtp');
                  setEmailStatus(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  emailProvider === 'smtp'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Platform Mail (SMTP)</span>
              </button>
            </div>

            {/* Provider Info Banner */}
            {emailProvider === 'gmail' ? (
              user?.gmailConnected ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                  <div>
                    <div className="font-bold">Sending via Connected Gmail</div>
                    <div className="text-[11px] text-emerald-400/90">{user.gmailEmail}</div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Gmail account not connected</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-normal">
                    Authorize your Google account to send bug reports directly from your Gmail address.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-lg transition-all"
                  >
                    <Link2 className="w-3 h-3" /> Connect in Profile Settings
                  </Link>
                </div>
              )
            ) : (
              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center justify-between">
                <div>
                  <div className="font-bold">Bug Replier Platform Mail</div>
                  <div className="text-[11px] text-blue-400/90">Sent via configured SMTP relay</div>
                </div>
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full bg-[#18182a] border border-slate-700 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {emailStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    emailStatus.success
                      ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
                      : 'bg-red-950/50 border border-red-800 text-red-300'
                  }`}
                >
                  {emailStatus.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{emailStatus.msg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail || (emailProvider === 'gmail' && !user?.gmailConnected)}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl disabled:opacity-50 flex items-center gap-1.5 shadow-md ${
                    emailProvider === 'gmail'
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'
                      : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/20'
                  }`}
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Report...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>{emailProvider === 'gmail' ? 'Send via Gmail' : 'Send via Platform Mail'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default CodeAnalyzer;
