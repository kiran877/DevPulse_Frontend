import 'dotenv/config';
import { connectDB } from '../src/lib/db.js';
import { Event } from '../src/models/Event.js';

async function debug() {
  await connectDB();
  const events = await Event.find().sort({ createdAt: -1 });
  console.log(`--- Total Events in DB: ${events.length} ---`);
  
  events.forEach(e => {
    console.log(`- [${e.createdAt.toISOString()}] ${e.repoFullName.padEnd(40)} | Type: ${e.eventType.padEnd(15)} | Action: ${e.action || 'N/A'} | Conclusion: ${e.conclusion || 'N/A'}`);
  });

  process.exit(0);
}

debug();
