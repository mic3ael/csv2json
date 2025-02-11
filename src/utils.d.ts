declare module 'utils' {
  import { Pool } from './pool';
  function normalizeHeader(str: string, separator: string): string[];

  interface Aggregator {
    exec(line: string): Promise<string[] | null>;
    flush(): Promise<string[]>;
  }

  function aggregator(pool: Pool, bufferSize: number): Aggregator;

  export { normalizeHeader, aggregator };
}

