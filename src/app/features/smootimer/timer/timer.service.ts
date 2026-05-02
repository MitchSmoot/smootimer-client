import { EventService } from './event.service';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Solve } from '../../../core/models/solve';
import { injectSpacetimeDB, injectTable, injectReducer } from 'spacetimedb/angular';
import { tables, reducers } from '../../../../module_bindings';




@Injectable({
  providedIn: 'root'
})
export class TimerService {
  eventService = inject(EventService)
  protected conn = injectSpacetimeDB(); 
  private addSolveReducer = injectReducer(reducers.addSolve);
  private deleteSolveReducer = injectReducer(reducers.deleteSolve)
  solveTable = injectTable(tables.solve);
  solves = computed(() => {
    return this.solveTable().rows.map(r => ({
      ...r,
      solvedAt: r.solvedAt.toDate()
    }))

  })

  constructor() {
  }

  getTimes() {
    console.log('getTimes');
  }
 
  addSolve(solve: Solve) {
    // this.solves.update(list => [solve, ...list]);
    if (this.conn().isActive) {
      this.addSolveReducer({
        event: solve.event,
        time: solve.time,
        penalty: 'none',
        scramble: undefined,
        comment: undefined
      });
    }
  }

  addSolves(solves: Solve[]) {
    // for (const solve of solves) {
    //   solve.id = crypto.randomUUID();
    // }
    // this.solves.update(list => [...list, ...solves]);
    // this.solves.update(list => list.sort((a, b) => a.solveDate.getTime() - b.solveDate.getTime()));
  }

  deleteSolve(s: bigint) {
    this.deleteSolveReducer({solveId: s})
    // this.solves.update(list => list.filter(s => s.id !== id));
  }

  updateSolve(solve: Solve) {
    // this.solves.update(list => list.map(s => s.id === solve.id ? solve : s));
  }

  // generateSolves() {
  //   const events = this.eventService.events;
  //   const amountToGenerate = 100;
  //   events.forEach(e => {
  //     for (let i = 0; i < amountToGenerate; i++) {
  //       const time = Math.floor(Math.random() * 6000) + (( amountToGenerate - i) * 100 + 8000);
  //       const date = new Date();
  //       date.setDate(date.getDate() - (( amountToGenerate - i) * 3));
  //       this.addSolve({ event: e.title, time, solvedAt: date });
  //     }

  //   });
  // }
}
