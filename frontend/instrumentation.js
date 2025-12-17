import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { useAzureMonitor } from "@azure/monitor-opentelemetry";

// Uncomment for debugging OpenTelemetry issues
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const appInsightsConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

// Azure Monitor for production (when App Insights connection string is available)
if (appInsightsConnectionString) {
  console.log("OpenTelemetry: Using Azure Monitor (Application Insights)");
  
  useAzureMonitor({
    azureMonitorExporterOptions: {
      connectionString: appInsightsConnectionString,
    },
    instrumentationOptions: {
      // Disable fs instrumentation to reduce noise
      fs: { enabled: false },
    },
  });
}

// OTLP exporter for local development (Aspire Dashboard)
if (otlpEndpoint) {
  console.log(`OpenTelemetry: Exporting to OTLP endpoint ${otlpEndpoint}`);

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
}

if (!otlpEndpoint && !appInsightsConnectionString) {
  console.log("OpenTelemetry: No OTLP endpoint or App Insights connection string set, skipping instrumentation");
}
