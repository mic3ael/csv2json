'use strict';

const { Transform } = require('node:stream');
const os = require('node:os');
const v8 = require('node:v8');
const Pool = require('./pool.js');
const { threadFactory } = require('./thread.js');
const { normalizeHeader } = require('./utils.js');


const transform = ({ seperator, headers }) => {
  const poolSize = os.cpus().length - 1; // Number of logical processors, - 1 main thread
  let lb = null;
  if (headers.length)
    lb = new Pool(threadFactory({ headers, seperator }), { size: poolSize, timeout: 200 });
  const bufferSize = 2000;
  let processes = [];
  let rest = '';

  return new Transform({
    async transform(chunk, _, done) {
      const text = rest + chunk.toString();
      const lines = text.split(/\r?\n/);
      if (!lb) {
        headers = normalizeHeader(lines.shift(), seperator);
        lb = new Pool(threadFactory({ headers, seperator }), { size: poolSize, timeout: 200 });
      }
      if (text.charAt(text.length - 1) === '\n') rest = lines.pop();

      const result = [];
      let currentChunk = [];
      for (let line of lines) {
        if (!line.length) continue;
        currentChunk.push(line);
        if (currentChunk.length === bufferSize) {
          const instance = await lb.getInstance();
          processes.push(instance.do(lines));
          currentChunk = [];
          if (processes.length === poolSize) {
            const data = await Promise.all(processes);
            result.push(...data.flat());
            processes = [];
          }
        }
      }
      const instance = await lb.getInstance();
      processes.push(instance.do(currentChunk));
      const data = await Promise.all(processes);
      result.push(data.flat());
      processes = [];
      done(null, JSON.stringify(result));
    },
    async flush(done) {
      await lb.cleanup();
      done();
    }
  });
};

module.exports = transform;
