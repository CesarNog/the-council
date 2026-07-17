import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    // .github/skills is vendored third-party tooling, not app code — never lint it.
    // supabase/ is SQL only; dist/public are build output/static assets.
    ignores: ["dist/**", "node_modules/**", "public/**", "supabase/**", ".github/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2023 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      // only the stable, non-Compiler-oriented hooks rules — v7's "recommended" preset
      // bundles React Compiler readiness rules (set-state-in-effect, purity, immutability,
      // static-components, ...) that flag idiomatic, correct patterns across this codebase
      // and would require large speculative refactors with no behavioral bug behind them
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off", // several files intentionally export helpers alongside components
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }], // fail-soft catch {} is a deliberate, documented convention here
    },
  },
  {
    files: ["src/**/*.test.{js,jsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.es2023 } },
  },
  {
    files: ["api/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["vitest.setup.js"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // page.evaluate() callbacks run in the browser context, not Node —
    // they need `document`/`window`, not just the Playwright test globals.
    files: ["e2e/**/*.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["*.config.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: { ...globals.node } },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "module", globals: { ...globals.node } },
  },
];
