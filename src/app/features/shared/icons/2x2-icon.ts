import { Component } from "@angular/core";

@Component({
  selector: 'svg[app-2x2-icon]',
  template: `
  <svg
    viewBox="0 0 300 300"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:svg="http://www.w3.org/2000/svg">
    <rect
      width="120"
      height="120"
      x="10"
      y="10"
      ry="10" />
    <rect
      width="120"
      height="120"
      x="170"
      y="10"
      ry="10" />
    <rect
      width="120"
      height="120"
      x="10"
      y="170"
      ry="10" />
    <rect
      width="120"
      height="120"
      x="170"
      y="170"
      ry="10" />
  </svg>
  `
})
export class TwoByTwoIcon {}