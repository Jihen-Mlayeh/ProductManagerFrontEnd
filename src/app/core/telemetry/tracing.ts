import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

export function initTelemetry() {
  const provider = new WebTracerProvider();

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

  console.log('✅ OpenTelemetry initialized (basic instrumentation)');
  console.log('📊 HTTP requests will be traced automatically');
  
  return provider;
}