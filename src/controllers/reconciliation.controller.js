import { v4 as uuidv4 } from 'uuid';
import { ingestCSV } from '../services/ingestion.service.js';
import { runMatching } from '../services/matching.service.js';
import Report from '../models/Report.js';
import Transaction from '../models/Transaction.js';

export async function reconcile(req, res) {
  try {
    const runId = uuidv4();

    const {
      timestampTolerance,
      quantityTolerancePct
    } = req.body || {};

    // ⚠️ Hardcoded file paths for now (you can improve later with upload)
    await ingestCSV('./uploads/user_transactions.csv', 'USER', runId);
    await ingestCSV('./uploads/exchange_transactions.csv', 'EXCHANGE', runId);

    await runMatching(runId, {
      timestampTolerance,
      quantityTolerancePct
    });

    res.json({
      message: 'Reconciliation completed',
      runId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getReport(req, res) {
  try {
    const { runId } = req.params;

    const reports = await Report.find({ runId });

    res.json(reports);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSummary(req, res) {
  try {
    const { runId } = req.params;

    const summary = await Report.aggregate([
      { $match: { runId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = {
      MATCHED: 0,
      CONFLICT: 0,
      UNMATCHED_USER: 0,
      UNMATCHED_EXCHANGE: 0
    };

    summary.forEach(item => {
      formatted[item._id] = item.count;
    });

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUnmatched(req, res) {
  try {
    const { runId } = req.params;

    const unmatched = await Report.find({
      runId,
      category: { $in: ['UNMATCHED_USER', 'UNMATCHED_EXCHANGE'] }
    });

    res.json(unmatched);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

