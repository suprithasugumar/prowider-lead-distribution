import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin') || `http://${req.headers.get('host')}`;
    const promises = [];
    
    // Generate 10 leads simultaneously to test concurrency
    for (let i = 0; i < 10; i++) {
      const randomPhone = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const services = ['Service 1', 'Service 2', 'Service 3'];
      const randomService = services[Math.floor(Math.random() * services.length)];
      
      const payload = {
        name: `Test Lead ${Math.floor(Math.random() * 10000)}`,
        phoneNumber: randomPhone,
        city: 'Concurrency City',
        serviceType: randomService,
        description: 'Bulk testing lead'
      };
      
      promises.push(
        fetch(`${origin}/api/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      );
    }
    
    const results = await Promise.allSettled(promises);
    const successes = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
    
    return NextResponse.json({ message: `Sent 10 leads simultaneously. Successful: ${successes}` }, { status: 200 });
  } catch (error) {
    console.error('Bulk leads error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
