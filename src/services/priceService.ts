import fs from "node:fs/promises";
import path from "node:path";

export type FreightIndex = {
  route: string;
  asOf: string;
  currency: "USD";
  unit: "per_40FT";
  value: number;
};

const LATEST_PATH = path.resolve("data/latest.json");
const HISTORY_PATH = path.resolve("data/history.csv");

export async function getLatestIndex(route = "FREIGHT_SH-LA"): Promise<FreightIndex> { /* existing */ }

export type HistoryQuery = {
  route?: string;
  from?: string;   // ISO date (inclusive)
  to?: string;     // ISO date (exclusive)
  limit?: number;  // default 30
};

import { parseCSV } from "../utils/csv.ts";

export async function getHistory(q: HistoryQuery = {}) {
  const route = q.route ?? "FREIGHT_SH-LA";
  const limit = q.limit && q.limit > 0 ? Math.min(q.limit, 3650) : 30;

  let rows: FreightIndex[] = [];
  try {
    const text = await fs.readFile(HISTORY_PATH, "utf8");
    const parsed = parseCSV(text);
    rows = parsed.map(r => ({
      route: r.route,
      asOf: r.asOf,
      currency: r.currency as "USD",
      unit: r.unit as "per_40FT",
      value: Number(r.value),
    }));
  } catch { rows = []; }

  // filter
  rows = rows.filter(r => r.route === route);
  if (q.from) rows = rows.filter(r => r.asOf >= q.from!);
  if (q.to)   rows = rows.filter(r => r.asOf <  q.to!);

  // newest first, then apply limit
  rows.sort((a, b) => (a.asOf < b.asOf ? 1 : -1));
  return rows.slice(0, limit);
}
