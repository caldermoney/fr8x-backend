import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;

type IndexSnapshot = {
  route: string;
  asOf: string;            // ISO
  currency: "USD";
  unit: "per_40FT";        // canonical: FEU (40ft)
  value: number;           // price per 40ft container
  version?: string;
};

const dataDir = path.join(process.cwd(), "data");
const jsonPath = path.join(dataDir, "index-latest.json");

// Health
app.get("/", (_req, res) => res.send("fr8x-backend ok"));

// Latest index (JSON)
app.get("/index", (_req, res) => {
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const payload: IndexSnapshot = JSON.parse(raw);
    res.json({ ...payload, version: payload.version ?? "1.2-feu" });
  } catch {
    res.status(500).json({ error: "index not available" });
  }
});

// Latest index (CSV)
app.get("/index.csv", (_req, res) => {
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const p: IndexSnapshot = JSON.parse(raw);
    const csv = `route,asOf,currency,unit,value\n${p.route},${p.asOf},${p.currency},${p.unit},${p.value}\n`;
    res.setHeader("Content-Type", "text/csv");
    res.send(csv);
  } catch {
    res.status(500).send("index not available");
  }
});

app.listen(PORT, () => {
  console.log(`Backend http://localhost:${PORT}`);
});
