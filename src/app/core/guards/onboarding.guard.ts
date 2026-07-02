import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';

/**
 * Redirige al onboarding si el perfil del odontólogo aún no configuró
 * sus horarios de atención (la cuenta y el nombre del consultorio los
 * crea el administrador; el onboarding solo completa la configuración).
 */
export const onboardingGuard: CanActivateFn = async () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  // Cargar perfil si no se ha cargado aún
  if (!profileService.profile()) {
    await profileService.loadProfile();
  }

  if (profileService.needsOnboarding) {
    return router.createUrlTree(['/onboarding']);
  }

  return true;
};
