import { ApplicationInsights } from "@microsoft/applicationinsights-web";

let appInsights: ApplicationInsights | null = null;

export function initAppInsightsTelemetry(connectionString: string) {
  if (appInsights) {
    return; // Already initialized
  }

  console.log("Application Insights: Initializing browser instrumentation");

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      disableFetchTracking: false,
      disableAjaxTracking: false,
    },
  });

  appInsights.loadAppInsights();
  appInsights.trackPageView();

  console.log("Application Insights: Browser instrumentation initialized");
}

export function getAppInsights() {
  return appInsights;
}
