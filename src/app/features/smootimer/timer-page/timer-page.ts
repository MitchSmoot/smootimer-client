import { Component, DestroyRef, effect, inject, untracked, ChangeDetectionStrategy } from '@angular/core';
import { Timer } from '../timer/timer';
import { SolveList } from '../solve-list/solve-list';
import { EventSelector } from '../event-selector/event-selector';
import { TimerChart } from '../timer-chart/timer-chart';
import { AuthService } from '../../auth/auth.service';
import { EventService } from '../timer/event.service';
import { FriendsService } from '../../users/friends.service';

@Component({
  selector: 'app-timer-page',
  imports: [Timer, SolveList, EventSelector, TimerChart],
  templateUrl: './timer-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './timer-page.scss',
})
export class TimerPage {
  auth = inject(AuthService);
  private eventService = inject(EventService);
  private friends = inject(FriendsService);

  constructor() {
    // While this page is open, friends can see which event is selected. Re-runs when the
    // event changes and once the connection comes up (e.g. a reload straight onto /timer).
    effect(() => {
      const event = this.eventService.currentEvent().title;
      if (!this.friends.connected()) return;
      untracked(() => this.friends.setPracticeEvent(event));
    });

    // Leaving the page clears it. (Closing the tab is handled server-side on disconnect.)
    inject(DestroyRef).onDestroy(() => this.friends.setPracticeEvent(undefined));
  }
}
