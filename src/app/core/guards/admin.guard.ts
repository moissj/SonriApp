import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protege las rutas /admin: solo accede el super_admin.
 * Un odontólogo que manipule la URL es redirigido a su dashboard.
 */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Esperar a que termine la verificación de sesión inicial (y carga del rol)
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

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  return auth.isSuperAdmin() ? true : router.createUrlTree(['/']);
};
