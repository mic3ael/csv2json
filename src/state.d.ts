declare module 'csv2json/src/state' {
  interface Target {
    index: number;
    accumulator: string[];
    result: Record<string, any>;
    state: string;
  }

  function stateFactory(headers: string[], seperator: string): {
    start: { default: () => Target };
    end: { default: (target: Target) => Target };
    close: { default: (target: Target) => Target };
    value: {
      default: (target: Target, char: string) => Target;
      [seperator: string]: (target: Target) => Target;
      '\"': (target: Target) => Target;
    };
    text: {
      '\"': (target: Target) => Target;
      default: (target: Target, char: string) => Target;
    };
  };

  export = stateFactory;
}
