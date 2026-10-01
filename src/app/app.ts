import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNav } from './features/shared/main-nav/main-nav';
import { Ticker } from './features/ticker/ticker';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainNav, Ticker],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('CubeTown');
}
