import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { importProvidersFrom } from '@angular/core';
import { LucideAngularModule, Plus, CircleUser, ChevronDown, ChevronRight, Settings, LogOut, Menu, MoreHorizontal, Lock, BarChart3, Bell, Building2, Calendar, CalendarDays, LayoutDashboard,Camera, Check, CheckCircle, ClipboardList, FilePen, FileText, Image, MessageCircle, PenLine, Receipt, Search, Stethoscope, User, Users, Wallet, AlertTriangle, Clock, X } from 'lucide-angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(
      LucideAngularModule.pick({ Plus, CircleUser, ChevronDown, ChevronRight, Settings, LogOut, Menu, MoreHorizontal, Lock, BarChart3, Bell, Building2, Calendar, CalendarDays, LayoutDashboard,Camera, Check, CheckCircle, ClipboardList, FilePen, FileText, Image, MessageCircle, PenLine, Receipt, Search, Stethoscope, User, Users, Wallet, AlertTriangle, Clock, X }),
    ),
    provideRouter(routes, withComponentInputBinding()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // Evita que PrimeNG cambie a modo oscuro según el sistema operativo.
          // La app usa tema claro fijo, así los componentes se mantienen coherentes.
          darkModeSelector: false,
          // PrimeNG se ubica en su propia capa CSS para que las utilidades
          // de Tailwind (sin capa) mantengan prioridad y no haya conflictos.
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
  ],
};
