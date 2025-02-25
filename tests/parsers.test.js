const assert = require('assert');
const { describe, it } = require('node:test');
const { toFileStream, toFile, toJson, toJsonArray } = require('../src/parsers');
const fs = require('fs');
const path = require('path');

const mockFs = {
  writeFile: (_filePath, _data, callback) => callback(null),
  createReadStream: fs.createReadStream,
  createWriteStream: () => {
    const stream = new (require('stream').Writable)();
    stream._write = (_chunk, _encoding, done) => done();
    return stream;
  }
};

fs.promises.writeFile = mockFs.writeFile;

describe('parsers', () => {
  const inputPath = path.resolve(__dirname, 'test.csv');
  const outputPath = path.resolve(__dirname, 'output.json');
  const options = { inputPath, headers: [], seperator: ',' };

  it('toFileStream writes JSON array to file', async () => {
    await toFileStream(options, inputPath)(outputPath);
  });

  it('toFile writes JSON array to file', async () => {
    await toFile(options, inputPath)(outputPath);
  });

  it('toJson calls callback with JSON object', async () => {
    const callback = (json) => {
      assert.deepEqual(json, { header1: 'value1', header2: 'value2' });
    };
    await toJson(options, inputPath)(callback);
  });

  it('toJsonArray returns JSON array', async () => {
    const result = await toJsonArray(options, inputPath)();
    assert.deepEqual(result, [{ header1: 'value1', header2: 'value2' }]);
  });
});

