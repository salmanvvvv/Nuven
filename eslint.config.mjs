import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored Claude Code skills (third-party, not part of the site).
    ".claude/**",
    // Motion-graphics project (separate Vite + HyperFrames app with its own config).
    "motion/**",
    // Informative video (HyperFrames project, plain HTML + scripts).
    "nuven-informativo/**",
  ]),
]);

export default eslintConfig;
