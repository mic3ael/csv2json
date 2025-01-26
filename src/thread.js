'use strict';

const { Worker } = require('node:worker_threads');

class Thread {
  #worker;
  #index;
  constructor(i, resultResolver, params, releaseInstance) {
    this.#index = i;
    this.#worker = new Worker(`${__dirname}/worker.js`, { workerData: { id: this.#index, params } });

    this.#worker.on('message', async (msg) => {
      resultResolver.add(msg.jsonArray);
      await releaseInstance(this);
    });
    this.#worker.on('error', (err) => {
      console.error(`Worker ${this.#index} error:`, err);
    });
    this.#worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${this.#index} exited with code ${code}`);
      }
    });
  }
  get name() {
    return this.#index;
  }
  do(strs) {
    this.#worker.postMessage({
      strs,
    });
  }
  terminate() {
    return this.#worker.terminate();
  }
  cancel() {

  }
}

const threadFactory = (resultResolver, params) => (() => {
  let index = -1;
  return (releaseInstance) => {
    index++;
    return new Thread(index, resultResolver, params, releaseInstance);
  }
})();

module.exports = {
  Thread,
  threadFactory
};

