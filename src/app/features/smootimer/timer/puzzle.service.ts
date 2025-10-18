import { Injectable } from "@angular/core";
import { Puzzle } from "../../../core/models/puzzle";
import { Solve } from "../../../core/models/solve";




@Injectable({
  providedIn: 'root'
})
export class PuzzleService{
  puzzles: Puzzle[] = [
    {title: '2x2', events: [
      { title: '2x2',             official: true,  puzzleType: '3x3',      scrambler: '2x2'  },
    ]},
    {title: '3x3', events: [
      { title: '3x3',             official: true,  puzzleType: '3x3',      scrambler: '3x3'  },
      { title: '3x3 Blindfolded', official: true,  puzzleType: '3x3',      scrambler: '3x3'  },
      { title: '3x3 One-handed',  official: true,  puzzleType: '3x3',      scrambler: '3x3'  },
      { title: '3x3 with feet',   official: false, puzzleType: '3x3',      scrambler: '3x3'  },
      { title: 'PLL Time Attack', official: false, puzzleType: '3x3',      scrambler: 'none' }
    ]},
    {title: '4x4', events: [
      { title: '4x4',             official: true,  puzzleType: '4x4',      scrambler: '4x4'  },
      { title: '4x4 Blindfolded', official: true,  puzzleType: '4x4',      scrambler: '4x4'  },
    ]},
    {title: '5x5', events: [
      { title: '5x5',             official: true,  puzzleType: '5x5',      scrambler: '5x5'  },
      { title: '5x5 Blindfolded', official: true,  puzzleType: '5x5',      scrambler: '5x5'  },
    ]},
    {title: 'Pyraminx', events: [
      { title: 'Pyraminx',        official: true,  puzzleType: 'Pyraminx', scrambler: 'pyra' },
    ]},
    {title: 'Megaminx', events: [
      { title: 'Megaminx',        official: true,  puzzleType: 'Megaminx', scrambler: 'mega' },
    ]},
    {title: 'Square-1', events: [
      { title: 'Square-1',        official: true,  puzzleType: 'Square-1', scrambler: 'sq1'  },
    ]},
    {title: 'Skewb', events: [
      { title: 'Skewb',           official: true,  puzzleType: 'Skewb',    scrambler: 'Skewb'},
    ]},
    {title: '6x6', events: [
      { title: '6x6',             official: true,  puzzleType: '6x6',      scrambler: '6x6'  },
    ]},
    {title: '7x7', events: [
      { title: '7x7',             official: true,  puzzleType: '7x7',      scrambler: '7x7'  },
    ]}
  ];

  currentPuzzle: Puzzle = this.puzzles[1];

  changePuzzle(puzzle: Puzzle) {
    this.currentPuzzle = puzzle;
  }
}