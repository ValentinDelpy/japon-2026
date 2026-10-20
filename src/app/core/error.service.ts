import { ErrorHandler, Injectable, inject, signal } from '@angular/core';

/** Filet de sécurité : expose la dernière erreur applicative à l'interface. */
@Injectable({ providedIn: 'root' })
export class ErrorReporter {
  private readonly _message = signal<string | null>(null);
  readonly message = this._message.asReadonly();

  report(error: unknown): void {
    const text = error instanceof Error ? error.message : String(error);
    this._message.set(text || 'Une erreur est survenue.');
  }

  clear(): void { this._message.set(null); }
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly reporter = inject(ErrorReporter);

  handleError(error: unknown): void {
    console.error(error);
    this.reporter.report(error);
  }
}
