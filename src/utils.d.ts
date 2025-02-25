declare module 'csv2json/src/utils' {
  function normalizeHeader(str: string, seperator: string): string[];

  interface Aggregator {
    exec(line: string): Promise<string[] | null>;
    flush(): Promise<string[]>;
  }

  function aggregator(pool: any, bufferSize: number): Aggregator;

  export {
    normalizeHeader,
    aggregator
  };
}

