import fs from "node:fs/promises";
import path from "node:path";

type IndexRow = {
  route: string;
  asOf: string;      // ISO date
  currency: "USD";
  unit: "per_40FT";
  value: number;
};

const DATA_DIR = "data";
const LATEST_JSON = path.join(DATA_DIR, "latest.json");
const LATEST_CSV  = path.join(DATA_DIR, "index-latest.csv");
const HISTORY_CSV = path.join(DATA_DIR, "history.csv");

function todayISO(date = new Date()) {
  // snap to 00:00Z for consistency
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return d.toISOString();
}

async function readLatest(route: string): Promise<IndexRow | null> {
  try {
    const raw = await fs.readFile(LATEST_JSON, "utf8");
    const j = JSON.parse(raw) as IndexRow;
    return { ...j, route };
  } catch {
    return null;
  }
}

function nextValue(prev: number): number {
  // random walk ±1–3% with small bias to revert to ~$2000
  const drift = (2000 - prev) * 0.01;
  const shock = prev * (Math.random() * 0.03 - 0.015); // ±1.5%
  const val = Math.max(300, Math.round(prev + drift + shock));
  return val;
}

function parseArg(name: string): string | undefined {
  const p = process.argv.find(a => a.startsWith(name + "="));
  return p?.split("=")[1];
}

async function ensureFile(p: string, header: string) {
  try { await fs.access(p); } catch {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, header + "\n", "utf8");
  }
}

async function appendHistory(row: IndexRow) {
  await ensureFile(HISTORY_CSV, "route,asOf,currency,unit,value");
  // dedup: remove any existing row for route+asOf
  const csv = await fs.readFile(HISTORY_CSV, "utf8");
  const exists = csv.split("\n").some(line => line.startsWith(`${row.route},${row.asOf}`));
  if (!exists) {
    await fs.appendFile(HISTORY_CSV, `${row.route},${row.asOf},${row.currency},${row.unit},${row.value}\n`);
  }
}

async function writeLatestFiles(row: IndexRow) {
  await fs.writeFile(LATEST_JSON, JSON.stringify(row, null, 2) + "\n", "utf8");
  await fs.writeFile(
    LATEST_CSV,
    ["route,asOf,currency,unit,value", `${row.route},${row.asOf},${row.currency},${row.unit},${row.value}`].join("\n") + "\n",
    "utf8"
  );
}

async function main() {
  const route = parseArg("route") ?? "FREIGHT_SH-LA";
  const force = parseArg("force") === "true";
  const input = parseArg("value");
  const manualValue = input ? Number(input) : undefined;

  const latest = await readLatest(route);
  const iso = todayISO();

  // if not forcing and latest already has today's date, bail out
  if (!force && latest?.asOf === iso) {
    console.log(`No-op: ${route} already updated for ${iso}`);
    process.exit(0);
  }

  const prevVal = latest?.value ?? 2000;
  const value = Number.isFinite(manualValue) ? (manualValue as number) : nextValue(prevVal);

  const row: IndexRow = {
    route,
    asOf: iso,
    currency: "USD",
    unit: "per_40FT",
    value
  };

  await writeLatestFiles(row);
  await appendHistory(row);

  console.log("Updated:", row);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
