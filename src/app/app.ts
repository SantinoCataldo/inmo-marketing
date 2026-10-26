import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer, Navbar } from './components/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
