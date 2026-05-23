import fs from 'fs';
import { parse } from 'csv-parse';
import Transaction from '../models/Transaction.js';
import {
  normalizeAsset,
  normalizeType,
  normalizeTimestamp,
  normalizeQuantity
} from '../utils/normalize.js';

export async function ingestCSV(filePath, source, runId) {
  const records = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (row) => {
        const errors = [];

        const normalized = {
          timestamp: normalizeTimestamp(row.timestamp),
          asset: normalizeAsset(row.asset),
          type: normalizeType(row.type),
          quantity: normalizeQuantity(row.quantity),
          transactionId: row.transactionId || null
        };

        if (!normalized.timestamp) errors.push('Invalid timestamp');
        if (!normalized.asset) errors.push('Invalid asset');
        if (!normalized.type) errors.push('Invalid type');
        if (!normalized.quantity) errors.push('Invalid quantity');

        records.push({
          runId,
          source,
          raw: row,
          normalized,
          status: {
            isValid: errors.length === 0,
            errors
          }
        });
      })
      .on('end', async () => {
        await Transaction.insertMany(records);
        resolve();
      })
      .on('error', reject);
  });
}