import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNav } from "./features/shared/main-nav/main-nav";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainNav],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('CubeTown');
}
