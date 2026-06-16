import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  userId: string; // references User.firebaseUid
  title: string;
  description: string;
  url?: string;
  githubUrl?: string;
  technologies: string[];
  image?: string;
  startDate?: Date;
  endDate?: Date;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String },
    githubUrl: { type: String },
    technologies: { type: [String], default: [] },
    image: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    achievements: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model<IProject>('Project', ProjectSchema);
