import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protège /admin. En mode démo (Supabase non configuré), l'accès reste ouvert. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.canUseBackend) return true;
  return auth.isAuthenticated() ? true : router.createUrlTree(['/admin/login']);
};
