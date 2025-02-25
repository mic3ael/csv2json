declare module 'csv2json/src/parsers' {
  interface ParseOptions {
    inputPath: string;
    headers: string[];
    seperator: string;
  }

  function toFileStream(options: ParseOptions, inputPath: string): (outputPath: string) => Promise<void>;
  function toFile(options: ParseOptions, inputPath: string): (outputPath: string) => Promise<void>;
  function toJson(options: ParseOptions, inputPath: string): (callback: (jsonArray: any) => void) => Promise<void>;
  function toJsonArray(options: ParseOptions, inputPath: string): () => Promise<any[]>;

  export {
    toFileStream,
    toFile,
    toJson,
    toJsonArray,
  };
}

