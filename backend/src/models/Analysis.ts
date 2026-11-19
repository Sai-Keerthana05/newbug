import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  originalCode: string;
  correctedCode: string;
  language: string;
  errorSummary: string;
  rootCause: string;
  explanation: string;
  videoUrl?: string;
  createdAt: Date;
}

const AnalysisSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalCode: { type: String, required: true },
  correctedCode: { type: String, default: '' },
  language: { type: String, required: true },
  errorSummary: { type: String, default: '' },
  rootCause: { type: String, default: '' },
  explanation: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
