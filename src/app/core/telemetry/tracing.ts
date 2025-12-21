import { WebTracerProvider, BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

export function initTelemetry() {
  const provider = new WebTracerProvider();

  // ✅ Utiliser l'URL complète (le proxy Angular va intercepter)
  const exporter = new OTLPTraceExporter({
    url: 'http://localhost:4200/v1/traces',  // ← Via proxy Angular
    headers: {}
  });

  const spanProcessor = new BatchSpanProcessor(exporter);
  provider.addSpanProcessor(spanProcessor);

  provider.register({
    contextManager: new ZoneContextManager()
  });

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new UserInteractionInstrumentation({
        eventNames: ['click', 'submit', 'dblclick']
      }),
      new XMLHttpRequestInstrumentation({
        propagateTraceHeaderCorsUrls: [/localhost:8080/]
      }),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/localhost:8080/]
      })
    ]
  });

  console.log('✅ OpenTelemetry initialized with Jaeger exporter');
  console.log('📊 Traces will be sent to: http://localhost:4200/v1/traces (via proxy → localhost:4318)');
  console.log('🔍 View traces at: http://localhost:16686');
  
  return provider;
}