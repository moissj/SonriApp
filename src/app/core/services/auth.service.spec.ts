import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { supabase } from '../supabase.client';

describe('AuthService', () => {
  let service: AuthService;
  const navigate = vi.fn();
  const single = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    navigate.mockReset();
    single.mockReset();

    // Espiar el cliente real (permitido; no es un mock de módulo relativo)
    vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({ data: { session: null } } as any);
    vi.spyOn(supabase.auth, 'onAuthStateChange').mockReturnValue({
      data: { subscription: { unsubscribe() {} } },
    } as any);
    vi.spyOn(supabase.auth, 'signInWithPassword');
    vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null } as any);
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: () => ({ eq: () => ({ single }) }),
    } as any);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate } }],
    });
    service = TestBed.inject(AuthService);
  });

  it('login exitoso: guarda el rol y navega al dashboard', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    single.mockResolvedValue({
      data: { rol: 'odontologo', estado_cuenta: 'activo', fecha_vencimiento_plan: null },
      error: null,
    });

    await service.login('doc@correo.com', '123456');

    expect(service.rol()).toBe('odontologo');
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('login fallido: propaga el error de credenciales', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(service.login('doc@correo.com', 'mala')).rejects.toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('cuenta suspendida: cierra sesión y bloquea el acceso', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    single.mockResolvedValue({
      data: { rol: 'odontologo', estado_cuenta: 'suspendido', fecha_vencimiento_plan: null },
      error: null,
    });

    await expect(service.login('doc@correo.com', '123456')).rejects.toThrow(/suspendida/i);
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('plan vencido: cierra sesión y bloquea el acceso', async () => {
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
    single.mockResolvedValue({
      data: { rol: 'odontologo', estado_cuenta: 'activo', fecha_vencimiento_plan: '2000-01-01' },
      error: null,
    });

    await expect(service.login('doc@correo.com', '123456')).rejects.toThrow(/vencido/i);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
