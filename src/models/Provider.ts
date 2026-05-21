import mongoose from 'mongoose';

const ProviderSchema = new mongoose.Schema({
  providerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  quota: { type: Number, default: 10 },
  quotaUsed: { type: Number, default: 0 },
});

export const Provider = mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);
