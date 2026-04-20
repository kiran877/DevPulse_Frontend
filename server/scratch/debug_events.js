import 'dotenv/config';
import { connectDB } from '../src/lib/db.js';
import { Event } from '../src/models/Event.js';

async function debug() {
  await connectDB();
  const events = await Event.find({ eventType: 'workflow_run' });
  console.log(`--- Total Workflow Run Events: ${events.length} ---`);
  
  events.forEach(e => {
    console.log(`- [${e.createdAt.toISOString()}] ${e.repoFullName} | Action: ${e.action} | Conclusion: ${e.conclusion}`);
  });

  process.exit(0);
}

debug();
