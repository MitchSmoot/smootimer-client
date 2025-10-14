import { Component, inject } from '@angular/core';
import { EventService } from '../timer/event.service';
import { TimerService } from '../timer/timer.service';
import { PuzzleService } from '../timer/puzzle.service';

@Component({
  selector: 'app-event-selector',
  imports: [],
  templateUrl: './event-selector.html',
  styleUrl: './event-selector.scss'
})
export class EventSelector {
  eventService = inject(EventService);
  puzzleService = inject(PuzzleService);
  timerService = inject(TimerService);

  puzzleClicked (puzzle: any) {
    this.puzzleService.changePuzzle(puzzle);
    this.eventService.changeEvent(puzzle.events[0]);
    this.timerService.getTimes();
  }

  eventClicked(event: any) {
    this.eventService.changeEvent(event);
    this.timerService.getTimes();
  }
}
