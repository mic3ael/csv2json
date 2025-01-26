'use strict';

class StringParser {
  constructor(meta) {
    this.meta = meta;
    const initial = this.meta.start.default;
    const step = initial();
    this.step = step;

  }

  #feed(char) {
    const cases = this.meta[this.step.state];
    const action = cases[char] || cases.default;
    if (!action) throw new Error(action[''] || 'Unexpected character');
    const step = action(this.step, char);
    this.step = step;
  }

  parse(str) {
    for (let i = 0; i < str.length; i++)
      this.#feed(str.charAt(i));

    const end = this.meta.end.default;
    const endStep = end(this.step);
    this.step = endStep;
    const result = this.step.result;

    const close = this.meta.close.default;
    const closeStep = close(this.step);
    this.step = closeStep;

    return result;
  }
}

module.exports = StringParser;
