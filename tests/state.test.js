const assert = require('assert');
const { describe, it } = require('node:test');
const stateFactory = require('../src/state.js');

describe('stateFactory', () => {
  const headers = ['header1', 'header2'];
  const seperator = ',';

  it('start state', () => {
    const state = stateFactory(headers, seperator);
    const startState = state.start.default();
    assert.deepEqual(startState, {
      index: 0,
      accumulator: [],
      result: {},
      state: 'value',
    });
  });

  it('end state', () => {
    const state = stateFactory(headers, seperator);
    const target = {
      index: 0,
      accumulator: ['value1'],
      result: {},
      state: 'value',
    };
    const endState = state.end.default(target);
    assert.deepEqual(endState.result, { header1: 'value1' });
  });

  it('close state', () => {
    const state = stateFactory(headers, seperator);
    const target = {
      index: 1,
      accumulator: ['value2'],
      result: { header1: 'value1' },
      state: 'value',
    };
    const closeState = state.close.default(target);
    assert.deepEqual(closeState, {
      accumulator: [],
      index: 0,
      state: 'value',
      result: {},
    });
  });
});
