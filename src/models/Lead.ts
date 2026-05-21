import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String },
  assignedProviders: [{ type: Number }], // array of providerIds
}, { timestamps: true });

// Prevent duplicate leads for the same phone number and service
LeadSchema.index({ phoneNumber: 1, serviceType: 1 }, { unique: true });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
