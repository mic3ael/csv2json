const { PassThrough } = require('node:stream');
const TransformStream = require('../src/transform.js');
const { describe, test, after } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');

describe('parsers', () => {
  const options = {
    seperator: ',',
    headers: []
  };

  test('Transforming data', async () => {
    const transformStream = new TransformStream(options);
    const inputStream = new PassThrough();
    const outputStream = new PassThrough();

    const input = `header1,header2,header3\nvalue1,value2,value3\nvalue4,value5,value6\n`;
    const expectedOutput = [{ "header1": "value1", "header2": "value2", "header3": "value3" }, { "header1": "value4", "header2": "value5", "header3": "value6" }];

    let transformedData = '';

    outputStream.on('data', (chunk) => {
      transformedData += chunk.toString();
    });
    outputStream.on('end', () => {
      try {
        assert.deepEqual(JSON.parse(transformedData), expectedOutput);
        console.log('Test 1: Transforming data - Passed');
      } catch (error) {
        console.error('Test 1: Transforming data - Failed', error);
      }
    });

    inputStream.pipe(transformStream).pipe(outputStream);
    inputStream.write(input);
    inputStream.end();
  })

  test('Handling empty input', async () => {
    const emptyTransformStream = new TransformStream(options);
    const emptyInputStream = new PassThrough();
    const emptyOutputStream = new PassThrough();

    const emptyInput = '';
    const expectedEmptyOutput = '';

    let transformedEmptyData = '';

    emptyOutputStream.on('data', (chunk) => {
      transformedEmptyData += chunk.toString();
    });

    emptyOutputStream.on('end', () => {
      try {
        assert.strictEqual(transformedEmptyData, expectedEmptyOutput);
        console.log('Test 2: Handling empty input - Passed');
      } catch (error) {
        console.error('Test 2: Handling empty input - Failed', error);
      }
    });

    emptyInputStream.pipe(emptyTransformStream).pipe(emptyOutputStream);
    emptyInputStream.write(emptyInput);
    emptyInputStream.end();
  })

  test('Flushing remaining data', async () => {
    const flushTransformStream = new TransformStream(options);
    const flushInputStream = new PassThrough();
    const flushOutputStream = new PassThrough();

    const flushInput = `header1,header2,header3\nvalue1,value2,value3\n`;
    const expectedFlushOutput = [{ "header1": "value1", "header2": "value2", "header3": "value3" }];

    let transformedFlushData = '';

    flushOutputStream.on('data', (chunk) => {
      transformedFlushData += chunk.toString();
    });
    once(flushTransformStream, 'end');
    flushOutputStream.on('end', () => {
      assert.deepEqual(JSON.parse(transformedFlushData), expectedFlushOutput);
    });

    flushInputStream.pipe(flushTransformStream).pipe(flushOutputStream);
    flushInputStream.write(flushInput);
    flushInputStream.end();
  })
});

