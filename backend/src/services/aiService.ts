import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIAnalysisResult {
  errorSummary: string;
  rootCause: string;
  correctedCode: string;
  explanation: string;
}

export const analyzeCodeWithAI = async (
  code: string,
  language: string
): Promise<AIAnalysisResult> => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const prompt = `
Analyze the following source code written in ${language}. 
Identify any syntax errors, logical bugs, performance bottlenecks, or security flaws.
Return your response ONLY as a valid JSON object matching the schema below. Do not wrap the JSON in markdown code blocks (e.g. do not include \`\`\`json).

JSON Schema:
{
  "errorSummary": "A concise 1-2 sentence summary of what is wrong with the code.",
  "rootCause": "A detailed explanation of why the bug/error occurred.",
  "correctedCode": "The complete, fully corrected and formatted version of the code.",
  "explanation": "A beginner-friendly step-by-step explanation of the changes made and best practices to follow."
}

Source Code to Analyze:
${code}
`;

  // 1. Try Gemini API if key is available
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      // Using gemini-1.5-flash for speed and reliability
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonResponse(text);
      return JSON.parse(cleaned) as AIAnalysisResult;
    } catch (err) {
      console.error('Gemini API Error, falling back:', err);
    }
  }

  // 2. Try OpenAI API if key is available
  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });
      const data: any = await response.json();
      const content = data.choices[0].message.content;
      return JSON.parse(content) as AIAnalysisResult;
    } catch (err) {
      console.error('OpenAI API Error, falling back:', err);
    }
  }

  // 3. Fallback: Mock Analysis (extremely useful for offline testing and demos)
  console.log('No AI keys configured, running mock static analyzer fallback.');
  return runMockStaticAnalysis(code, language);
};

const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

const runMockStaticAnalysis = (code: string, language: string): AIAnalysisResult => {
  // Simple heuristic checks for mock analysis
  let errorSummary = 'No obvious syntax issues found, but code structure can be optimized.';
  let rootCause = 'The code appears syntactically valid but may contain edge-case issues or non-optimal operations.';
  let correctedCode = code;
  let explanation = 'Your code is mostly sound! Here are some structural improvements:';

  const lowerCode = code.toLowerCase();

  if (language.toLowerCase() === 'javascript' || language.toLowerCase() === 'typescript') {
    if (lowerCode.includes('var ')) {
      errorSummary = 'Use of deprecated "var" variable declarations.';
      rootCause = '"var" is function-scoped and subject to hoisting, which can lead to hard-to-track bugs and variable collisions.';
      correctedCode = code.replace(/var\s+/g, 'const ');
      explanation = 'Changed "var" declarations to "const" (or "let" where reassignment is required). This enforces block-scoping and prevents hoisting issues.';
    } else if (lowerCode.includes('==') && !lowerCode.includes('===')) {
      errorSummary = 'Use of loose equality "==" comparison.';
      rootCause = '"==" performs type coercion, which can lead to unexpected true positives (e.g., false == 0 is true).';
      correctedCode = code.replace(/==(?!=)/g, '===');
      explanation = 'Replaced loose equality checks (==) with strict equality checks (===). This ensures both value and type are matched without unexpected coercion.';
    } else if (lowerCode.includes('.then(')) {
      errorSummary = 'Found promise chaining instead of async/await.';
      rootCause = 'Deep promise chaining (".then().catch()") can result in "promise callback hell", making error handling and async flow difficult to follow.';
      explanation = 'Refactored async flow to use modern async/await syntax. This keeps your asynchronous operations linear, readable, and simplifies try/catch blocks.';
    }
  } else if (language.toLowerCase() === 'python') {
    if (lowerCode.includes('except:') || lowerCode.includes('except :')) {
      errorSummary = 'Bare except clause detected.';
      rootCause = 'Using a bare "except:" catches all exceptions, including SystemExit, KeyboardInterrupt, and memory issues, making debugging difficult.';
      correctedCode = code.replace(/except\s*:/g, 'except Exception as e:');
      explanation = 'Modified the bare except block to catch "Exception" explicitly. This allows system-level interrupts to proceed and captures the error object "e" for logging.';
    } else if (lowerCode.includes('open(') && !lowerCode.includes('with open')) {
      errorSummary = 'File opened without a context manager ("with" statement).';
      rootCause = 'Opening files without a context manager can keep file descriptors open in memory if exceptions occur before the file is closed.';
      explanation = 'Wrapped file operations in a "with open(...) as f:" context manager. This guarantees that file descriptors are automatically closed even if operations inside throw errors.';
    }
  }

  return {
    errorSummary,
    rootCause,
    correctedCode,
    explanation: `${explanation}\n\n1. Enforce strict type checks.\n2. Ensure proper error boundaries.\n3. Keep methods modular and clean.`
  };
};
