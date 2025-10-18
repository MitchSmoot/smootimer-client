export interface Solve {
    id?: string;
    event: string;
    time: number;
    solveDate: Date;
    penalty?: number;
    scramble?: string;
    comment?: string;
}