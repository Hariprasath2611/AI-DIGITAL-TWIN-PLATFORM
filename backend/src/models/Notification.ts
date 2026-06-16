import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string; // references User.firebaseUid
  message: string;
  type: 'view' | 'recommendation' | 'message' | 'reminder';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['view', 'recommendation', 'message', 'reminder'],
      required: true,
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<INotification>('Notification', NotificationSchema);
