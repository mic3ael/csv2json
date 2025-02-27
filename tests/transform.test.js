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
    const inputPath = path.resolve(__dirname, '../data/customers-100000.csv');
    const outputPath = path.resolve(__dirname, 'test2.json');
    const readStream = fs.createReadStream(inputPath);
    const writeStream = fs.createWriteStream(outputPath);
    const options = { seperator: ',', headers: [] };
    let data = '';
    readStream
      .pipe(transform(options))
      .pipe(writeStream)
    // .on('finish', () => {
    //   assert.deepEqual(JSON.parse(data), jsonArr);
    //   console.log('Done');
    // });

    // once(sp, 'finish');
    // await Promise.all([finished(stream), finished(readStream)]);
    // console.log("Test completed successfully");
  });
});
