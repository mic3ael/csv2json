declare module 'state' {
  interface Step {
    index: number;
    accumulator: string[];
    result: Record<string, string>;
    state: string;
  }

  interface Action {
    (target: Step, char?: string): Step;
  }

  interface Cases {
    default: Action;
    [key: string]: Action;
  }

  interface StateMachine {
    start: {
      default: () => Step;
    };
    end: {
      default: Action;
    };
    close: {
      default: Action;
    };
    value: Cases;
    [key: string]: Cases;
  }

  function stateFactory(headers: string[], separator: string): StateMachine;

  export = stateFactory;
}

