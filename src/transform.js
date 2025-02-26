'use strict';

const { Transform } = require('node:stream');
const os = require('node:os');
const Pool = require('./pool.js');
const { threadFactory } = require('./thread.js');
const { normalizeHeader, aggregator } = require('./utils.js');

const transform = ({ seperator, headers }) => {
  const poolSize = os.cpus().length - 1; // Number of logical processors, - 1 main thread
  let lb = null;
  let processesAggregator = null;
  const bufferSize = 2000;
  if (headers.length) {
    lb = new Pool(threadFactory({ headers, seperator }, poolSize), { size: poolSize, timeout: 200 });
    processesAggregator = aggregator(lb, bufferSize);
  }
  let rest = '';
  let isInit = true;

  const complete = (result, done, isLast) => {
    const str = JSON.stringify(result, null, 2);
    const sliceIdx = isLast ? [1] : [1, -1];
    if (isInit) sliceIdx[0] = 0;
    isInit = false;
    done(null, str.slice(...sliceIdx));
  }
  return new Transform({
    async transform(chunk, _, done) {
      try {
        const text = rest + chunk.toString();
        const lines = text.split(/\r?\n/);
        if (!lb) {
          headers = normalizeHeader(lines.shift(), seperator);
          lb = new Pool(threadFactory({ headers, seperator }), { size: poolSize, timeout: 200 });
          processesAggregator = aggregator(lb, bufferSize);
        }
        if (text.charAt(text.length - 1) === '\n') rest = lines.pop();
        let result = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const jsonArr = await processesAggregator.exec(line);
          if (!jsonArr) continue;
          result.push(...jsonArr);
        }
        complete(result, done);
      } catch (err) {
        done(err);
      }
    },
    async flush(done) {
      try {
        const jsonArr = await processesAggregator.flush(); // Get remaining results
        if (lb) await lb.cleanup();
        if (jsonArr) complete(jsonArr.flat(), done, true); // Finalize and close stream
        else done(); // Signal that flush is complete
      } catch (err) {
        done(err); // Handle any errors during flush
      }
    },
  });
};

module.exports = transform;
