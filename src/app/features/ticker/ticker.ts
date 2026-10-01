import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TickerService } from './ticker.service';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.html',
  styleUrl: './ticker.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Ticker {
  ticker = inject(TickerService);
}
