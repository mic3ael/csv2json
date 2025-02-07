'use strict';

const normalizeHeader = (str, seperator) => str.replace(/["']/g, "").split(seperator)
  .map(h => h.split(' ').join(''));

const aggregator = (pool, bufferSize) => {
  let data = [];
  let currentChunk = [];
  let processes = [];
  return {
    async exec(line) {
      currentChunk.push(line);
      if (currentChunk.length === bufferSize) {
        const instance = await pool.getInstance();
        processes.push(instance.do(currentChunk));
        currentChunk = [];
        if (processes.length === pool.size) {
          const result = await Promise.all(processes);
          data.push(...result.flat());
          processes = [];
        }
      }
      if (data.length) {
        const result = [...data];
        data = [];
        return result
      };
      return null;
    },
    async flush() {
      const instance = await pool.getInstance();
      processes.push(instance.do(currentChunk));
      const result = await Promise.all(processes);
      data.push(...result.flat());
      return data;
    }
  }
};



module.exports = {
  normalizeHeader,
  aggregator
};

