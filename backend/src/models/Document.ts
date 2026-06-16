import { Schema, model, Document } from 'mongoose';

export interface IDocument extends Document {
  userId: string; // references User.firebaseUid
  name: string;
  type: 'resume' | 'portfolio' | 'certificate' | 'project_doc' | 'note' | 'blog';
  fileUrl?: string;
  cloudinaryId?: string;
  contentText: string; // extracted text content for AI usage
  embeddingsIndexed: boolean;
  category: string; // auto categorization by AI
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['resume', 'portfolio', 'certificate', 'project_doc', 'note', 'blog'],
      required: true,
    },
    fileUrl: { type: String },
    cloudinaryId: { type: String },
    contentText: { type: String, required: true, default: '' },
    embeddingsIndexed: { type: Boolean, default: false },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
);

export default model<IDocument>('Document', DocumentSchema);
