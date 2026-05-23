import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  runId: String,

  userTx: Object,
  exchangeTx: Object,

  category: {
    type: String,
    enum: [
      'MATCHED',
      'CONFLICT',
      'UNMATCHED_USER',
      'UNMATCHED_EXCHANGE'
    ]
  },

  reason: String
}, { timestamps: true });

export default mongoose.model('Report', ReportSchema);