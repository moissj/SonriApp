import { Routes } from '@angular/router';

export const citasRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./citas').then((m) => m.CitasComponent),
  },
];
