import { EventService } from './event.service';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Solve } from '../../../core/models/solve';
import { injectSpacetimeDB, injectTable, injectReducer } from 'spacetimedb/angular';
import { tables, reducers } from '../../../../module_bindings';
import { TickerService } from '../../ticker/ticker.service';




const GUEST_SOLVES_KEY = 'cubetown.guest-solves';

/** bigint ids and Dates aren't JSON-safe, so they are stored as a string and an ISO date. */
function loadGuestSolves(): Solve[] {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_SOLVES_KEY) ?? '[]');
    return raw.map((r: any) => ({ ...r, id: BigInt(r.id), solvedAt: new Date(r.solvedAt) }));
  } catch {
    return [];
  }
}

function saveGuestSolves(solves: Solve[]): void {
  try {
    localStorage.setItem(
      GUEST_SOLVES_KEY,
      JSON.stringify(solves.map(s => ({ ...s, id: s.id?.toString(), solvedAt: s.solvedAt.toISOString() })))
    );
  } catch (err) {
    console.warn('Could not save guest solves:', err);
  }
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  eventService = inject(EventService)
  private auth = inject(AuthService);
  private tickerService = inject(TickerService);
  protected conn = injectSpacetimeDB(); 
  private addSolveReducer = injectReducer(reducers.addSolve);
  private deleteSolveReducer = injectReducer(reducers.deleteSolve)
  solveTable = injectTable(tables.solve);

  // Guests can still use the timer. The server only stores solves for logged-in users,
  // so guest solves live in this browser's localStorage and are never uploaded.
  private guestSolves = signal<Solve[]>(loadGuestSolves());
  private nextGuestSolveId =
    this.guestSolves().reduce((max, s) => (s.id !== undefined && s.id >= max ? s.id + 1n : max), 1n);

  private updateGuestSolves(fn: (list: Solve[]) => Solve[]) {
    const next = fn(this.guestSolves());
    this.guestSolves.set(next);
    saveGuestSolves(next);
  }

  /** The current user's solves (or this session's solves when browsing as a guest). */
  solves = computed<Solve[]>(() => {
    if (!this.auth.isAuthenticated) {
      return this.guestSolves();
    }
    // The solve table is public so profiles can read it, but the timer only shows the user's own.
    const identity = this.auth.identity();
    if (!identity) {
      return [];
    }
    return this.solveTable().rows
      .filter(r => r.owner.isEqual(identity))
      .map(r => ({
        ...r,
        solvedAt: r.solvedAt.toDate()
      }));
  })

  constructor() {
  }

  getTimes() {
    console.log('getTimes');
  }
 
  addSolve(solve: Solve) {
    if (!this.auth.isAuthenticated) {
      this.updateGuestSolves(list => [...list, { ...solve, id: this.nextGuestSolveId++, penalty: 'none' }]);
      return;
    }
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
    if (!this.auth.isAuthenticated) {
      this.updateGuestSolves(list => list.filter(solve => solve.id !== s));
      return;
    }
    this.deleteSolveReducer({solveId : s})
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
