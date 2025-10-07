export type Address = `0x${string}`

export type PresaleStatus = {
  isActive: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  startTime: string;
  endTime: string;
  canClaim: boolean;
}

export type Indexable = {[key:string]: any}

export type GenericIndexable<T> = {[key: string]: T}