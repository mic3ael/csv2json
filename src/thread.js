'use strict';

const { Worker } = require('node:worker_threads');
const path = require('node:path');

class Thread {
  #worker;
  #index;
  #isTerminated;
  #promises;

  constructor(index, params, releaseInstance) {
    this.#index = index;
    const workerPath = path.join(__dirname, 'worker.js');
    this.#worker = new Worker(workerPath, { workerData: { id: this.#index, params } });
    this.#init(releaseInstance);
    this.#promises = [];
    this.#isTerminated = false;
  }
  #init(releaseInstance) {
    this.#worker.on('message', async (msg) => {
      const { resolve } = this.#promises.shift();
      setTimeout(resolve, 0, msg.jsonArray);
      if (!this.#isTerminated) await releaseInstance(this);
    });
    this.#worker.on('error', async (err) => {
      console.error(`thread:init -> worker ${this.#index} error:`, err);
      const { reject } = this.#promises.shift();
      setTimeout(reject, 0, err);
      if (!this.#isTerminated) await releaseInstance(this);
    });
    this.#worker.on('exit', async (code) => {
      console.log(`thread:init -> worker thread ${this.#index} was successfully terminated with code ${code}`);
    });
  }
  get name() {
    return this.#index;
  }
  do(strs) {
    return new Promise((resolve, reject) => {
      this.#worker.postMessage({ strs });
      this.#promises.push({ resolve, reject });
    });
  }
  terminate() {
    this.#isTerminated = true;
    return this.#worker.terminate();
  }
  close() {
    return new Promise((resolve, reject) => {
      this.#worker.postMessage({ shutdown: true });
      this.#promises.push({ resolve, reject });
    });
  }
}

const threadFactory = (params) => (() => {
  let index = 0;
  return (releaseInstance) => {
    const thread = new Thread(index, params, releaseInstance);
    index++;
    return thread;
  }
})();

module.exports = {
  Thread,
  threadFactory
};

