
"use client";
export const dynamic = "force-dynamic";

import useSWR from 'swr';

interface AssignedLead {
  name: string;
  city: string;
  serviceType: string;
  createdAt: string;
}

interface ProviderData {
  providerId: number;
  name: string;
  quota: number;
  quotaUsed: number;
  remainingQuota: number;
  leadsReceivedCount: number;
  assignedLeads: AssignedLead[];
}

interface DashboardResponse {
  providers: ProviderData[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<DashboardResponse>);

const getServiceColors = (serviceType: string) => {
  switch (serviceType) {
    case 'Service 1':
      return {
        border: 'border-blue-500/40',
        text: 'text-blue-300',
        bg: 'bg-blue-950/40',
      };
    case 'Service 2':
      return {
        border: 'border-violet-500/40',
        text: 'text-violet-300',
        bg: 'bg-violet-950/40',
      };
    case 'Service 3':
      return {
        border: 'border-emerald-500/40',
        text: 'text-emerald-300',
        bg: 'bg-emerald-950/40',
      };
    default:
      return {
        border: 'border-slate-500/40',
        text: 'text-slate-300',
        bg: 'bg-slate-950/40',
      };
  }
};

export default function Dashboard() {
  const { data, error, isLoading } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 2000 // Poll every 2 seconds for a seamless real-time feel
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400 text-sm font-semibold">Loading real-time provider dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <div className="bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-2xl p-6 backdrop-blur-md">
          <p className="font-bold text-lg mb-2">System Sync Offline</p>
          <p className="text-sm text-rose-400">Failed to connect to real-time database servers. Please verify if the database is active.</p>
        </div>
      </div>
    );
  }

  const providers = data?.providers ?? [];

  return (
    <div className="py-8 px-4">
      {/* Header section with status indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Provider Control Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time lead assignment overview, quota utilization logs, and provider statuses.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-900/60 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Live Connection Active</span>
        </div>
      </div>
      
      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {providers.map((provider) => {
          const quotaPercent = Math.min((provider.quotaUsed / provider.quota) * 100, 100);
          const isFull = provider.remainingQuota <= 0;

          // Determine quota progress bar color
          let progressColor = 'from-blue-500 to-indigo-500';
          if (quotaPercent >= 90) progressColor = 'from-rose-500 to-red-500';
          else if (quotaPercent >= 70) progressColor = 'from-amber-500 to-orange-500';
          else if (quotaPercent > 0) progressColor = 'from-emerald-500 to-teal-500';

          return (
            <div key={provider.providerId} className="glass-card rounded-2xl p-6 flex flex-col min-h-[460px] relative overflow-hidden border border-white/5">
              {/* Card accent glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none ${
                isFull ? 'bg-rose-500' : 'bg-blue-500'
              }`}></div>

              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{provider.name}</h2>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {provider.providerId}</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isFull 
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-500/20' 
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/20'
                }`}>
                  {isFull ? 'Full Quota' : 'Active'}
                </span>
              </div>
              
              {/* Quota Progress Meter */}
              <div className="mb-6 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Monthly Quota</span>
                  <span>{provider.remainingQuota} Left • {provider.quotaUsed}/{provider.quota}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${quotaPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Total Leads Metric */}
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 border border-white/5 rounded-lg text-xs mb-6 text-slate-300">
                <span className="font-medium">Total Leads Received:</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded font-bold text-white">{provider.leadsReceivedCount}</span>
              </div>

              {/* Assigned Leads List */}
              <div className="flex-1 flex flex-col border-t border-white/5 pt-4 overflow-hidden">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Assigned Leads List</h3>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-56">
                  {provider.assignedLeads.length === 0 ? (
                    <div className="h-full flex items-center justify-center py-10 text-center">
                      <p className="text-xs text-slate-500 italic">No enquiries assigned yet</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {provider.assignedLeads.map((lead, idx) => {
                        const colors = getServiceColors(lead.serviceType);
                        return (
                          <li 
                            key={idx} 
                            className={`p-3 rounded-xl border ${colors.border} ${colors.bg} hover:bg-white/5 transition-all duration-200`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-sm text-white">{lead.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${colors.text}`}>
                                {lead.serviceType}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-400">
                              <span>{lead.city}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
