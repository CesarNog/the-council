import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Public OAuth client ID — not a secret; safe to commit.
const GOOGLE_CLIENT_ID = "490082823324-lt2mg0fthak0k6p90e8h48f6h2ha86kl.apps.googleusercontent.com";

export default defineConfig({
  plugins: [react()],
  define: {
    // Overridable via VITE_GOOGLE_CLIENT_ID env var for local dev with a different project.
    "import.meta.env.VITE_GOOGLE_CLIENT_ID": JSON.stringify(
      process.env.VITE_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID
    ),
  },
});
