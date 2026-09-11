import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { adminGuard, authGuard } from './admin.guard';
import { AuthService } from './auth.service';

function setup(auth: unknown, router: unknown): void {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: auth },
      { provide: Router, useValue: router },
    ],
  });
}
const ok = (extra: object = {}) => ({ waitReady: () => Promise.resolve(), canUseBackend: true, ...extra });

describe('authGuard', () => {
  it('autorise un utilisateur connecté', async () => {
    setup(ok({ isAuthenticated: () => true }), {});
    expect(await TestBed.runInInjectionContext(() => authGuard({} as never, {} as never))).toBeTrue();
  });

  it('redirige vers /login si non connecté', async () => {
    const tree = {} as UrlTree;
    const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(tree) };
    setup(ok({ isAuthenticated: () => false }), router);
    expect(await TestBed.runInInjectionContext(() => authGuard({} as never, {} as never))).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});

describe('adminGuard', () => {
  it('autorise un administrateur', async () => {
    setup(ok({ isAuthenticated: () => true, isAdmin: () => true }), {});
    expect(await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never))).toBeTrue();
  });

  it('renvoie un membre non admin vers /dashboard', async () => {
    const tree = {} as UrlTree;
    const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(tree) };
    setup(ok({ isAuthenticated: () => true, isAdmin: () => false }), router);
    expect(await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never))).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('renvoie un visiteur non connecté vers /login', async () => {
    const tree = {} as UrlTree;
    const router = { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue(tree) };
    setup(ok({ isAuthenticated: () => false, isAdmin: () => false }), router);
    expect(await TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never))).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
