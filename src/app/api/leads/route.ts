import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Lead } from '@/models/Lead';
import { Provider } from '@/models/Provider';
import { SystemState } from '@/models/SystemState';

const MANDATORY_RULES: Record<string, number[]> = {
  'Service 1': [1],
  'Service 2': [5],
  'Service 3': [1, 4],
};

const FAIR_POOLS: Record<string, number[]> = {
  'Service 1': [2, 3, 4],
  'Service 2': [6, 7, 8],
  'Service 3': [2, 3, 5, 6, 7, 8],
};

interface LeadRequestBody {
  name: string;
  phoneNumber: string;
  city: string;
  serviceType: 'Service 1' | 'Service 2' | 'Service 3';
  description?: string;
}

async function acquireLock() {
  const maxRetries = 100;
  let retries = 0;

  while (retries < maxRetries) {
    const lock = await SystemState.findOneAndUpdate(
      { type: 'allocation_lock', locked: false },
      { $set: { locked: true, lockedAt: new Date() } },
      { new: true }
    );
    if (lock) return true;

    const staleLock = await SystemState.findOneAndUpdate(
      {
        type: 'allocation_lock',
        locked: true,
        lockedAt: { $lt: new Date(Date.now() - 5000) },
      },
      { $set: { lockedAt: new Date() } },
      { new: true }
    );
    if (staleLock) return true;

    await new Promise((resolve) => setTimeout(resolve, 50));
    retries += 1;
  }

  throw new Error('Could not acquire allocation lock');
}

async function releaseLock() {
  await SystemState.updateOne({ type: 'allocation_lock' }, { $set: { locked: false } });
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = (await req.json()) as LeadRequestBody;
    const { name, phoneNumber, city, serviceType, description } = body;

    if (!name || !phoneNumber || !city || !serviceType) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await Lead.findOne({ phoneNumber, serviceType });
    if (existing) {
      return NextResponse.json({ error: 'Duplicate lead for this phone and service' }, { status: 400 });
    }

    await acquireLock();
    try {
      const existingInLock = await Lead.findOne({ phoneNumber, serviceType });
      if (existingInLock) {
        return NextResponse.json({ error: 'Duplicate lead for this phone and service' }, { status: 400 });
      }

      const assignedProviders: number[] = [];
      const mandatoryIds = MANDATORY_RULES[serviceType] ?? [];
      const pool = FAIR_POOLS[serviceType] ?? [];

      for (const pId of mandatoryIds) {
        const providerDoc = await Provider.findOne({ providerId: pId });
        if (providerDoc && providerDoc.quotaUsed < providerDoc.quota) {
          assignedProviders.push(pId);
          providerDoc.quotaUsed += 1;
          await providerDoc.save();
        }
      }

      let needed = 3 - assignedProviders.length;
      if (needed > 0 && pool.length > 0) {
        const rrState = await SystemState.findOne({ type: 'round_robin' });
        const currentIndexValue = rrState?.indexes?.get(serviceType) ?? 0;
        let currentIndex = Number(currentIndexValue);
        let attempts = 0;

        while (needed > 0 && attempts < pool.length) {
          const candidateId = pool[currentIndex % pool.length];
          if (!assignedProviders.includes(candidateId)) {
            const candidateProvider = await Provider.findOne({ providerId: candidateId });
            if (candidateProvider && candidateProvider.quotaUsed < candidateProvider.quota) {
              assignedProviders.push(candidateId);
              candidateProvider.quotaUsed += 1;
              await candidateProvider.save();
              needed -= 1;
            }
          }

          currentIndex += 1;
          attempts += 1;
        }

        if (!rrState) {
          throw new Error('Round robin state missing');
        }

        rrState.indexes.set(serviceType, currentIndex % pool.length);
        await rrState.save();
      }

      if (assignedProviders.length < 3) {
        throw new Error('Unable to allocate three providers with current quotas');
      }

      const newLead = await Lead.create({
        name,
        phoneNumber,
        city,
        serviceType,
        description,
        assignedProviders,
      });

      return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
    } finally {
      await releaseLock();
    }
  } catch (error: unknown) {
    const isMongoDuplicateError = 
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'number' &&
      (error as { code: number }).code === 11000;

    if (isMongoDuplicateError) {
      return NextResponse.json({ error: 'Duplicate lead' }, { status: 400 });
    }

    console.error('Lead allocation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
