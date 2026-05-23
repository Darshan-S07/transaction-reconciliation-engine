import { ingestCSV } from './src/services/ingestion.service.js';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const runId = uuidv4();

console.log("RUN ID:", runId);   // 👈 important

await mongoose.connect('mongodb://127.0.0.1:27017/reconciliation');

await ingestCSV('./uploads/user_transactions.csv', 'USER', runId);
await ingestCSV('./uploads/exchange_transactions.csv', 'EXCHANGE', runId);

console.log('Ingestion complete');
process.exit();