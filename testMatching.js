import mongoose from 'mongoose';
import { runMatching } from './src/services/matching.service.js';

const runId = '58d3b86f-8a3f-4ca9-a529-36a8e191a7a6';

await mongoose.connect('mongodb://127.0.0.1:27017/reconciliation');

const result = await runMatching(runId);

console.log(result);
process.exit();