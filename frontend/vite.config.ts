import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  optimizeDeps: {
    include: [
      "@opentelemetry/sdk-trace-web",
      "@opentelemetry/sdk-trace-base",
      "@opentelemetry/exporter-trace-otlp-proto",
      "@opentelemetry/context-zone",
      "@opentelemetry/instrumentation",
      "@opentelemetry/instrumentation-document-load",
      "@opentelemetry/instrumentation-fetch",
      "@opentelemetry/instrumentation-user-interaction",
      "@opentelemetry/resources",
      "@opentelemetry/semantic-conventions",
    ],
  },
});
