import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts", "db.ts", "preview.ts", "logger.ts", "util.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: "../dist",
  shims: true,
  splitting: false,
});
