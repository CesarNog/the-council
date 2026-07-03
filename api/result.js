import { kvGet } from "./_kv.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });
  const id = (req.query.id || "").replace(/[^a-z0-9]/gi, "");
  if (!id) return res.status(400).json({ error: "invalid id" });

  try {
    const raw = await kvGet(`result:${id}`);
    if (!raw) return res.status(404).json({ error: "not_found" });
    res.setHeader("Cache-Control", "public, max-age=3600, immutable"); // resultado e imutavel uma vez gerado
    return res.status(200).json({ id, ...JSON.parse(raw) });
  } catch (e) {
    console.error("result: kv read failed", e.message);
    return res.status(502).json({ error: "store_unavailable" });
  }
}
