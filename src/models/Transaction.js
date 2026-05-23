import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  runId: String,

  source: {
    type: String,
    enum: ['USER', 'EXCHANGE']
  },

  raw: {
    type: Object
  },

  normalized: {
    timestamp: { type: Date },
    asset: { type: String },
    type: { type: String },
    quantity: { type: Number },
    transactionId: { type: String }
  },

  status: {
    isValid: Boolean,
    errors: [String]
  },

  matched: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);