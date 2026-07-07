import * as Sentry from "@sentry/react";

const DSN = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SENTRY_DSN : undefined;

export function initSentry() {
  if (!DSN || import.meta.env?.DEV) return;
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env?.MODE || "production",
    tracesSampleRate: 0.1,
    beforeSend(event) {
      return redactEvent(event);
    },
  });
}

function redactEvent(event) {
  if (event.request?.headers) {
    delete event.request.headers.cookie;
    delete event.request.headers.authorization;
  }
  if (event.extra?.question) delete event.extra.question;
  return event;
}

export function captureError(error, context = {}) {
  if (!DSN) {
    console.error("sentry:", error, context);
    return;
  }
  Sentry.captureException(error, { extra: redactContext(context) });
}

function redactContext(ctx) {
  const safe = { ...ctx };
  delete safe.question;
  delete safe.credential;
  delete safe.token;
  return safe;
}

export { Sentry };
