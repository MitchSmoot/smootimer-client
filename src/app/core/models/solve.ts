export interface Solve {
    id?: bigint;
    event: string;
    time: number;
    solvedAt: Date;
    penalty?: string;
    scramble?: string;
    comment?: string;
}