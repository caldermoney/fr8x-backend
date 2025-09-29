import { Router } from "express";
import { getHistory } from "../services/priceService.ts";
import { toCSV } from "../utils/csv.ts";

export const historyRoute = Router();

historyRoute.get(["/history", "/history.csv"], async (req, res) => {
  const route = (req.query.route as string) || "FREIGHT_SH-LA";
  const from  = req.query.from as string | undefined;
  const to    = req.query.to as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const format =
    (req.query.format as string) ||
    (req.path.endsWith(".csv") ? "csv" : "json");

  const rows = await getHistory({ route, from, to, limit });

  if (format === "csv") {
    const csv = toCSV(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'inline; filename="history.csv"');
    return res.send(csv);
  }
  res.json({ route, count: rows.length, rows });
});
