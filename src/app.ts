import express from "express";
import cors from "cors";
import compression from "compression";
import { indexRoute } from "./routes/indexRoute.ts";
import { historyRoute } from "./routes/historyRoute.ts";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(compression());

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(indexRoute);
  app.use(historyRoute);

  return app;
}
