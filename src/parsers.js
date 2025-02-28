'use strict';
const { writeFile } = require('node:fs/promises');
const { once } = require('node:events');
const os = require('node:os');
const { createReadStream, createWriteStream } = require('node:fs');
const readline = require('node:readline');
const { finished } = require('node:stream/promises');
const Pool = require('./pool.js');
const { threadFactory } = require('./thread.js');
const { normalizeHeader, aggregator } = require('./utils.js');

const parse = async ({ inputPath, headers, seperator }, callback) => {
  const readable = createReadStream(inputPath);
  const rl = readline.createInterface(readable);
  const linesIterator = rl[Symbol.asyncIterator]();
  if (!headers.length) {
    const { done, value } = await linesIterator.next();
    if (done) throw new Error('file is empty');
    headers = normalizeHeader(value, seperator);
  }
  const poolSize = os.cpus().length - 1; // Number of logical processors, - 1 main thread
  const lb = new Pool(threadFactory({ headers, seperator }), { size: poolSize, timeout: 200 });
  const bufferSize = 2000;
  const processesAggregator = aggregator(lb, bufferSize);
  for await (let line of linesIterator) {
    const result = await processesAggregator.exec(line);
    if (!result) continue;
    callback(result.flat(), readable)
  }
  await once(readable, 'close');
  const result = await processesAggregator.flush();
  callback(result.flat(), readable);
  await Promise.all([lb.cleanup(), finished(readable)]);
};

const toFileStream = (options, inputPath) =>
  async (outputPath) => {
    const writable = createWriteStream(outputPath);
    writable.write('[');
    let inProgress = false;
    const callback = (jsonArray, readable) => {
      writable.once('drain', () => {
        readable.resume();
      });
      writable.cork();
      if (inProgress) writable.write(',');
      writable.write('\n');
      const str = JSON.stringify(jsonArray).slice(1, -1);
      const canWrite = writable.write(str);
      if (!canWrite) readable.pause();
      inProgress = true;
      writable.uncork();
    };
    await parse({ inputPath, outputPath, ...options }, callback);
    writable.end('\n]');
    await once(writable, 'close');
    await finished(writable);
  }

const toFile = (options, inputPath) =>
  async (outputPath) => {
    let result = [];
    const callback = (jsonArray) => result = result.concat(jsonArray);
    await parse({ inputPath, ...options }, callback);
    await writeFile(outputPath, JSON.stringify(result, null, 2));
  }

const toJson = (options, inputPath) =>
  async (callback) => {
    await parse({ inputPath, ...options }, (jsonArray) => jsonArray.forEach(callback));
  }

const toJsonArray = (options, inputPath) =>
  async () => {
    const result = [];
    const callback = (jsonArray) => { result.push(...jsonArray) };
    await parse({ inputPath, ...options }, callback);
    return result;
  }

module.exports = {
  toFileStream,
  toFile,
  toJson,
  toJsonArray,
};
