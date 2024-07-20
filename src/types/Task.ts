export interface Task {
    id: string;
    description: string;
    completed: TaskStatus;
    points: number;
}

export enum TaskStatus {
    Unclaimable = "UNCLAIMABLE",
    Claimable = "CLAIMABLE",
    Claimed = "CLAIMED",
}