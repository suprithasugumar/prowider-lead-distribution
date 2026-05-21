import mongoose from 'mongoose';

const SystemStateSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  locked: { type: Boolean },
  lockedAt: { type: Date },
  indexes: { type: Map, of: Number }, 
});

export const SystemState = mongoose.models.SystemState || mongoose.model('SystemState', SystemStateSchema);
