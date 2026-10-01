import { Component, ChangeDetectionStrategy } from '@angular/core';

/** A person with a check mark. Takes its colour from `color` / `currentColor`. */
@Component({
  selector: 'svg[app-friend-icon]',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <circle cx="9" cy="8" r="4" />
      <path d="M1 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
      <path
        d="M16 10.5l2.2 2.2 4.3-4.6"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `,
})
export class FriendIcon {}
