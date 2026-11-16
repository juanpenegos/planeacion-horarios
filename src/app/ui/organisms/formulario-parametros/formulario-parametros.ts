import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import {
  DIAS,
  Dia,
  Intervalo,
  NOMBRE_DIA,
  PARAMETROS_POR_DEFECTO,
  Parametros,
} from '../../../domain/models';
import { ValidadorDeParametros } from '../../../domain/services/validador-de-parametros';
import { Boton } from '../../atoms/boton/boton';

/** Formulario para editar horario por día, bloque sin clases, duración y máximo (HU-02). */
@Component({
  selector: 'app-formulario-parametros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Boton],
  templateUrl: './formulario-parametros.html',
  styleUrl: './formulario-parametros.css',
})
export class FormularioParametros {
  readonly parametros = input.required<Parametros>();
  readonly guardar = output<Parametros>();

  readonly dias = DIAS;
  readonly nombreDia = NOMBRE_DIA;
  private readonly validador = new ValidadorDeParametros();

  /** Copia que se edita; solo se aplica al guardar. */
  readonly borrador = linkedSignal(() => this.parametros());
  readonly errores = computed(() => this.validador.errores(this.borrador()));
  readonly hayCambios = computed(
    () => JSON.stringify(this.borrador()) !== JSON.stringify(this.parametros()),
  );

  cambiarDia(dia: Dia, campo: keyof Intervalo, valor: string): void {
    this.borrador.update((p) => ({
      ...p,
      horarioHabilitado: {
        ...p.horarioHabilitado,
        [dia]: { ...p.horarioHabilitado[dia], [campo]: Number(valor) },
      },
    }));
  }

  cambiarBloqueSinClases(campo: keyof Intervalo, valor: string): void {
    this.borrador.update((p) => ({
      ...p,
      bloqueSinClases: { ...p.bloqueSinClases, [campo]: Number(valor) },
    }));
  }

  cambiarNumero(campo: 'duracionSesionHoras' | 'maximoSesionesSemana', valor: string): void {
    this.borrador.update((p) => ({ ...p, [campo]: Number(valor) }));
  }

  restablecer(): void {
    this.borrador.set(PARAMETROS_POR_DEFECTO);
  }

  enviar(evento: Event): void {
    evento.preventDefault();
    if (this.errores().length === 0) this.guardar.emit(this.borrador());
  }
}
