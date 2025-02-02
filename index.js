'use strict';

const os = require('node:os');
const { createReadStream, createWriteStream } = require('node:fs');
const { writeFile } = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline');
const { finished } = require('node:stream/promises');
const Pool = require('./src/pool.js');
const { threadFactory } = require('./src/thread.js');


const closeStream = async (stream, callback = () => { }) => {
  try {
    await finished(stream);
  } catch (err) {
    stream.destroy();
  } finally {
    console.log('Stream was closed');
    callback();
  }
}

const flushFactory = (callback, readable) => (data) => {
  callback(data.flat(), readable);
};

const getHeader = (str, seperator) => str.replace(/["']/g, "").split(seperator).map(h => h.split(' ').join(''));

const parse = async ({ inputPath, seperator = ',', headers = [] }, callback) => {
  const readable = createReadStream(inputPath);
  const rl = readline.createInterface(readable);
  const linesIterator = rl[Symbol.asyncIterator]();
  if (headers.length === 0) {
    const { done, value } = await linesIterator.next();
    if (done) throw new Error('file is empty');
    headers = getHeader(value, seperator);
  }
  const flush = flushFactory(callback, readable);
  const poolSize = os.cpus().length - 1; // Number of logical processors, - 1 main thread
  const lb = new Pool(threadFactory({ headers, seperator }), { size: poolSize, timeout: 200 });
  const bufferSize = 2000;
  let lines = [];
  let processes = [];
  for await (const line of linesIterator) {
    if (!line.length) continue;
    lines.push(line);
    if (lines.length === bufferSize) {
      const instance = await lb.getInstance();
      processes.push(instance.do(lines));
      lines = [];
      if (processes.length === poolSize) {
        const data = await Promise.all(processes);
        flush(data);
        processes = [];
      }
    }
  }
  const instance = await lb.getInstance();
  processes.push(instance.do(lines));
  const data = await Promise.all(processes);
  flush(data);
  await lb.cleanup();
  readable.on('close', async () => { closeStream(readable); });
};

const toFileStream = (options, inputPath) =>
  async (outputPath) => {
    const writable = createWriteStream(outputPath);
    writable.write('[');
    let inProgress = false;
    const callback = (jsonArray, readable) => {
      writable.once('drain', () => { readable.resume(); });
      writable.cork();
      if (inProgress) writable.write(',');
      writable.write('\n');
      const jsonStr = JSON.stringify(jsonArray);
      const str = jsonStr.slice(1, -1);
      const canWrite = writable.write(str);
      if (!canWrite) readable.pause();
      inProgress = true;
      writable.uncork();
    };
    await parse({ inputPath, outputPath, ...options }, callback);
    writable.write('\n]');
    writable.on('close', () => closeStream(writable));
  }

const toFile = (options, inputPath) =>
  async (outputPath) => {
    const result = [];
    const callback = (jsonArray) => { result.push(...jsonArray) };
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

const init = (options = {}) => {
  return {
    parse: (inputPath) => ({
      toFileStream: toFileStream(options, inputPath),
      toFile: toFile(options, inputPath),
      toJson: toJson(options, inputPath),
      toJsonArray: toJsonArray(options, inputPath)
    })
  };
}

async function main() {
  const resources = ['0', 'customers-100', 'customers-1000', 'customers-10000', 'customers-100000', '1', 'customers-2000000'];
  const parser = init();
  // await parser.parse(resources[1]).toFileStream('copy.json');
  // await parser.parse(resources[resources.length - 2]).toFile('copy.json');
  await parser.parse(`data/customers-100000.csv`).toFileStream('output/copy.json');
  // await parser.parse(resources[2]).toFileStream('copy.json');
  // await parser.parse(`data/customers-2000000.csv`).toFileStream('output/copy.json');
  // const data = await parser.parse(resources[resources.length - 1]).toJson('copy.json');
  // console.log("data: ", data.length);

  // for (let resource of resources) {
  //   await parser.parse(
  //     path.join(__dirname, 'data', `${resource}.csv`)
  //   ).toFileStream(
  //     path.join(__dirname, 'output', `${resource}.json`)
  //   );
  // }
}

main();
module.exports = init;

