import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** L'ensemble du site nécessite une session authentifiée. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.canUseBackend) return true;
  await auth.waitReady();
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

/** Le panneau d'administration nécessite le rôle administrateur. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.waitReady();
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  return auth.isAdmin() ? true : router.createUrlTree(['/dashboard']);
};
