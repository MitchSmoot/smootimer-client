/** The subset of a solve needed to work out records. */
export interface RecordSolve {
  event: string;
  time: number;
  penalty: string;
  solvedAt: Date;
}

export interface EventRecord {
  event: string;
  solveCount: number;
  /** Best single in ms (penalties applied), or null if every solve is a DNF. */
  bestSingle: number | null;
  /** Best average of 5 (WCA style: best and worst dropped) in ms, or null if there is none yet. */
  bestAo5: number | null;
}

/** Solve time in ms with its penalty applied; null for a DNF. */
export function effectiveTime(solve: Pick<RecordSolve, 'time' | 'penalty'>): number | null {
  switch (solve.penalty) {
    case 'dnf':
      return null;
    case '+2':
      return solve.time + 2000;
    default:
      return solve.time;
  }
}

/** WCA average of 5: drop the best and worst, mean of the rest. Two or more DNFs make it a DNF. */
function averageOfFive(times: (number | null)[]): number | null {
  const dnfCount = times.filter((t) => t === null).length;
  if (dnfCount >= 2) return null;

  const sorted = times
    .map((t) => t ?? Infinity)
    .sort((a, b) => a - b)
    .slice(1, 4);
  return Math.round(sorted.reduce((sum, t) => sum + t, 0) / 3);
}

function bestAverageOfFive(times: (number | null)[]): number | null {
  let best: number | null = null;
  for (let i = 0; i + 5 <= times.length; i++) {
    const average = averageOfFive(times.slice(i, i + 5));
    if (average !== null && (best === null || average < best)) best = average;
  }
  return best;
}

/**
 * One record row per event the user has solved, in the order given by `eventOrder`
 * (events not listed there come last, alphabetically).
 */
export function computeEventRecords(solves: RecordSolve[], eventOrder: string[]): EventRecord[] {
  const byEvent = new Map<string, RecordSolve[]>();
  for (const solve of solves) {
    const list = byEvent.get(solve.event);
    if (list) list.push(solve);
    else byEvent.set(solve.event, [solve]);
  }

  const rank = (event: string) => {
    const index = eventOrder.indexOf(event);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  return [...byEvent.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([event, eventSolves]) => {
      const times = [...eventSolves]
        .sort((a, b) => a.solvedAt.getTime() - b.solvedAt.getTime())
        .map(effectiveTime);
      const valid = times.filter((t): t is number => t !== null);

      return {
        event,
        solveCount: eventSolves.length,
        bestSingle: valid.length ? Math.min(...valid) : null,
        bestAo5: bestAverageOfFive(times),
      };
    });
}
