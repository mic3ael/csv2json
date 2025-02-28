declare module 'csv2json' {
  interface ParserOptions {
    headers?: string[];
    seperator?: string;
  }

  interface Parser {
    parse(inputPath: string): Record<string, any>;
    transform(): any;
  }

  function init(options?: ParserOptions): Parser;

  export = init;
}


