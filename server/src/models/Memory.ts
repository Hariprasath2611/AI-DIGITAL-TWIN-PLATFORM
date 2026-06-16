import { Schema, model, Document } from 'mongoose';

export interface IMemory extends Document {
  userId: string; // references User.firebaseUid
  title: string;
  description: string;
  category: 'achievement' | 'milestone' | 'learning' | 'project' | 'career_event';
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['achievement', 'milestone', 'learning', 'project', 'career_event'],
      required: true,
    },
    date: { type: Date, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model<IMemory>('Memory', MemorySchema);
