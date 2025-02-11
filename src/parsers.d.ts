declare module 'parsers' {
  import { Readable, Writable } from 'node:stream';

  interface ParseOptions {
    inputPath: string;
    headers: string[];
    seperator: string;
  }

  type ParseCallback = (jsonArray: Record<string, unknown>[], readable: Readable) => void;

  function parse(options: ParseOptions, callback: ParseCallback): Promise<void>;

  type ToFileStreamFunction = (outputPath: string) => Promise<void>;
  type ToFileFunction = (outputPath: string) => Promise<void>;
  type ToJsonFunction = (callback: (item: Record<string, unknown>) => void) => Promise<void>;
  type ToJsonArrayFunction = () => Promise<Record<string, unknown>[]>;

  interface ModuleExports {
    toFileStream: (options: Omit<ParseOptions, 'inputPath'>, inputPath: string) => ToFileStreamFunction;
    toFile: (options: Omit<ParseOptions, 'inputPath'>, inputPath: string) => ToFileFunction;
    toJson: (options: Omit<ParseOptions, 'inputPath'>, inputPath: string) => ToJsonFunction;
    toJsonArray: (options: Omit<ParseOptions, 'inputPath'>, inputPath: string) => ToJsonArrayFunction;
  }

  const module: ModuleExports;
  export = module;
}

