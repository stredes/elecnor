import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/backend/domain/**/*.ts", "src/backend/application/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: ["next", "react", "@/dashboard/**", "../adapters/**"],
      }],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);
