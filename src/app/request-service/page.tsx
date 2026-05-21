"use client";

import { useState } from 'react';

export default function RequestService() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    city: '',
    serviceType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Enquiry submitted successfully! It has been automatically assigned to our top providers.' });
        setFormData({ name: '', phoneNumber: '', city: '', serviceType: '', description: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit lead' });
      }
    } catch (error: unknown) {
      console.error('Lead submission failed:', error);
      setMessage({ type: 'error', text: 'An unexpected database error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="glass-card p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
          Request Service
        </h1>
        <p className="text-slate-400 mb-8 text-sm">
          Submit your service requirements below. Our automated system will allocate your request to our top-rated local providers instantly.
        </p>
        
        {message && (
          <div className={`p-4 rounded-xl mb-8 border backdrop-blur-md animate-fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20' 
              : 'bg-rose-950/40 text-rose-300 border-rose-500/20'
          }`}>
            <div className="flex gap-3 items-center">
              <span className={`h-2 w-2 rounded-full ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Name</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                required
                type="tel"
                name="phoneNumber"
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="9999999999"
                className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">City</label>
              <input
                required
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="San Francisco"
                className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Service Type</label>
              <select
                required
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Select a service</option>
                <option value="Service 1" className="bg-slate-900 text-white">Service 1</option>
                <option value="Service 2" className="bg-slate-900 text-white">Service 2</option>
                <option value="Service 3" className="bg-slate-900 text-white">Service 3</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us more about the service you require..."
              className="w-full rounded-xl glass-input px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/20 hover:scale-[1.01] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting Request...
              </span>
            ) : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
