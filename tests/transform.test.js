const assert = require('assert');
const { describe, it } = require('node:test');
const fs = require('node:fs');
const transform = require('../src/transform');
const { Transform } = require('stream');

describe('transform', () => {
  const options = { seperator: ',', headers: ['header1', 'header2'] };

  it('transform returns a Transform stream', () => {
    const stream = transform(options);
    assert(stream instanceof Transform);
  });

  it('transform processes chunks correctly', (done) => {
    const readStream = fs.createReadStream('test.csv');
    const stream = transform(options);
    const data = [];
    readStream
      .pipe(stream)
      .on('data', (chunk) => data.push(chunk.toString()))
      .on('finish', () => {
        console.log("row 22: ", data);
        done();
      });
  });
});
