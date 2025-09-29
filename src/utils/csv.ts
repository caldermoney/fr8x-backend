export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map(r => headers.map(h => esc((r as any)[h])).join(","));
  return [headers.join(","), ...lines].join("\n");
}

export function parseCSV(text: string) {
  const [header, ...lines] = text.trim().split(/\r?\n/);
  if (!header) return [];
  const cols = header.split(",");
  return lines
    .filter(Boolean)
    .map(line => {
      // simple split (we control our CSV writer → no embedded commas)
      const vals = line.split(",");
      const obj: Record<string, string> = {};
      cols.forEach((c, i) => (obj[c] = (vals[i] ?? "").replace(/^"|"$/g, "")));
      return obj;
    });
}
