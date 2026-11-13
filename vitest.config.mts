import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    pool: "vmThreads",
    server: { deps: { inline: [/react/, /react-dom/, /@testing-library/] } },
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
    coverage: { provider: "v8", include: ["lib/**", "components/**"], exclude: ["lib/api/schema.d.ts"] },
  },
});
