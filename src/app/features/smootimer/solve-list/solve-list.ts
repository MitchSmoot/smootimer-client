import { Component, inject, Signal } from '@angular/core';
import { TimerService } from '../timer/timer.service';
import { TimeDisplayPipe } from "../../../core/time-display-pipe";
import { EventService } from '../timer/event.service';
import { computed } from '@angular/core';
import { Solve } from '../../../core/models/solve';

@Component({
  selector: 'app-solve-list',
  imports: [TimeDisplayPipe],
  templateUrl: './solve-list.html',
  styleUrl: './solve-list.scss'
})
export class SolveList {
  timerService = inject(TimerService);
  eventService = inject(EventService);
  solves = this.timerService.solves;
  ao5Offset = computed(() => this.timerService.solves().length % 5);

  ao12s = computed(() => {
    let ao12s: { average: number, best: Solve, worst: Solve }[] = [];
    const last12 = this.filteredSolves().slice(0, 12).sort((a, b) => a.time - b.time);
    const next12 = this.filteredSolves().slice(12, 24).sort((a, b) => a.time - b.time);
    if (last12.length < 12) {
      return null;
    }
    ao12s.push({ average:Math.round(last12.reduce((sum, solve) => sum + solve.time, 0) / 12), best: last12[0], worst: last12[last12.length - 1] });
    ao12s.push({ average:Math.round(next12.reduce((sum, solve) => sum + solve.time, 0) / 12), best: next12[0], worst: next12[next12.length - 1] });
    return ao12s;
  });

  ao5s = computed(() => {
    let ao5s : { average: number, best: Solve, worst: Solve }[] = [];
    let i = this.ao5Offset();
    const last30 = this.filteredSolves().slice(0, 30);
    while (i + 5 <= 30) {
      const current5 = last30.slice(i, i + 5).sort((a, b) => a.time - b.time);
      ao5s.push({ average: Math.round(current5.reduce((sum, solve) => sum + solve.time, 0) / 5), best: current5[0], worst: current5[current5.length - 1] });
      i+=5;
      console.log(i, ao5s);
    }
    return ao5s;
  })

  ao5inProgress = computed(() => {
    const offset = this.ao5Offset();
    if (offset === 0) {
      return null;
    }
    const rawSolves = this.filteredSolves().slice(0, offset);
    const currentSolves = rawSolves.slice(0, offset).sort((a, b) => a.time - b.time);
    return { average: Math.round(currentSolves.reduce((sum, solve) => sum + solve.time, 0) / offset), best: currentSolves[0], worst: currentSolves[currentSolves.length - 1], solves: rawSolves || [] };
  })

  filteredSolves: Signal<Solve[]> = computed(() => {
    const eventTitle = this.eventService.currentEvent().title;
    return this.solves().filter(solve => solve.event === eventTitle);
  });

  log(event: any) {
    console.log(event);
  }

  delete(id: any) {
    this.timerService.deleteSolve(id);
    console.log('deleted', id);
  }
}
