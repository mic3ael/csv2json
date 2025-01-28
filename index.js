'use strict';

const os = require('node:os');
const { createReadStream, createWriteStream } = require('node:fs');
const { writeFile } = require('node:fs/promises');
const readline = require('node:readline');
const { finished } = require('node:stream/promises');
const process = require('node:process');
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
  for (let i = 0; i < data.length; i++) {
    const jsonArray = data[i];
    for (let j = 0; j < jsonArray.length; j++)
      callback(jsonArray[j], readable);
  }
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
  const lb = new Pool(threadFactory({ headers, seperator }), { size: poolSize, timeout: 300 });
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
  rl.on('close', async () => { closeStream(readable); });
};


const init = (options = {}) => {
  return {
    parse: (inputPath) => ({
      async toFileStream(outputPath) {
        const writable = createWriteStream(outputPath);
        writable.write('[');
        let inProgress = false;
        const callback = (json, readable) => {
          const jsonStr = JSON.stringify(json);
          if (!inProgress) writable.on('drain', () => { readable.resume(); });
          writable.cork();
          if (inProgress) writable.write(',');
          const canWrite = writable.write(jsonStr);
          if (!canWrite) readable.pause();
          inProgress = true;
          process.nextTick(() => writable.uncork());
        };
        await parse({ inputPath, outputPath, ...options }, callback);
        writable.write(']');
        writable.on('close', () => closeStream(writable))
      },
      async toFile(outputPath) {
        const result = [];
        const callback = (json) => { result.push(json) };
        await parse({ inputPath, ...options }, callback);
        await writeFile(outputPath, JSON.stringify(result, null, 2));
      },
      async toStream(callback) {
        await parse({ inputPath, ...options }, callback);
      },
      async toJson() {
        const result = [];
        const callback = (json) => { result.push(json) };
        await parse({ inputPath, ...options }, callback);
        return result;
      }
    })
  };
}

async function main() {
  const resources = ['data/0.csv', 'data/customers-100.csv', 'data/customers-1000.csv', 'data/customers-10000.csv', 'data/customers-100000.csv', 'data/1.csv'];
  const parser = init();
  // await parser.parse(resources[1]).toFile('copy.json');
  // await parser.parse(resources[resources.length - 1]).toFile('copy.json');
  await parser.parse(resources[resources.length - 2]).toFile('copy.json');
  // const data = await parser.parse(resources[resources.length - 1]).toJson('copy.json');
  // console.log("data: ", data.length);
}

main();
module.exports = init;

