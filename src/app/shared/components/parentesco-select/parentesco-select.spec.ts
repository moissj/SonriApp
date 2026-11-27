import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ParentescoSelectComponent } from './parentesco-select';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ParentescoSelectComponent],
  template: `<app-parentesco-select id="t" [formControl]="ctrl" />`,
})
class HostComponent {
  readonly ctrl = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}

describe('ParentescoSelectComponent (CVA)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function elegir(value: string): void {
    const el: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    el.value = value;
    el.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function especificar(value: string): void {
    const el: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('elegir una opción estándar llena el control', () => {
    elegir('Madre');
    expect(host.ctrl.value).toBe('Madre');
    expect(host.ctrl.valid).toBe(true);
  });

  it('elegir "Otro" y especificar deja el control válido con el texto libre', () => {
    elegir('Otro');
    expect(fixture.nativeElement.querySelector('input[type="text"]')).toBeTruthy();
    especificar('Primo');
    expect(host.ctrl.value).toBe('Primo');
    expect(host.ctrl.valid).toBe(true);
  });

  // Regresión: el <select> debe mostrar la opción del modelo, no quedarse en la primera ("Madre").
  it('el select refleja el valor del modelo (edición), no la primera opción', () => {
    host.ctrl.setValue('Padre');
    fixture.detectChanges();
    const sel: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    expect(sel.value).toBe('Padre');
  });

  it('un valor personalizado selecciona "Otro" y muestra el texto en edición', () => {
    host.ctrl.setValue('amigo');
    fixture.detectChanges();
    const sel: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    expect(sel.value).toBe('Otro');
    expect(input.value).toBe('amigo');
  });
});
