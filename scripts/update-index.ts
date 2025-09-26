import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const jsonPath = path.join(dataDir, "index-latest.json");
const csvPath  = path.join(dataDir, "index-latest.csv");

type IndexSnapshot = {
  route: string;
  asOf: string;
  currency: "USD";
  unit: "per_40FT";   // FEU baseline
  value: number;      // per 40ft container
  version?: string;
};

function loadPrev(): IndexSnapshot | null {
  try { return JSON.parse(fs.readFileSync(jsonPath, "utf-8")); }
  catch { return null; }
}

// Small random walk; clamp to reasonable range for SH->LA FEU mock
function nextValue(prev?: number) {
  const base = prev ?? 2900;
  const change = Math.round((Math.random() - 0.5) * 50); // ±25
  return Math.min(6000, Math.max(1200, base + change));
}

const prev = loadPrev();
const snapshot: IndexSnapshot = {
  route: prev?.route ?? "FREIGHT_SH-LA",
  asOf: new Date().toISOString(),
  currency: "USD",
  unit: "per_40FT",
  value: nextValue(prev?.value),
  version: "1.2-feu"
};

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2));
const csvLine = `route,asOf,currency,unit,value\n${snapshot.route},${snapshot.asOf},${snapshot.currency},${snapshot.unit},${snapshot.value}\n`;
fs.writeFileSync(csvPath, csvLine);

console.log("Updated index (per 40ft):", snapshot);
