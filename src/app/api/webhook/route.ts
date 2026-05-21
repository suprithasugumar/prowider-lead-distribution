import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Provider } from '@/models/Provider';
import mongoose from 'mongoose';

const WebhookEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  processedAt: { type: Date, default: Date.now },
});
const WebhookEvent = mongoose.models.WebhookEvent || mongoose.model('WebhookEvent', WebhookEventSchema);

interface WebhookRequestBody {
  eventId?: string;
  providerId?: number;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = (await req.json()) as WebhookRequestBody;
    const { eventId, providerId } = body;

    if (!eventId || providerId === undefined) {
      return NextResponse.json({ error: 'Missing eventId or providerId' }, { status: 400 });
    }

    const existingEvent = await WebhookEvent.findOne({ eventId });
    if (existingEvent) {
      return NextResponse.json({ message: 'Webhook already processed (Idempotent)' }, { status: 200 });
    }

    const provider = await Provider.findOne({ providerId });
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    provider.quotaUsed = 0;
    await provider.save();
    await WebhookEvent.create({ eventId });

    return NextResponse.json({ message: 'Quota reset successfully' }, { status: 200 });
  } catch (error: unknown) {
    const isMongoDuplicateError =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code?: unknown }).code === 'number' &&
      (error as { code: number }).code === 11000;

    if (isMongoDuplicateError) {
      return NextResponse.json({ message: 'Webhook already processed (Idempotent race condition caught)' }, { status: 200 });
    }

    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
