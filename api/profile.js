import { kvPut } from "./_kv.js";
import { requireUser } from "./auth.js";

const MAX_PICTURE_BYTES = 300_000; // client-side resize deveria manter bem abaixo disso; isto e o teto duro

export default async function handler(req, res) {
  const auth = await requireUser(req, res);
  if (!auth) return; // requireUser ja escreveu a resposta 401

  if (req.method === "GET") {
    return res.status(200).json(auth.user);
  }

  if (req.method === "PATCH") {
    const { situation, values, picture } = req.body ?? {};
    const next = { ...auth.user };

    if (situation !== undefined) {
      if (typeof situation !== "string" || situation.length > 200) return res.status(400).json({ error: "invalid situation" });
      next.situation = situation.trim();
    }
    if (values !== undefined) {
      if (!Array.isArray(values) || values.length > 3 || values.some(v => typeof v !== "string")) {
        return res.status(400).json({ error: "invalid values" });
      }
      next.values = values;
    }
    if (picture !== undefined) {
      if (picture !== null) {
        if (typeof picture !== "string" || !picture.startsWith("data:image/") || picture.length > MAX_PICTURE_BYTES) {
          return res.status(400).json({ error: "invalid picture" });
        }
      }
      next.customPicture = picture;
    }

    await kvPut(`user:${auth.sub}`, JSON.stringify(next));
    return res.status(200).json(next);
  }

  return res.status(405).json({ error: "method not allowed" });
}
