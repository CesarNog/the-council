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
  build: {
    rolldownOptions: {
      output: {
        // The single ~680 kB chunk re-downloaded on every deploy was mostly
        // vendor code that never changes between deploys. Splitting the heavy,
        // rarely-updated packages into their own chunks lets returning
        // visitors reuse them from HTTP cache (Vite content-hashes filenames)
        // and lets first-time visitors download them in parallel.
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: "observability", test: /node_modules[\\/](@sentry|posthog-js)[\\/]/, priority: 20 },
            { name: "clerk", test: /node_modules[\\/]@clerk[\\/]/, priority: 20 },
          ],
        },
      },
    },
  },
});
