import { Schema, model, Document } from 'mongoose';

export interface ICertificate extends Document {
  userId: string; // references User.firebaseUid
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  url?: string;
  credentialId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    url: { type: String },
    credentialId: { type: String },
  },
  { timestamps: true }
);

export default model<ICertificate>('Certificate', CertificateSchema);
