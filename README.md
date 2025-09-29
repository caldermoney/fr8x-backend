# fr8x-backend

Backend service for the **fr8x Freight Index** MVP.  
Exposes `/index` and `/history` endpoints with mock freight rate data.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
pnpm install
2. Run in dev mode
bash
Copy code
pnpm dev
The API will listen at http://localhost:3001.

3. Update the index (daily job)
bash
Copy code
pnpm run update:index
Options:

pnpm run update:index → append a new value (random walk around $2000).

pnpm run update:index:force → force re-write for today.

pnpm run update:index:manual → set a manual value, e.g. value=2100.

All data is stored in data/ (ignored by git).

4. Smoke test
bash
Copy code
pnpm run smoke
This will:

Check /health

Fetch /index (JSON)

Fetch /index.csv

Fetch last 5 rows from /history

📡 API
GET /health → service status

GET /index → latest index (JSON or CSV)

GET /history → historical values (filters: route, from, to, limit, format)

For full details, see openapi.yaml.

🛠 Tech
Express

TypeScript

pnpm

tsx for fast dev

📂 Project Structure
bash
Copy code
src/
  app.ts              # express app
  index.ts            # entrypoint
  routes/             # API routes
  services/           # business logic
  utils/              # helpers (CSV)

scripts/
  update-index.ts     # daily updater

data/                 # generated index + history (gitignored)