import { Component, ChangeDetectionStrategy } from '@angular/core';

/** A bell. Takes its colour from `color` / `currentColor`. */
@Component({
  selector: 'svg[app-notification-icon]',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path
        d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6.5V11c0-3.1-1.6-5.6-4.5-6.3V4a2.5 2.5 0 0 0-5 0v.7C6.6 5.4 5 7.9 5 11v4.5l-2 2V19h18v-1.5z"
      />
    </svg>
  `,
})
export class NotificationIcon {}
