# Resend Setup

Optional transactional email.

## Env vars

```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=The Council <hello@yourdomain.com>
```

Domain must be verified in Resend dashboard.

## Triggers

- Welcome email on first Clerk sign-in (`api/clerk-auth.js` → `sendWelcomeEmail`)
- Failures logged only — never block auth UX

## Templates

HTML in `api/_email.js`. Future: React Email components for weekly digest.
