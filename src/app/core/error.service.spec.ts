import { TestBed } from '@angular/core/testing';
import { ErrorReporter, GlobalErrorHandler } from './error.service';

describe('ErrorReporter / GlobalErrorHandler', () => {
  let reporter: ErrorReporter;
  let handler: GlobalErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ErrorReporter, GlobalErrorHandler] });
    reporter = TestBed.inject(ErrorReporter);
    handler = TestBed.inject(GlobalErrorHandler);
  });

  it('partage le message avec le reporter puis le nettoie', () => {
    spyOn(console, 'error');
    handler.handleError(new Error('boom'));
    expect(reporter.message()).toBe('boom');
    reporter.clear();
    expect(reporter.message()).toBeNull();
  });

  it('convertit une valeur non-Error en texte', () => {
    spyOn(console, 'error');
    handler.handleError('oops');
    expect(reporter.message()).toBe('oops');
  });
});
