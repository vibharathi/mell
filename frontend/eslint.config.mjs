import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable unescaped entities rule for apostrophes and quotes
      "react/no-unescaped-entities": "off",
      
      // Disable exhaustive deps warning for useEffect
      "react-hooks/exhaustive-deps": "off",
      
      // Disable unused variables warning
      "@typescript-eslint/no-unused-vars": "off",
      
      // Disable explicit any type error
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
