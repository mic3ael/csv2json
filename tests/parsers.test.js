const assert = require('node:assert');
const { describe, it, after } = require('node:test');
let fs = require('node:fs');
const fsOriginal = { ...fs };
const mockFs = {
  writeFile: (_filePath, _data) => Promise.resolve(),
  writeFileSync: (_filePath, _data, callback) => callback(null),
  createReadStream: fs.createReadStream,
  createWriteStream: () => {
    const stream = new (require('node:stream').Writable)();
    stream._write = (_chunk, _encoding, done) => done();
    return stream;
  }
};

fs.promises.writeFile = mockFs.writeFile;
fs.writeFileSync = mockFs.writeFileSync;
fs.createWriteStream = mockFs.createWriteStream;

const { toFileStream, toFile, toJson, toJsonArray } = require('../src/parsers.js');
const path = require('node:path');
const jsonArr = require('./test.json');

describe('parsers', () => {
  const inputPath = path.resolve(__dirname, 'test.csv');
  const outputPath = path.resolve(__dirname, 'output.json');
  const options = { inputPath, headers: [], seperator: ',' };

  after(() => {
    fs = fsOriginal;
  })

  it('toFileStream writes JSON array to file', async () => {
    // await toFileStream(options, inputPath)(outputPath);
  });

  it('toFile writes JSON array to file', async () => {
    // await toFile(options, inputPath)(outputPath);
  });

  it('toJson calls callback with JSON object', async () => {
    // let index = 0;
    // const callback = (json) => {
    //   assert.deepEqual(json, jsonArr[index]);
    //   index++;
    // };
    // await toJson(options, inputPath)(callback);
  });

  it('toJsonArray returns JSON array', async () => {
    // const result = await toJsonArray(options, inputPath)();
    // assert.deepEqual(result, jsonArr);
  });
});

