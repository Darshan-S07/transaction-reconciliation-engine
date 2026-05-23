import Transaction from '../models/Transaction.js';
import Report from '../models/Report.js';

export async function runMatching(runId, config = {}) {
  const timestampTolerance =
    config.timestampTolerance ||
    process.env.TIMESTAMP_TOLERANCE_SECONDS ||
    300;

  const quantityTolerancePct =
    config.quantityTolerancePct ||
    process.env.QUANTITY_TOLERANCE_PCT ||
    0.01;

  // Fetch valid transactions only
  const userTxs = await Transaction.find({
    runId,
    source: 'USER',
    'status.isValid': true
  });

  const exchangeTxs = await Transaction.find({
    runId,
    source: 'EXCHANGE',
    'status.isValid': true
  });

  // Index exchange transactions
  const exchangeMap = new Map();

  for (let tx of exchangeTxs) {
    const key = `${tx.normalized.asset}_${tx.normalized.type}`;
    if (!exchangeMap.has(key)) {
      exchangeMap.set(key, []);
    }
    exchangeMap.get(key).push(tx);
  }

  const reports = [];

  // 🔁 Matching loop
for (let userTx of userTxs) {
  const key = `${userTx.normalized.asset}_${userTx.normalized.type}`;
  const candidates = exchangeMap.get(key) || [];

  let bestMatch = null;
  let bestScore = Infinity;
  let potentialConflict = null; // ✅ define OUTSIDE loop

  for (let exTx of candidates) {
    if (exTx.matched) continue;

    const timeDiff =
      Math.abs(
        new Date(userTx.normalized.timestamp) -
        new Date(exTx.normalized.timestamp)
      ) / 1000;

    const qtyDiff =
      Math.abs(userTx.normalized.quantity - exTx.normalized.quantity) /
      Math.max(userTx.normalized.quantity, exTx.normalized.quantity);

    // ✅ PERFECT MATCH
    if (timeDiff <= timestampTolerance && qtyDiff <= quantityTolerancePct) {
      const score = timeDiff + qtyDiff;

      if (score < bestScore) {
        bestScore = score;
        bestMatch = exTx;
      }
    }

    // ⚠️ POSSIBLE CONFLICT
    else if (timeDiff <= timestampTolerance * 2 ||
  qtyDiff <= quantityTolerancePct * 5) {
      if (!potentialConflict) {
        potentialConflict = exTx;
      }
    }
  }

  // ✅ Decision block
  if (bestMatch) {
    bestMatch.matched = true;
    await bestMatch.save();

    reports.push({
      runId,
      userTx,
      exchangeTx: bestMatch,
      category: 'MATCHED',
      reason: 'Matched within tolerance'
    });

  } else if (potentialConflict) {
    potentialConflict.matched = true;
    await potentialConflict.save();

    let reason = [];

if (timeDiff > timestampTolerance) {
  reason.push('Timestamp outside tolerance');
}
if (qtyDiff > quantityTolerancePct) {
  reason.push('Quantity outside tolerance');
}

reports.push({
  runId,
  userTx,
  exchangeTx: potentialConflict,
  category: 'CONFLICT',
  reason: reason.join(', ')
});

  } else {
    reports.push({
      runId,
      userTx,
      exchangeTx: null,
      category: 'UNMATCHED_USER',
      reason: 'No matching transaction found'
    });
  }
}

  // Remaining unmatched exchange txs
  for (let exTx of exchangeTxs) {
    if (!exTx.matched) {
      reports.push({
        runId,
        userTx: null,
        exchangeTx: exTx,
        category: 'UNMATCHED_EXCHANGE',
        reason: 'No matching user transaction'
      });
    }
  }

  await Report.insertMany(reports);

  return {
    total: reports.length
  };
}