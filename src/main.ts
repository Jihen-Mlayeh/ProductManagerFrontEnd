import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { initTelemetry } from './app/core/telemetry/tracing';


// ✅ Initialiser OpenTelemetry AVANT Angular
initTelemetry();

platformBrowserDynamic().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true
})
  .catch(err => console.error(err));