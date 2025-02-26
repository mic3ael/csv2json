const assert = require('assert');
const { describe, it } = require('node:test');
const fs = require('node:fs');
const { once } = require('node:events');
const transform = require('../src/transform.js');
const { Transform } = require('node:stream');
const { finished } = require('node:stream/promises');
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
    const options = { seperator: ',', headers: [] };
    const stream = transform(options);
    let data = '';
    const sp = readStream
      .pipe(stream)
      .on('data', (chunk) => {
        data += chunk.toString();
      });
    await once(sp, 'close');
    assert.deepEqual(JSON.parse(data), jsonArr);
    await Promise.all([finished(stream), finished(sp), finished(readStream)]);
  });
});
