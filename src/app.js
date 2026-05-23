import express from 'express';
import dotenv from 'dotenv';
import reconciliationRoutes from './routes/reconciliation.routes.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api', reconciliationRoutes);

app.get('/', (req, res) => {
  res.send('Reconciliation Engine Running');
});

export default app;