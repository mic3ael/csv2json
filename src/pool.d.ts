declare module 'Pool' {
  interface PoolOptions {
    size?: number;
    timeout?: number;
  }

  interface Instance {
    name: string;
    cancel: () => void;
    terminate: () => Promise<void>;
  }

  type CreateInstanceFunction = (releaseInstance: (instance: Instance) => Promise<void>) => Instance;

  class Pool {
    constructor(createInstance: CreateInstanceFunction, options?: PoolOptions);

    get size(): number;

    getInstance(): Promise<Instance | null>;

    cleanup(): Promise<void>;
  }

  export = Pool;
}

