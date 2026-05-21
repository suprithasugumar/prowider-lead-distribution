import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Provider } from '@/models/Provider';
import { Lead } from '@/models/Lead';

interface LeadSummary {
  name: string;
  city: string;
  serviceType: string;
  createdAt: Date;
}

interface ProviderSummary {
  providerId: number;
  name: string;
  quota: number;
  quotaUsed: number;
  remainingQuota: number;
  leadsReceivedCount: number;
  assignedLeads: LeadSummary[];
}

export async function GET() {
  try {
    await dbConnect();

    const providers = await Provider.find({}).sort({ providerId: 1 }).lean() as Array<{
      providerId: number;
      name: string;
      quota: number;
      quotaUsed: number;
    }>;

    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean() as Array<{
      assignedProviders: number[];
      name: string;
      city: string;
      serviceType: string;
      createdAt: Date;
    }>;

    const dashboardData: ProviderSummary[] = providers.map((provider) => {
      const assignedLeads = leads.filter((lead) => lead.assignedProviders.includes(provider.providerId));

      return {
        providerId: provider.providerId,
        name: provider.name,
        quota: provider.quota,
        quotaUsed: provider.quotaUsed,
        remainingQuota: provider.quota - provider.quotaUsed,
        leadsReceivedCount: assignedLeads.length,
        assignedLeads: assignedLeads.map((lead) => ({
          name: lead.name,
          city: lead.city,
          serviceType: lead.serviceType,
          createdAt: lead.createdAt,
        })),
      };
    });

    return NextResponse.json({ providers: dashboardData });
  } catch (error: unknown) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
