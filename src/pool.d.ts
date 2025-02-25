declare module 'csv2json/src/pool' {
  interface PoolOptions {
    size?: number;
    timeout?: number;
  }

  class Pool {
    constructor(createInstance: (releaseInstance: (instance: any) => Promise<void>) => any, options?: PoolOptions);
    size: number;
    getInstance(): Promise<any>;
    cleanup(): Promise<void>;
  }

  export = Pool;
}

