import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  originalCode: string;
  correctedCode: string;
  language: string;
  bugDescription?: string;
  errorMessage?: string;
  bugTitle: string;
  errorType: string;
  errorExplanation: string;
  rootCause: string;
  problematicCode: string;
  correctionExplanation: string;
  changesMade: string[];
  verificationStatus: string;
  testCases: ITestCase[];
  preventionTips: string[];
  errorSummary: string;
  explanation: string;
  videoUrl?: string;
  createdAt: Date;
}

const TestCaseSchema = new Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const AnalysisSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  originalCode: { type: String, required: true },
  correctedCode: { type: String, default: '' },
  language: { type: String, required: true, lowercase: true, trim: true, index: true },
  bugDescription: { type: String, default: '' },
  errorMessage: { type: String, default: '' },
  bugTitle: { type: String, default: 'Code Bug Analysis' },
  errorType: { type: String, default: 'General Issue' },
  errorExplanation: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  problematicCode: { type: String, default: '' },
  correctionExplanation: { type: String, default: '' },
  changesMade: [{ type: String }],
  verificationStatus: { type: String, default: 'AI-Generated (Unverified)' },
  testCases: [TestCaseSchema],
  preventionTips: [{ type: String }],
  errorSummary: { type: String, default: '' },
  explanation: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true }
});

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
