import { z } from "zod";

export const LANGUAGES = ["en", "pt", "es", "zh"];
export const RESULT_ID = /^[a-z0-9]{6,16}$/i;

const profileSchema = z.object({
  name: z.string().max(80).optional(),
  situation: z.string().max(200).optional(),
  values: z.array(z.string().max(40)).max(3).optional(),
}).optional();

const decisionContextSchema = z.object({
  decisionCategory: z.string().max(60).optional().default(""),
  emotionalWeight: z.string().max(60).optional().default(""),
  mainFear: z.string().max(200).optional().default(""),
}).optional();

export const councilBodySchema = z.object({
  question: z.string().trim().min(1).max(500),
  profile: profileSchema,
  language: z.enum(LANGUAGES).optional(),
  decisionContext: decisionContextSchema,
});

export const authBodySchema = z.object({
  credential: z.string().min(20),
});

export const ttsBodySchema = z.object({
  text: z.string().trim().min(1).max(2000),
  persona: z.enum([
    "founder", "billionaire", "artist", "athlete", "monk",
    "scientist", "explorer", "romantic", "shadow",
  ]).optional(),
});

export const profilePatchSchema = z.object({
  situation: z.string().max(200).optional(),
  values: z.array(z.string().max(40)).max(3).optional(),
  picture: z.union([z.string().startsWith("data:image/").max(300_000), z.null()]).optional(),
  dismissLifeMode: z.boolean().optional(),
  recordDebate: z.object({
    id: z.string().max(20),
    question: z.string().max(300),
    verdict: z.string().max(500).optional(),
    mood: z.string().max(40).optional(),
    unanimousVote: z.enum(["yes", "no"]).optional(),
  }).optional(),
}).strict();

export function parseBody(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const detail = result.error.issues.map(i => i.path.join(".") || "body").join(", ");
    return { ok: false, detail: `validation failed: ${detail}` };
  }
  return { ok: true, data: result.data };
}

export function parseResultId(raw) {
  const id = String(raw || "").replace(/[^a-z0-9]/gi, "");
  if (!id || !RESULT_ID.test(id)) return null;
  return id;
}
