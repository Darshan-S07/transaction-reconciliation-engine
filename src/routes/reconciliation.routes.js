import express from 'express';
import {
  reconcile,
  getReport,
  getSummary,
  getUnmatched
} from '../controllers/reconciliation.controller.js';

const router = express.Router();

router.post('/reconcile', reconcile);
router.get('/report/:runId', getReport);
router.get('/report/:runId/summary', getSummary);
router.get('/report/:runId/unmatched', getUnmatched);

export default router;