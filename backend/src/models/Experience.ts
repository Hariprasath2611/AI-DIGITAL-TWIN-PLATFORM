import { Schema, model, Document } from 'mongoose';

export interface IExperience extends Document {
  userId: string; // references User.firebaseUid
  company: string;
  role: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    userId: { type: String, required: true, index: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, required: true },
    achievements: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model<IExperience>('Experience', ExperienceSchema);
