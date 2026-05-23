# Transaction Reconciliation Engine
## 1. Overview
This project implements a production-grade transaction reconciliation engine that ingests messy CSV data from two sources (user and exchange), normalizes it, matches transactions using configurable tolerances, and generates a structured reconciliation report.

It is designed to handle real-world inconsistencies such as timestamp drift, quantity mismatches, and type/asset variations.
## 2. Features
- CSV ingestion with validation
- Data normalization (asset/type mapping)
- Tolerance-based matching engine
- Conflict detection with reasoning
- REST APIs for reconciliation and reporting
- MongoDB-backed storage
## 3. Architecture
Ingestion → Normalization → Matching Engine → Report Generation → API Layer
## 4. Setup Instructions
### Setup
```
1. Clone repo
2. Install dependencies
   npm install

3. Configure environment variables
   MONGO_URI=your_mongo_uri

4. Start server
   npm run dev
```
## 5. API Endpoints
```
POST /api/reconcile
GET /api/report/:runId
GET /api/report/:runId/summary
GET /api/report/:runId/unmatched
```
## 6. Sample Output
{
  "MATCHED": 22,
  "CONFLICT": 1,
  "UNMATCHED_USER": 2,
  "UNMATCHED_EXCHANGE": 3
}
## 7. Key Design Decisions (THIS IS CRITICAL)
- Used normalization layer to handle inconsistent data formats
- Implemented tolerance-based matching for real-world robustness
- Designed one-to-one matching to avoid duplicate pairing
- Stored raw + normalized data for traceability
## 8. Assumptions
- One-to-one transaction matching
- Partial fills not handled (future scope)
- Timestamp normalized to UTC
## 9. Future Improvements
- File upload support
- Partial transaction matching
- Real-time streaming reconciliation
- Improved conflict scoring