import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// Uncomment for debugging OpenTelemetry issues
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (otlpEndpoint) {
  console.log(`OpenTelemetry: Exporting to ${otlpEndpoint}`);

  const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || "frontend",
    traceExporter: new OTLPTraceExporter({
      url: otlpEndpoint,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: otlpEndpoint,
      }),
      exportIntervalMillis: 10000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable fs instrumentation to reduce noise
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  sdk.start();

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk.shutdown().then(
      () => console.log("OpenTelemetry: SDK shut down successfully"),
      (err) => console.log("OpenTelemetry: Error shutting down SDK", err)
    );
  });
} else {
  console.log("OpenTelemetry: OTEL_EXPORTER_OTLP_ENDPOINT not set, skipping instrumentation");
}
