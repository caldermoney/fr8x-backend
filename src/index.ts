import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true, service: "fr8x-backend" }));

app.listen(PORT, () => console.log(`Backend http://localhost:${PORT}`));
