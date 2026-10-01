import { Component, ChangeDetectionStrategy } from '@angular/core';
import { injectSpacetimeDB } from 'spacetimedb/angular';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected conn = injectSpacetimeDB();
}
