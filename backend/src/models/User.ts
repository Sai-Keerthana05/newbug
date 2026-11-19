import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  subscription: 'Free' | 'Prime';
  analysesUsed: number;
  lastAnalysisResetDate: Date;
  role: 'User' | 'Admin';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  subscription: { type: String, enum: ['Free', 'Prime'], default: 'Free' },
  analysesUsed: { type: Number, default: 0 },
  lastAnalysisResetDate: { type: Date, default: Date.now },
  role: { type: String, enum: ['User', 'Admin'], default: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
