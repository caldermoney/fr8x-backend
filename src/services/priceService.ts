import fs from "node:fs/promises";
import path from "node:path";
import { parseCSV } from "../utils/csv.ts";

export type FreightIndex = {
  route: string;
  asOf: string;
  currency: "USD";
  unit: "per_40FT";
  value: number;
};

const LATEST_PATH = path.resolve("data/latest.json");
const HISTORY_PATH = path.resolve("data/history.csv");

/**
 * Return the latest index row for a given route.
 * Reads from data/latest.json; if missing or invalid, falls back to default.
 */
export async function getLatestIndex(route = "FREIGHT_SH-LA"): Promise<FreightIndex> {
  try {
    const raw = await fs.readFile(LATEST_PATH, "utf8");
    const j = JSON.parse(raw) as Partial<FreightIndex>;
    if (
      typeof j.value === "number" &&
      typeof j.asOf === "string" &&
      j.currency === "USD" &&
      j.unit === "per_40FT"
    ) {
      return {
        route,
        asOf: j.asOf,
        currency: "USD",
        unit: "per_40FT",
        value: j.value,
      };
    }
    throw new Error("Invalid schema in latest.json");
  } catch {
    // fallback so API doesn’t break
    const today = new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )).toISOString();

    return {
      route,
      asOf: today,
      currency: "USD",
      unit: "per_40FT",
      value: 2000,
    };
  }
}

export type HistoryQuery = {
  route?: string;
  from?: string;   // ISO date (inclusive)
  to?: string;     // ISO date (exclusive)
  limit?: number;  // default 30
};

/**
 * Query the historical index values for a route.
 * Applies optional from/to/limit filters. Newest first.
 */
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
  } catch {
    rows = [];
  }

  // filter
  rows = rows.filter(r => r.route === route);
  if (q.from) rows = rows.filter(r => r.asOf >= q.from!);
  if (q.to)   rows = rows.filter(r => r.asOf <  q.to!);

  // newest first, then apply limit
  rows.sort((a, b) => (a.asOf < b.asOf ? 1 : -1));
  return rows.slice(0, limit);
}
