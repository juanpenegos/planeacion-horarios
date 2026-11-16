import { Routes } from '@angular/router';
import { ParametrosPage } from './ui/pages/parametros-page/parametros-page';
import { PlanDeEstudiosPage } from './ui/pages/plan-de-estudios-page/plan-de-estudios-page';
import { PlaneacionPage } from './ui/pages/planeacion-page/planeacion-page';
import { SeccionesPage } from './ui/pages/secciones-page/secciones-page';

export const routes: Routes = [
  { path: 'planeacion', component: PlaneacionPage, title: 'Planeación' },
  { path: 'plan-de-estudios', component: PlanDeEstudiosPage, title: 'Plan de estudios' },
  { path: 'secciones', component: SeccionesPage, title: 'Secciones' },
  { path: 'parametros', component: ParametrosPage, title: 'Parámetros' },
  { path: '', pathMatch: 'full', redirectTo: 'planeacion' },
  { path: '**', redirectTo: 'planeacion' },
];
