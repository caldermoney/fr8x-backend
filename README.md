Minimal API for the **FR8X Freight Index** (USD **per 40ft container / FEU**).  
Exposes current index snapshot in JSON and CSV and includes a daily update scaffold.

## Quick Start
```bash
pnpm i
pnpm dev
# → Backend http://localhost:3001

Unit: All rates are quoted as **USD per 40ft container (FEU)**.
Positions: Trading layer supports **decimal quantities** (e.g., 0.1, 0.5, 2.75 contracts)
to scale exposure without TEU/FEU conversion assumptions.
Endpoints:
- GET /index        → latest snapshot (JSON)
- GET /index.csv    → latest snapshot (CSV)
