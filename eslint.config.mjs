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
  ]),
  {
    // React Three Fiber idiom: scenes mutate three.js objects (camera, meshes,
    // materials) inside useFrame callbacks by design. The compiler-oriented
    // immutability rule cannot model this; keep it as a warning here only.
    files: ["src/components/three/**"],
    rules: {
      "react-hooks/immutability": "warn",
    },
  },
]);

export default eslintConfig;
