declare module 'csv2json/src/thread' {
  interface ThreadParams {
    // Define the params used by the thread
  }

  class Thread {
    constructor(i: number, params: ThreadParams, releaseInstance: (instance: Thread) => Promise<void>);
    name: number;
    do(strs: string[]): Promise<any>;
    terminate(): Promise<void>;
    cancel(): void;
  }

  function threadFactory(params: ThreadParams): () => (releaseInstance: (instance: Thread) => Promise<void>) => Thread;

  export {
    Thread,
    threadFactory
  };
}
