import { Event, EventService } from './event.service';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';

export interface Solve {
    id?: string;
    event: string;
    time: number;
    solveDate: Date;
    penalty?: number;
    scramble?: string;
    comment?: string;
}


@Injectable({
  providedIn: 'root'
})
export class TimerService {
  eventService = inject(EventService)

  solves: WritableSignal<Solve[]> = signal<Solve[]>([]);
  constructor() {
    if (this.solves().length === 0) {
      this.generateSolves();
    }
  }

  getTimes() {
    console.log('getTimes');
  }
 
  addSolve(solve: Solve) {
    solve.id = crypto.randomUUID();
    this.solves.update(list => [solve, ...list]);
  }

  addSolves(solves: Solve[]) {
    for (const solve of solves) {
      solve.id = crypto.randomUUID();
    }
    this.solves.update(list => [...list, ...solves]);
    this.solves.update(list => list.sort((a, b) => a.solveDate.getTime() - b.solveDate.getTime()));
  }

  deleteSolve(id: string) {
    this.solves.update(list => list.filter(s => s.id !== id));
  }

  updateSolve(solve: Solve) {
    this.solves.update(list => list.map(s => s.id === solve.id ? solve : s));
  }

  generateSolves() {
    const events = this.eventService.events;
    const amountToGenerate = 100;
    events.forEach(e => {
      for (let i = 0; i < amountToGenerate; i++) {
        const time = Math.floor(Math.random() * 6000) + (( amountToGenerate - i) * 100 + 8000);
        const date = new Date();
        date.setDate(date.getDate() - (( amountToGenerate - i) * 3));
        this.addSolve({ event: e.title, time, solveDate: date });
      }

    });
  }
}
