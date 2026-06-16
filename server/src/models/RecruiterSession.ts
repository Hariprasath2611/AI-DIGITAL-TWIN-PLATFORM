import { Schema, model, Document } from 'mongoose';

export interface IRecruiterSession extends Document {
  userId: string; // references User.firebaseUid
  recruiterName: string;
  company: string;
  role: string; // the target position (e.g. Senior Frontend Engineer)
  rating: number; // overall rating (1-5)
  score: number; // hiring readiness score (0-100)
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    suggestedLearningPaths: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecruiterSessionSchema = new Schema<IRecruiterSession>(
  {
    userId: { type: String, required: true, index: true },
    recruiterName: { type: String, required: true, default: 'Recruiter' },
    company: { type: String, required: true, default: 'Anonymous Corp' },
    role: { type: String, required: true },
    rating: { type: Number, default: 3 },
    score: { type: Number, default: 70 },
    feedback: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      improvements: { type: [String], default: [] },
      suggestedLearningPaths: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

export default model<IRecruiterSession>('RecruiterSession', RecruiterSessionSchema);
