declare module 'csv2json/src/stringParser' {
  interface Meta {
    start: { default: () => Step };
    end: { default: (step: Step) => Step };
    close: { default: (step: Step) => Step };
    [key: string]: { [key: string]: (step: Step, char?: string) => Step };
  }

  interface Step {
    index: number;
    accumulator: string[];
    result: Record<string, any>;
    state: string;
  }

  class StringParser {
    constructor(meta: Meta);
    parse(str: string): Record<string, any>;
  }

  export = StringParser;
}

