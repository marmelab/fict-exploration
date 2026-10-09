import js from "@eslint/js";
import fict from "@fictjs/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  // Keeps the TypeScript parser from the config above and adds JSX support,
  // plus Fict's lint rules. None of them report the strict-guarantee errors
  // (FICT-R002, FICT-R005, FICT-H): only the compiler does.
  fict.configs.recommended,
  {
    rules: {
      // The rule counts any arrow function returning JSX as a nested
      // component, so every `.map()` list callback trips it. The compiler
      // itself never reports FICT-C003 for this code.
      "fict/no-nested-components": "off",
    },
  },
);
