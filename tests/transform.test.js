const assert = require('assert');
const { describe, it } = require('node:test');
const fs = require('node:fs');
const transform = require('../src/transform.js');
const { Transform } = require('node:stream');
const path = require('node:path');
const jsonArr = require('./test.json');

describe('transform', () => {

  it('transform returns a Transform stream', () => {
    const options = { seperator: ',', headers: ['header1', 'header2'] };
    const stream = transform(options);
    assert(stream instanceof Transform);
  });

  it('transform processes chunks correctly', async () => {
    const inputPath = path.resolve(__dirname, 'test.csv');
    const readStream = fs.createReadStream(inputPath);
    const stream = transform();
    let data = '';
    await new Promise((resolve) => {
      readStream
        .pipe(stream)
        .on('data', (chunk) => {
          data += chunk.toString();
        })
        .on('end', () => {
          resolve();
        });
    });
    assert.deepEqual(JSON.parse(data), jsonArr);
    stream.destroy();
  });
});
