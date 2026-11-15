import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

export const loggerProvider =
  token && host
    ? new LoggerProvider({
        resource: resourceFromAttributes({ "service.name": "davit-grdzelishvili-blog" }),
        processors: [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: `${host.replace(/\/$/, "")}/i/v1/logs`,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }),
          }),
        ],
      })
    : null;

export const posthogLogger = loggerProvider?.getLogger("posthog-exporter");

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (!loggerProvider || !posthogLogger) {
    if (process.env.NODE_ENV !== "production") {
      const variable = token ? "NEXT_PUBLIC_POSTHOG_HOST" : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";
      console.warn(
        `${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`,
      );
    }
    return;
  }

  posthogLogger.emit({
    body: "PostHog log exporter started",
    severityNumber: SeverityNumber.INFO,
    attributes: { lifecycle_phase: "startup" },
  });

  const nodeProcess = (globalThis as typeof globalThis & { process: NodeJS.Process }).process;
  nodeProcess.once("beforeExit", () => {
    posthogLogger.emit({
      body: "PostHog log exporter stopping",
      severityNumber: SeverityNumber.INFO,
      attributes: { lifecycle_phase: "shutdown" },
    });
    void loggerProvider.forceFlush().catch(() => {});
  });
}
