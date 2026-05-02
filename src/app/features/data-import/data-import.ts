import { Solve } from '../../core/models/solve';
import { TimerService } from './../smootimer/timer/timer.service';
import { inject, Injectable } from '@angular/core';

type CsTimerSolve = [
  [penalty: number, time: number],
  scramble: string,
  comment: string,
  date: number
]

type CsTimerExport = {
  [key: string]: CsTimerSolve[] | { [key: string]: any };
}

@Injectable({
  providedIn: 'root'
})
export class DataImport {
  timerService = inject(TimerService);

  importFromCsTimer(data: any): void {
    const solves: Solve[] = [];
    for (const sessionKey in data) {
      if (sessionKey.startsWith('session')) {
        const session = data[sessionKey] as CsTimerSolve[];
        for (const csSolve of session) {
          const time = csSolve[0][1];
          const penalty = this.convertCSTimerPenalty(csSolve[0][0]);
          const scramble = csSolve[1];
          const comment = csSolve[2];
          const solvedAt = csSolve[3] ? new Date(csSolve[3] * 1000) : new Date();
          const event = '333';
          solves.push({ penalty, time, scramble, comment, solvedAt, event });
        }
      }
    }
    console.log(solves);
    this.timerService.addSolves(solves);
  }

  convertCSTimerPenalty(p: number) {
    if (p = 2000) {
      return '+2'
    }
    return ''
  }
}
