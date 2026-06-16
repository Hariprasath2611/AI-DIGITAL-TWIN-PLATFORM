import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'recruiter' | 'admin';
  profileScore: number;
  writingStyleProfile?: {
    tone: string;
    vocabulary: string[];
    patterns: string[];
    samplePost?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true, index: true },
    displayName: { type: String, required: true },
    photoURL: { type: String },
    role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },
    profileScore: { type: Number, default: 0 },
    writingStyleProfile: {
      tone: { type: String, default: 'Professional, informative, and engaging' },
      vocabulary: { type: [String], default: ['efficient', 'scalable', 'modern', 'solution', 'optimize'] },
      patterns: { type: [String], default: ['Starts with a hook', 'Uses bullet points for readability', 'Ends with a question'] },
      samplePost: { type: String }
    }
  },
  { timestamps: true }
);

export default model<IUser>('User', UserSchema);
