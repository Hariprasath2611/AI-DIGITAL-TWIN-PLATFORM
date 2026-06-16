import { Schema, model, Document } from 'mongoose';

export interface IViewEvent {
  ip: string;
  country?: string;
  timestamp: Date;
}

export interface IDailyMetric {
  date: Date;
  views: number;
  chats: number;
  interactions: number;
}

export interface IAnalytics extends Document {
  userId: string; // references User.firebaseUid
  views: IViewEvent[];
  chatConversationsCount: number;
  recruiterInteractionsCount: number;
  dailyMetrics: IDailyMetric[];
  createdAt: Date;
  updatedAt: Date;
}

const ViewEventSchema = new Schema<IViewEvent>({
  ip: { type: String, required: true },
  country: { type: String, default: 'Unknown' },
  timestamp: { type: Date, default: Date.now },
});

const DailyMetricSchema = new Schema<IDailyMetric>({
  date: { type: Date, required: true },
  views: { type: Number, default: 0 },
  chats: { type: Number, default: 0 },
  interactions: { type: Number, default: 0 },
});

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    views: { type: [ViewEventSchema], default: [] },
    chatConversationsCount: { type: Number, default: 0 },
    recruiterInteractionsCount: { type: Number, default: 0 },
    dailyMetrics: { type: [DailyMetricSchema], default: [] },
  },
  { timestamps: true }
);

export default model<IAnalytics>('Analytics', AnalyticsSchema);
