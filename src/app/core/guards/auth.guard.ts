import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Esperar a que termine la verificación de sesión inicial
  if (auth.isLoading()) {
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!auth.isLoading()) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  return auth.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};
