import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    data: { title: 'Administración' },
    loadComponent: () => import('./features/admin/admin').then((m) => m.AdminComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding').then((m) => m.OnboardingComponent),
  },
  {
    path: '',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Panel de inicio' },
    loadComponent: () => import('./features/inicio/inicio').then((m) => m.InicioComponent),
  },
  {
    path: 'citas',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Agenda' },
    loadComponent: () => import('./features/citas/citas').then((m) => m.CitasComponent),
  },
  {
    path: 'recordatorios',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Recordatorios' },
    loadComponent: () =>
      import('./features/recordatorios/recordatorios').then((m) => m.RecordatoriosComponent),
  },
  {
    path: 'pacientes',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Pacientes' },
    loadChildren: () =>
      import('./features/pacientes/pacientes.routes').then((m) => m.pacientesRoutes),
  },
  {
    path: 'historia-clinica/:pacienteId',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Historia clínica' },
    loadComponent: () =>
      import('./features/historias-clinicas/historia-clinica').then(
        (m) => m.HistoriaClinicaCompletaComponent
      ),
  },
  {
    path: 'historial',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Historial' },
    loadComponent: () => import('./features/historial/historial').then((m) => m.HistorialComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Mi perfil' },
    loadComponent: () => import('./features/perfil/perfil').then((m) => m.PerfilComponent),
  },
  {
    path: 'configuracion/eps',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Configuración EPS' },
    loadComponent: () =>
      import('./features/configuracion-eps/configuracion-eps').then((m) => m.ConfiguracionEpsComponent),
  },
  {
    path: 'configuracion/consentimientos',
    canActivate: [authGuard, adminGuard],
    data: { title: 'Catálogo de consentimientos' },
    loadComponent: () =>
      import('./features/consentimientos/pages/catalogo-admin/catalogo-admin').then(
        (m) => m.CatalogoAdminComponent
      ),
  },
  {
    path: 'plantillas',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Plantillas' },
    loadComponent: () =>
      import('./features/plantillas/plantillas').then((m) => m.PlantillasComponent),
  },
  {
    path: 'tratamientos',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Tratamientos' },
    loadComponent: () =>
      import('./features/tratamientos/tratamientos').then((m) => m.TratamientosComponent),
  },
  {
    path: 'reportes',
    canActivate: [authGuard, onboardingGuard],
    data: { title: 'Reportes' },
    loadComponent: () => import('./features/reportes/reportes').then((m) => m.ReportesComponent),
  },
  { path: '**', redirectTo: '' },
];
