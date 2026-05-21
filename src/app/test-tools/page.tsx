
"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';

export default function TestTools() {
  const [providerId, setProviderId] = useState('1');
  const [webhookLog, setWebhookLog] = useState<string[]>([]);
  const [bulkLog, setBulkLog] = useState<string[]>([]);
  const [loadingWebhook, setLoadingWebhook] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);

  const callWebhook = async () => {
    setLoadingWebhook(true);
    const currentEventId = `payment_evt_${Math.floor(Date.now() / 10000)}`;

    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: currentEventId, providerId: parseInt(providerId, 10) }),
      });
      const data = await res.json();
      const timestamp = new Date().toLocaleTimeString();

      if (res.ok) {
        setWebhookLog((prev) => [
          `[${timestamp}] SUCCESS: eventId="${currentEventId}" -> ${data.message}`,
          ...prev,
        ]);
      } else {
        setWebhookLog((prev) => [
          `[${timestamp}] ERROR: ${data.error || 'Server error'}`,
          ...prev,
        ]);
      }
    } catch (err: unknown) {
      console.error('Webhook request failed:', err);
      setWebhookLog((prev) => [`[${new Date().toLocaleTimeString()}] CRITICAL: Network connection failed`, ...prev]);
    } finally {
      setLoadingWebhook(false);
    }
  };

  const generateBulkLeads = async () => {
    setLoadingBulk(true);
    try {
      const timestamp = new Date().toLocaleTimeString();
      setBulkLog((prev) => [`[${timestamp}] INFO: Initiating 10 simultaneous REST allocations...`, ...prev]);

      const res = await fetch('/api/test-tools/bulk-leads', { method: 'POST' });
      const data = await res.json();
      const doneTimestamp = new Date().toLocaleTimeString();

      if (res.ok) {
        setBulkLog((prev) => [`[${doneTimestamp}] COMPLETE: ${data.message}`, ...prev]);
      } else {
        setBulkLog((prev) => [`[${doneTimestamp}] FAILED: ${data.error || 'Server error'}`, ...prev]);
      }
    } catch (err: unknown) {
      console.error('Bulk lead request failed:', err);
      setBulkLog((prev) => [`[${new Date().toLocaleTimeString()}] CRITICAL: Bulk request failure`, ...prev]);
    } finally {
      setLoadingBulk(false);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-10 px-4">
      <div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Simulation & Verification Terminal
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform high-concurrency race condition testing and simulate external payment gateway webhooks.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Webhook Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            Webhook Simulation (Quota Reset)
          </h2>
          <p className="text-slate-400 mb-6 text-xs leading-relaxed">
            Simulate a payment gateway subscription renewal webhook. This forces a provider&apos;s `quotaUsed` back to 0 (resetting remaining quota to 10).
            <span className="text-emerald-400/90 font-medium ml-1">Idempotency check:</span> clicks within the same 10-second block share the same event ID. The server must process the first event and ignore subsequent duplicates.
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Provider</label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
              >
                {[1,2,3,4,5,6,7,8].map(id => (
                  <option key={id} value={id} className="bg-slate-900 text-white">Provider {id} (ID: {id})</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={callWebhook}
              disabled={loadingWebhook}
              className="py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-emerald-500/20 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              {loadingWebhook ? 'Triggering...' : 'Trigger Webhook'}
            </button>
          </div>

          <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 h-44 overflow-y-auto font-mono text-xs text-emerald-400/90 shadow-inner">
            <div className="border-b border-white/5 pb-2 mb-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Webhook Event Stream
            </div>
            {webhookLog.length === 0 ? (
              <span className="text-slate-600 italic">Console idle. Awaiting webhook events...</span>
            ) : null}
            <div className="space-y-1">
              {webhookLog.map((log, i) => (
                <div key={i} className="leading-5">{log}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Concurrency Card */}
        <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400"></span>
            Concurrency Load Test
          </h2>
          <p className="text-slate-400 mb-6 text-xs leading-relaxed">
            Instantly dispatch **10 simultaneous REST lead requests** in parallel using `Promise.allSettled`.
            This verifies that our pessimistic database atomic spinlocks correctly block overlapping writes, avoid quota overruns, and prevent double-allocations under high concurrency stress.
          </p>
          
          <button
            onClick={generateBulkLeads}
            disabled={loadingBulk}
            className="mb-6 py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 shadow-md hover:shadow-violet-500/20 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            {loadingBulk ? 'Generating...' : 'Fire 10 Leads Instantly'}
          </button>

          <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 h-44 overflow-y-auto font-mono text-xs text-violet-400 shadow-inner">
            <div className="border-b border-white/5 pb-2 mb-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
              Concurrency Execution logs
            </div>
            {bulkLog.length === 0 ? (
              <span className="text-slate-600 italic">Console idle. Awaiting stress tests...</span>
            ) : null}
            <div className="space-y-1">
              {bulkLog.map((log, i) => (
                <div key={i} className="leading-5">{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
