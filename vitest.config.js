import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./vitest.setup.js"],
    exclude: ["**/node_modules/**", "e2e/**"],
  },
});
