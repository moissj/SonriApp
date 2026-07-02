import { TestBed } from '@angular/core/testing';
import { WhatsappService } from './whatsapp.service';
import { AuthService } from './auth.service';
import { ProfileService } from './profile.service';
import { PlantillaService } from './plantilla.service';

// Se mockean las dependencias inyectadas (no se instancia el AuthService real,
// que tocaría Supabase). render/buildUrl/primerNombre son lógica pura.
describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WhatsappService,
        { provide: AuthService, useValue: { user: () => null } },
        { provide: ProfileService, useValue: { profile: () => null } },
        { provide: PlantillaService, useValue: {} },
      ],
    });
    service = TestBed.inject(WhatsappService);
  });

  describe('render (reemplazo de placeholders)', () => {
    it('reemplaza {nombre}, {fecha}, {hora} y {consultorio}', () => {
      const out = service.render('Hola {nombre}, tu cita es el {fecha} a las {hora} en {consultorio}.', {
        nombre: 'Ana',
        fecha: '8 de julio',
        hora: '10:00 a. m.',
        consultorio: 'Clínica Sonrisas',
      });
      expect(out).toBe('Hola Ana, tu cita es el 8 de julio a las 10:00 a. m. en Clínica Sonrisas.');
    });

    it('elimina placeholders sin valor y limpia espacios', () => {
      const out = service.render('Hola {nombre} {fecha}', { nombre: 'Ana' });
      expect(out).toBe('Hola Ana');
    });
  });

  describe('buildUrl (normalización a +57)', () => {
    it('antepone 57 a un número de 10 dígitos', () => {
      expect(service.buildUrl('3001234567', 'Hola')).toBe('https://wa.me/573001234567?text=Hola');
    });

    it('limpia caracteres no numéricos antes de normalizar', () => {
      expect(service.buildUrl('(300) 123-4567', 'Hola')).toBe('https://wa.me/573001234567?text=Hola');
    });

    it('no duplica el código si ya viene con 57', () => {
      expect(service.buildUrl('+57 300 123 4567', 'Hola')).toBe('https://wa.me/573001234567?text=Hola');
    });

    it('codifica el mensaje para la URL', () => {
      expect(service.buildUrl('3001234567', 'Hola mundo')).toBe(
        'https://wa.me/573001234567?text=Hola%20mundo'
      );
    });
  });

  describe('primerNombre', () => {
    it('extrae el primer nombre de un nombre completo', () => {
      expect(service.primerNombre('Ana María Gómez')).toBe('Ana');
      expect(service.primerNombre('')).toBe('');
    });
  });
});
