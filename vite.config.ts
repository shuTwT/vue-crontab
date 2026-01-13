import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
    }),
  ],
  server: {
    port: 12345,
    open: false,
  },
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/lib.ts"),
      name: "VueCrontab",
    },
    rollupOptions: {
      external: ["vue","cron-parser"],
      output: {
        globals: {
          vue: "Vue",
          "cron-parser": "CronParser",
        },
      },
    },
  },
});
