import { Router } from "express";
import { getLatestIndex } from "../services/priceService.ts";
import { toCSV } from "../utils/csv.ts";

export const indexRoute = Router();

indexRoute.get(["/index", "/index.csv"], async (req, res) => {
  const route = (req.query.route as string) || "FREIGHT_SH-LA";
  const format =
    (req.query.format as string) ||
    (req.path.endsWith(".csv") ? "csv" : "json");

  const latest = await getLatestIndex(route);

  if (format === "csv") {
    const csv = toCSV([latest]);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="index.csv"');
    return res.send(csv);
  }

  res.json(latest);
});
