import { Schema, model, Document } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string; // references User.firebaseUid
  context: 'personal_assistant' | 'mock_recruiter' | 'public_portfolio';
  visitorId?: string; // set for public portfolio queries to group them
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true, index: true },
    context: {
      type: String,
      enum: ['personal_assistant', 'mock_recruiter', 'public_portfolio'],
      required: true,
      default: 'personal_assistant',
    },
    visitorId: { type: String },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default model<IConversation>('Conversation', ConversationSchema);
