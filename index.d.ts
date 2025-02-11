declare module 'largeCsvJson' {
  import { Transform } from 'node:stream';

  interface InitOptions {
    headers?: string[];
    seperator?: string;
  }

  interface ParseActions {
    toFileStream: (outputPath: string) => Promise<void>;
    toFile: (outputPath: string) => Promise<void>;
    toJson: (callback: (item: Record<string, unknown>) => void) => Promise<void>;
    toJsonArray: () => Promise<Record<string, unknown>[]>;
  }

  interface InitResult {
    parse: (inputPath: string) => ParseActions;
    transform: () => Transform;
  }

  function init(options?: InitOptions): InitResult;

  export = init;
}

