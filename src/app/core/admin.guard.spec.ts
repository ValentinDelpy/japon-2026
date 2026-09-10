import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  function run(auth: unknown, router: unknown): unknown {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }

  it('autorise un utilisateur authentifié', () => {
    expect(run({ isAuthenticated: () => true }, {})).toBeTrue();
  });

  it('redirige vers /admin/login sinon', () => {
    const tree = {} as UrlTree;
    const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(tree) };
    expect(run({ isAuthenticated: () => false }, router)).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/login']);
  });
});
