import { Schema, model, Document } from 'mongoose';

export interface ISkill extends Document {
  userId: string; // references User.firebaseUid
  name: string;
  category: string; // e.g. Frontend, Backend, Devops, Soft Skills, Languages
  proficiency: 'beginner' | 'intermediate' | 'expert';
  yearsOfExperience: number;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    proficiency: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'intermediate' },
    yearsOfExperience: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<ISkill>('Skill', SkillSchema);
