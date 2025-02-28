const assert = require('assert');
const { describe, it } = require('node:test');
const { normalizeHeader, aggregator } = require('../src/utils.js');

describe('normalizeHeader', () => {
  it('normalizes header', () => {
    const header = 'header1,header2';
    const result = normalizeHeader(header, ',');
    assert.deepEqual(result, ['header1', 'header2']);
  });
});

describe('aggregator', () => {
  it('creates an aggregator', () => {
    const poolMock = { exec: async () => { } };
    const bufferSize = 2;
    const agg = aggregator(poolMock, bufferSize);
    assert(agg);
  });
});
