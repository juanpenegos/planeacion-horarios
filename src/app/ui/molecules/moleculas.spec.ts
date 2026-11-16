import { TestBed } from '@angular/core/testing';
import { Incumplimiento } from '../../domain/models';
import { VistaDeSesion } from '../vista-de-sesion';
import { FilaAviso } from './fila-aviso/fila-aviso';
import { SelectorBloque } from './selector-bloque/selector-bloque';
import { TarjetaSesion } from './tarjeta-sesion/tarjeta-sesion';

const SESION: VistaDeSesion = {
  id: 'A1-01-s1',
  asignatura: 'Modelización informacional',
  seccion: '01',
  numero: 1,
  total: 2,
  franja: 'jueves 14:00–16:00',
  ubicacion: { dia: 'jueves', horaInicio: 14 },
  estado: 'restriccion',
};

describe('Moléculas', () => {
  it('la tarjeta de sesión muestra asignatura, sección, número y estado con texto', () => {
    const fixture = TestBed.createComponent(TarjetaSesion);
    fixture.componentRef.setInput('sesion', SESION);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.classList).toContain('restriccion');
    expect(html.textContent).toContain('Modelización informacional');
    expect(html.textContent).toContain('Sección 01 · sesión 1 de 2');
    expect(html.textContent).toContain('✖ Restricción incumplida');
    expect(html.getAttribute('title')).toContain('jueves 14:00–16:00');
  });

  it('la fila de aviso muestra la severidad y el mensaje del incumplimiento', () => {
    const aviso: Incumplimiento = {
      reglaId: 'RN-05',
      tipo: 'restriccion',
      sesionIds: [],
      mensaje: 'RN-05 (restricción): Modelización informacional y Infraestructura TI 1',
    };
    const fixture = TestBed.createComponent(FilaAviso);
    fixture.componentRef.setInput('incumplimiento', aviso);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.classList).toContain('restriccion');
    expect(html.textContent).toContain('✖ Restricción');
    expect(html.textContent).toContain('Infraestructura TI 1');
  });

  it('el selector de bloque lista las opciones y actualiza la selección', () => {
    const fixture = TestBed.createComponent(SelectorBloque);
    fixture.componentRef.setInput('opciones', [
      { id: 'IV-01', nombre: 'Semestre IV – sección 01' },
      { id: 'VI-01', nombre: 'Semestre VI – sección 01' },
    ]);
    fixture.componentRef.setInput('seleccionado', 'IV-01');
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    expect(Array.from(select.options).map((o) => o.textContent?.trim())).toEqual([
      'Semestre IV – sección 01',
      'Semestre VI – sección 01',
    ]);
    select.value = 'VI-01';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.seleccionado()).toBe('VI-01');
  });
});
