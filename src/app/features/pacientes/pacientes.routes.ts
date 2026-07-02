import { Routes } from '@angular/router';

export const pacientesRoutes: Routes = [
  {
    path: '',
    data: { title: 'Pacientes' },
    loadComponent: () => import('./pacientes.component').then((m) => m.PacientesComponent),
  },
  {
    path: 'nuevo',
    data: { title: 'Nuevo paciente' },
    loadComponent: () => import('./formulario/formulario').then((m) => m.PacienteFormComponent),
  },
  {
    path: ':id',
    data: { title: 'Detalle del paciente' },
    loadComponent: () => import('./detalle/detalle').then((m) => m.PacienteDetailComponent),
  },
  {
    path: ':id/editar',
    data: { title: 'Editar paciente' },
    loadComponent: () => import('./formulario/formulario').then((m) => m.PacienteFormComponent),
  },
];
