import { Injectable } from '@angular/core';
import { trace, context, Span, SpanStatusCode } from '@opentelemetry/api';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private tracer = trace.getTracer('product-management-frontend');

  /**
   * Créer un span manuel pour tracer une opération
   */
  startSpan(name: string, attributes?: Record<string, any>): Span {
    const span = this.tracer.startSpan(name, {
      attributes: attributes || {}
    });
    return span;
  }

  /**
   * Exécuter une fonction dans un span
   */
  withSpan<T>(
    spanName: string, 
    fn: (span: Span) => T,
    attributes?: Record<string, any>
  ): T {
    const span = this.startSpan(spanName, attributes);
    
    try {
      const result = fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR,
        message: error.message 
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Ajouter un événement à un span
   */
  addEvent(span: Span, name: string, attributes?: Record<string, any>): void {
    span.addEvent(name, attributes);
  }

  /**
   * Marquer une erreur dans un span
   */
  recordError(span: Span, error: Error): void {
    span.recordException(error);
    span.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: error.message 
    });
  }
}