import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Encabezado } from './ui/organisms/encabezado/encabezado';

@Component({
  imports: [RouterOutlet, Encabezado],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
