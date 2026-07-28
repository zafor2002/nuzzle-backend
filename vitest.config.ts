import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    // Unit tests read NEXT_PUBLIC_SUPABASE_URL to check the media URL prefix.
    setupFiles: ["tests/unit/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
