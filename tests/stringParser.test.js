const assert = require('assert');
const { describe, it } = require('node:test');
const StringParser = require('../src/stringParser');

describe('StringParser', () => {
  const meta = {
    start: { default: () => ({ index: 0, accumulator: [], result: {}, state: 'value' }) },
    end: { default: (step) => step },
    close: { default: (step) => step },
    value: { default: (step, char) => ({ ...step, accumulator: [...step.accumulator, char] }) },
  };

  it('parse method', () => {
    const parser = new StringParser(meta);
    const result = parser.parse('test');
    assert.deepEqual(result, {});
  });
});
