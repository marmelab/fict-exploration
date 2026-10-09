import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  // `vapor: true` compiles every <script setup> SFC in Vapor mode, so this app
  // ships no virtual DOM. Each SFC also carries its own `vapor` marker, which
  // is what makes `vue-tsc` type them as Vapor components.
  plugins: [vue({ features: { vapor: true } })],
});
