import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'svg[app-5x5-icon]',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <svg
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg"
    >
      <rect width="80" height="80" x="10" y="10" ry="10" />
      <rect width="80" height="80" x="110" y="10" ry="10" />
      <rect width="80" height="80" x="210" y="10" ry="10" />
      <rect width="80" height="80" x="10" y="110" ry="10" />
      <rect width="80" height="80" x="110" y="110" ry="10" />
      <rect width="80" height="80" x="210" y="110" ry="10" />
      <rect width="80" height="80" x="10" y="210" ry="10" />
      <rect width="80" height="80" x="110" y="210" ry="10" />
      <rect width="80" height="80" x="210" y="210" ry="10" />
    </svg>
  `,
})
export class FiveByFiveIcon {}
