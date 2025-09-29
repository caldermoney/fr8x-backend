import { Router } from "express";
import { getHistory } from "../services/priceService.ts";
import { toCSV } from "../utils/csv.ts";

export const historyRoute = Router();

const VALID_FORMATS = new Set(["json", "csv"]);
const DEF_ROUTE = "FREIGHT_SH-LA";

historyRoute.get(["/history", "/history.csv"], async (req, res) => {
  try {
    const route =
      typeof req.query.route === "string" && req.query.route.trim()
        ? (req.query.route as string)
        : DEF_ROUTE;

    const from =
      typeof req.query.from === "string" && req.query.from.trim()
        ? (req.query.from as string)
        : undefined;

    const to =
      typeof req.query.to === "string" && req.query.to.trim()
        ? (req.query.to as string)
        : undefined;

    let limit: number | undefined = undefined;
    if (typeof req.query.limit === "string") {
      const n = Number(req.query.limit);
      if (Number.isFinite(n) && n > 0) {
        limit = Math.min(n, 3650);
      }
    }

    const fmtFromQuery =
      typeof req.query.format === "string" ? req.query.format.toLowerCase() : undefined;
    const inferred = req.path.endsWith(".csv") ? "csv" : "json";
    const fmt = fmtFromQuery || inferred;
    const format = VALID_FORMATS.has(fmt) ? fmt : "json";

    const rows = await getHistory({ route, from, to, limit });

    // modest caching
    res.setHeader("Cache-Control", "public, max-age=60");

    if (format === "csv") {
      const csv = toCSV(rows);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'inline; filename="history.csv"');
      return res.send(csv);
    }

    return res.json({
      route,
      from: from ?? null,
      to: to ?? null,
      limit: limit ?? 30,
      count: rows.length,
      rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
