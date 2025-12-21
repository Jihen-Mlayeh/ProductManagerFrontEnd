import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TelemetryService } from '../services/telemetry.service';

@Injectable()
export class TelemetryInterceptor implements HttpInterceptor {
  constructor(private telemetry: TelemetryService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const span = this.telemetry.startSpan(`HTTP ${req.method} ${req.url}`, {
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.urlWithParams
    });

    const startTime = Date.now();

    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const duration = Date.now() - startTime;
          
          span.setAttribute('http.status_code', event.status);
          span.setAttribute('http.response_content_length', 
            event.body ? JSON.stringify(event.body).length : 0);
          span.setAttribute('http.duration_ms', duration);
          
          span.addEvent('response_received', {
            status: event.status,
            duration_ms: duration
          });
          
          span.end();
        }
      }),
      catchError(error => {
        span.setAttribute('http.status_code', error.status || 0);
        this.telemetry.recordError(span, error);
        span.end();
        throw error;
      })
    );
  }
}