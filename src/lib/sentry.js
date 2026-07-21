const DSN = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SENTRY_DSN : undefined;

// Lazily imported so @sentry/react stays out of the first-paint bundle — it
// only downloads when a DSN is actually configured. Errors thrown before the
// module finishes loading fall back to console.error, same as the no-DSN path.
let _sentry = null;

export function initSentry() {
  if (!DSN || import.meta.env?.DEV) return;
  return import("@sentry/react")
    .then(Sentry => {
      _sentry = Sentry;
      Sentry.init({
        dsn: DSN,
        environment: import.meta.env?.MODE || "production",
        tracesSampleRate: 0.1,
        beforeSend(event) {
          return redactEvent(event);
        },
      });
    })
    .catch(e => console.error("sentry: failed to load", e));
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
  if (!DSN || !_sentry) {
    console.error("sentry:", error, context);
    return;
  }
  _sentry.captureException(error, { extra: redactContext(context) });
}

function redactContext(ctx) {
  const safe = { ...ctx };
  delete safe.question;
  delete safe.credential;
  delete safe.token;
  return safe;
}
