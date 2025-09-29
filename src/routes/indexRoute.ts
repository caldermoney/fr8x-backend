import { Router } from "express";
import { getLatestIndex } from "../services/priceService.ts";
import { toCSV } from "../utils/csv.ts";

export const indexRoute = Router();

const VALID_FORMATS = new Set(["json", "csv"]);
const DEF_ROUTE = "FREIGHT_SH-LA";

indexRoute.get(["/index", "/index.csv"], async (req, res) => {
  try {
    const route =
      typeof req.query.route === "string" && req.query.route.trim()
        ? (req.query.route as string)
        : DEF_ROUTE;

    const fmtFromQuery =
      typeof req.query.format === "string" ? req.query.format.toLowerCase() : undefined;
    const inferred = req.path.endsWith(".csv") ? "csv" : "json";
    const fmt = fmtFromQuery || inferred;
    const format = VALID_FORMATS.has(fmt) ? fmt : "json";

    const latest = await getLatestIndex(route);

    // small caching to keep infra cheap
    res.setHeader("Cache-Control", "public, max-age=60");

    if (format === "csv") {
      const csv = toCSV([latest]);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'inline; filename="index.csv"');
      return res.send(csv);
    }

    return res.json(latest);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
