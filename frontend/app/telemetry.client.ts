import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

let initialized = false;

/**
 * Parse OTEL headers string (format: "key=value,key2=value2") into a headers object
 */
function parseOtelHeaders(headersString: string | undefined): Record<string, string> {
  if (!headersString) {
    return {};
  }

  const headers: Record<string, string> = {};
  const pairs = headersString.split(",");

  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split("=");
    if (key && valueParts.length > 0) {
      headers[key.trim()] = valueParts.join("=").trim();
    }
  }

  return headers;
}

export function initTelemetry(
  otlpEndpoint: string | undefined,
  otlpHeaders: string | undefined
) {
  if (initialized || !otlpEndpoint) {
    if (!otlpEndpoint) {
      console.log("OpenTelemetry: No OTLP endpoint configured, skipping browser instrumentation");
    }
    return;
  }

  initialized = true;

  const headers = parseOtelHeaders(otlpHeaders);
  const traceUrl = `${otlpEndpoint}/v1/traces`;

  console.log(`OpenTelemetry: Initializing browser instrumentation`);
  console.log(`OpenTelemetry: Exporting to ${traceUrl}`);
  console.log(`OpenTelemetry: Headers configured: ${Object.keys(headers).join(", ") || "none"}`);

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "frontend-browser",
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: traceUrl,
          headers,
        })
      ),
    ],
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        // Propagate trace context to backend API calls
        propagateTraceHeaderCorsUrls: [/.*/],
        clearTimingResources: true,
      }),
      new UserInteractionInstrumentation({
        eventNames: ["click", "submit"],
      }),
    ],
  });

  console.log("OpenTelemetry: Browser instrumentation initialized");
}
