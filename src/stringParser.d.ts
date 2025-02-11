declare module 'StringParser' {
  interface Step {
    state: string;
    result: any;
    [key: string]: any;
  }

  interface Action {
    (step: Step, char: string): Step;
  }

  interface Cases {
    [key: string]: Action | undefined;
    default?: Action;
  }

  interface Meta {
    start: {
      default: () => Step;
    };
    end: {
      default: (step: Step) => Step;
    };
    close: {
      default: (step: Step) => Step;
    };
    [state: string]: Cases;
  }

  class StringParser {
    constructor(meta: Meta);

    parse(str: string): any;

    private step: Step;
    private meta: Meta;
  }

  export = StringParser;
}

