import { Injectable, signal, WritableSignal } from '@angular/core';
import { Event } from '../../../core/models/event';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  events: Event[] = [
    { title: '2x2',             official: true,  puzzleType: '3x3',      scrambler: '2x2',  icon: 'app-2x2-icon'  },
    { title: '3x3',             official: true,  puzzleType: '3x3',      scrambler: '3x3',  icon: 'app-3x3-icon'  },
    { title: '4x4',             official: true,  puzzleType: '4x4',      scrambler: '4x4',  icon: 'app-4x4-icon'  },
    { title: '5x5',             official: true,  puzzleType: '5x5',      scrambler: '5x5',  icon: 'app-5x5-icon'  },
    { title: 'Pyraminx',        official: true,  puzzleType: 'Pyraminx', scrambler: 'pyra', icon: 'app-pyraminx-icon' },
    { title: 'Megaminx',        official: true,  puzzleType: 'Megaminx', scrambler: 'mega', icon: 'app-megaminx-icon' },
    { title: 'Square-1',        official: true,  puzzleType: 'Square-1', scrambler: 'sq1',  icon: 'app-square1-icon' },
    { title: 'Skewb',           official: true,  puzzleType: 'Skewb',    scrambler: 'Skewb', icon: 'app-skewb-icon' },
    { title: '6x6',             official: true,  puzzleType: '6x6',      scrambler: '6x6',  icon: 'app-6x6-icon'  },
    { title: '7x7',             official: true,  puzzleType: '7x7',      scrambler: '7x7',  icon: 'app-7x7-icon'  },
    { title: '3x3 One-handed',  official: true,  puzzleType: '3x3',      scrambler: '3x3',  icon: 'app-3x3-one-handed-icon' },
    { title: '5x5 Blindfolded', official: true,  puzzleType: '5x5',      scrambler: '5x5',  icon: 'app-5x5-blindfolded-icon' },
    { title: '3x3 with feet',   official: false, puzzleType: '3x3',      scrambler: '3x3',  icon: 'app-3x3-with-feet-icon' },
    { title: '4x4 Blindfolded', official: true,  puzzleType: '4x4',      scrambler: '4x4',  icon: 'app-4x4-blindfolded-icon' },
    { title: '3x3 Blindfolded', official: true,  puzzleType: '3x3',      scrambler: '3x3',  icon: 'app-3x3-blindfolded-icon' },
    { title: 'PLL Time Attack', official: false, puzzleType: '3x3',      scrambler: 'none' }
  ];

  currentEvent: WritableSignal<Event> = signal(this.events[1]);

  constructor() { }

  changeEvent(event: Event) {
    this.currentEvent.set(event);
  }
}
