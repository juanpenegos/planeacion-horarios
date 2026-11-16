import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Descargador } from '../../../data/descargador';
import { proveerDatos } from '../../../data/proveedores';
import {
  BLOQUE_IV,
  asignaturaPorNombre,
  bloqueIVCompleto,
} from '../../../domain/testing/escenario';
import { PlaneacionStore } from '../../../state/planeacion.store';
import { ParametrosPage } from '../parametros-page/parametros-page';
import { PlaneacionPage } from './planeacion-page';

interface Descarga {
  nombre: string;
  contenido: string;
  tipo: string;
}

function montar() {
  localStorage.clear();
  const descargas: Descarga[] = [];
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      ...proveerDatos(),
      {
        provide: Descargador,
        useValue: {
          descargar: (nombre: string, contenido: string, tipo: string) =>
            descargas.push({ nombre, contenido, tipo }),
        },
      },
    ],
  });
  const store = TestBed.inject(PlaneacionStore);
  store.crearBloque('IV');
  for (const nombre of BLOQUE_IV) store.crearSeccion(asignaturaPorNombre(nombre).id, 'IV-01');
  return { store, descargas };
}

function botonExportar(html: HTMLElement): HTMLButtonElement {
  return Array.from(html.querySelectorAll('button')).find((b) =>
    b.textContent?.includes('Exportar (CSV)'),
  ) as HTMLButtonElement;
}

describe('Exportar (HU-06 y ENF-05)', () => {
  it('no deja exportar el CSV mientras el bloque no esté listo para publicar', () => {
    const { store } = montar();
    const fixture = TestBed.createComponent(PlaneacionPage);
    fixture.detectChanges();
    expect(botonExportar(fixture.nativeElement).disabled).toBe(true);
    expect(store.exportarCsv()).toBeNull();
  });

  it('HU-06: el bloque Semestre IV listo para publicar exporta un CSV con 10 filas', () => {
    const { store, descargas } = montar();
    for (const s of bloqueIVCompleto().todasLasSesiones()) store.programar(s.id, s.franja!);
    const fixture = TestBed.createComponent(PlaneacionPage);
    fixture.detectChanges();

    botonExportar(fixture.nativeElement).click();
    expect(descargas.length).toBe(1);
    expect(descargas[0].nombre).toBe('oferta-semestre-IV-seccion-01.csv');
    expect(descargas[0].tipo).toContain('text/csv');
    const [encabezado, ...filas] = descargas[0].contenido.trimEnd().split('\r\n');
    expect(encabezado).toBe('Asignatura,Sección,Bloque,Día,Hora de inicio,Hora de fin');
    expect(filas.length).toBe(10);
  });

  it('ENF-05: exporta la planeación como JSON y la vuelve a importar', () => {
    const { store, descargas } = montar();
    store.programar(`${asignaturaPorNombre('Bases de datos 1').id}-01-s1`, {
      dia: 'martes',
      horaInicio: 9,
    });
    const fixture = TestBed.createComponent(ParametrosPage);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;

    (
      Array.from(html.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Exportar planeación'),
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();
    expect(descargas[0].nombre).toBe('planeacion.json');
    expect(html.textContent).toContain('Planeación exportada');

    store.eliminarBloque('IV-01');
    expect(store.planeacion().sesiones.length).toBe(0);

    fixture.componentInstance.importarJson(descargas[0].contenido);
    fixture.detectChanges();
    expect(store.planeacion().sesiones.length).toBe(10);
    expect(store.planeacion().sesiones[0].franja).toEqual({ dia: 'martes', horaInicio: 9 });
    expect(html.textContent).toContain('Planeación importada');
  });

  it('muestra el motivo si el archivo importado no es una planeación', () => {
    montar();
    const fixture = TestBed.createComponent(ParametrosPage);
    fixture.componentInstance.importarJson('{"hola": 1}');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'El archivo no contiene una planeación válida',
    );
  });
});
