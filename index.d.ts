
declare type Options = {
  seperator: string;
  headers: string[];
}

declare const toFileStreamBody = (outputPath: string) => Promise<void>
declare const toFileBody = (outputPath: string) => Promise<void>
declare const toJsonBody = (callback: (json: Record<string, unknown>) => void) => Promise<void>
declare const toJsonArrayBody = () => Promise<Record<string, unknown>[]>

export declare const toFileStream = (options: Options, inputPath: string) => toFileStreamBody
export declare const toFile = (options: Options, inputPath: string) => toFile;
export declare const toJson = (options: Options, inputPath: string) => toJson;
export declare const toJsonArray = (options: Options, inputPath: string) => toJsonArray;
