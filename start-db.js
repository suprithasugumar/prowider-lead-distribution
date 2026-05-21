/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

async function main() {
  const dbPath = path.join(__dirname, 'mongodb-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  // Set storage engine to wiredTiger for persistence, and bind to standard port
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbPath: dbPath,
      storageEngine: 'wiredTiger'
    }
  });

  const uri = mongod.getUri();
  console.log(`\n======================================================`);
  console.log(`✅ MongoDB Memory Server running with PERSISTENCE!`);
  console.log(`📍 Connection URI: ${uri}`);
  console.log(`======================================================\n`);
  
  const envPath = path.join(__dirname, '.env.local');
  fs.writeFileSync(envPath, `MONGODB_URI=${uri}\n`);
  console.log(`Wrote MONGODB_URI to .env.local`);

  process.on('SIGINT', async () => {
    console.log('Stopping MongoDB...');
    await mongod.stop();
    process.exit(0);
  });
}

main().catch(console.error);
