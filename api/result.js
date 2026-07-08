import { kvGet } from "./_kv.js";
import { methodNotAllowed, safeError } from "./_http.js";
import { parseResultId } from "./_validate.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  const id = parseResultId(req.query.id);
  if (!id) return res.status(400).json({ error: "invalid_request", detail: "invalid id" });

  try {
    const raw = await kvGet(`result:${id}`);
    if (!raw) return res.status(404).json({ error: "not_found" });
    res.setHeader("Cache-Control", "public, max-age=3600, immutable"); // resultado e imutavel uma vez gerado
    return res.status(200).json({ id, ...JSON.parse(raw) });
  } catch (e) {
    console.error("result: kv read failed", e.message);
    return safeError(res, 502, "store_unavailable", e.message);
  }
}
