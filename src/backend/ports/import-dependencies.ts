export interface ClockPort {
  now(): string;
}

export interface IdPort {
  next(): string;
}

export interface HashPort {
  digest(value: string): string;
}
