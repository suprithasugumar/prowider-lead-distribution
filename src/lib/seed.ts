import mongoose from 'mongoose';
import { Provider } from '../models/Provider';
import { SystemState } from '../models/SystemState';
import dbConnect from './db';

export async function seedDatabase() {
  if (mongoose.connection.readyState === 0) {
    await dbConnect();
  }
  
  const count = await Provider.countDocuments();
  if (count === 0) {
    const providers = Array.from({ length: 8 }, (_, i) => ({
      providerId: i + 1,
      name: `Provider ${i + 1}`,
      quota: 10,
      quotaUsed: 0,
    }));
    await Provider.insertMany(providers);
    console.log('Seeded 8 providers');
  }

  const rrState = await SystemState.findOne({ type: 'round_robin' });
  if (!rrState) {
    await SystemState.create({
      type: 'round_robin',
      indexes: { 'Service 1': 0, 'Service 2': 0, 'Service 3': 0 }
    });
    console.log('Seeded round robin state');
  }

  const lockState = await SystemState.findOne({ type: 'allocation_lock' });
  if (!lockState) {
    await SystemState.create({
      type: 'allocation_lock',
      locked: false,
    });
    console.log('Seeded allocation lock state');
  }
}

if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  }).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
