import { Transform } from 'stream';

interface TransformStreamOptions {
  seperator: string; // Delimiter for the data
  headers: string[]; // Array of headers
}

declare class TransformStream extends Transform {
  constructor(options: TransformStreamOptions);

  // Private methods (not exposed in TypeScript typings by default)
  private setupPoolAndAggregator(): void;
  private complete(
    result: any[],
    done: (error: Error | null, chunk?: any) => void,
    isLast?: boolean
  ): void;

  // Required Transform methods
  _transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void): void;
  _flush(callback: (error?: Error | null, data?: any) => void): void;
}

export = TransformStream;
