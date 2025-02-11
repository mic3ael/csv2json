declare module 'Thread' {
  class Thread {
    constructor(i: number, params: Record<string, unknown>, releaseInstance: (thread: Thread) => Promise<void>);

    get name(): number;

    do(strs: string[]): Promise<unknown[]>;

    terminate(): Promise<number>;

    cancel(): void;
  }

  type ReleaseInstanceFunction = (thread: Thread) => Promise<void>;
  type CreateThreadFunction = (releaseInstance: ReleaseInstanceFunction) => Thread;

  function threadFactory(params: Record<string, unknown>): CreateThreadFunction;

  export { Thread, threadFactory };
}

