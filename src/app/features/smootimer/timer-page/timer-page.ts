import { Component, inject } from '@angular/core';
import { Timer } from "../timer/timer";
import { SolveList } from "../solve-list/solve-list";
import { EventSelector } from "../event-selector/event-selector";
import { TimerChart } from "../timer-chart/timer-chart";
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-timer-page',
  imports: [Timer, SolveList, EventSelector, TimerChart],
  templateUrl: './timer-page.html',
  styleUrl: './timer-page.scss'
})
export class TimerPage {
  auth = inject(AuthService);
}
