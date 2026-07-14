const MAX_BODY_BYTES = 512_000; // 500 KB — profile picture uploads

export function methodNotAllowed(res, allowed = "GET") {
  res.setHeader("Allow", allowed);
  return res.status(405).json({ error: "method_not_allowed" });
}

export function badRequest(res, detail = "invalid request") {
  return res.status(400).json({ error: "invalid_request", detail });
}

export function safeError(res, status, error, detail) {
  // detail NUNCA vai pro cliente: vazamento real observado em producao (upstream
  // error body com org ID) provou que gate por NODE_ENV nao e' confiavel em
  // runtime de function na Vercel. Cliente recebe o kind tipado; detail vai pro log.
  if (detail) console.error(`safeError ${status} ${error}:`, String(detail).slice(0, 500));
  return res.status(status).json({ error });
}

/** Reject oversized JSON bodies (Content-Length hint). */
export function bodyTooLarge(req, res) {
  const len = parseInt(req.headers["content-length"] || "0", 10);
  if (len > MAX_BODY_BYTES) {
    res.status(413).json({ error: "payload_too_large", detail: "request body exceeds limit" });
    return true;
  }
  return false;
}

export { MAX_BODY_BYTES };
