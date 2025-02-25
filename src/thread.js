'use strict';

const { Worker } = require('node:worker_threads');
const path = require('node:path');

class Thread {
  #worker;
  #index;
  #resolve;
  #reject;
  #terminated = false;
  constructor(i, params, releaseInstance) {
    this.#index = i;
    const workerPath = path.join(__dirname, 'worker.js');
    this.#worker = new Worker(workerPath, { workerData: { id: this.#index, params } });
    this.#init(releaseInstance);
  }
  #init(releaseInstance) {
    this.#worker.on('message', async (msg) => {
      await releaseInstance(this);
      if (this.#resolve) setTimeout(this.#resolve, 0, msg.jsonArray);
      this.#resolve = null;
      this.#reject = null;
    });
    this.#worker.on('error', async (err) => {
      console.error(`Worker ${this.#index} error:`, err);
      await releaseInstance(this);
      if (this.#reject) setTimeout(this.#reject, 0, err);
      this.#resolve = null;
      this.#reject = null;
    });
    this.#worker.on('exit', (code) => {
      if (code != 0 && this.#terminated === false) {
        console.error('Something went wrong in the thread code: ', code);
        if (this.#reject) setTimeout(this.#reject, 0, code);
      }
      this.#reject = null;
      this.#resolve = null;
    });
  }
  get name() {
    return this.#index;
  }
  do(strs) {
    return new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
      this.#worker.postMessage({ strs });
    });
  }
  terminate() {
    this.#terminated = true;
    return this.#worker.terminate();
  }
  cancel() {
    if (this.#reject)
      setTimeout(this.#reject, 0);
    this.#reject = null;
    this.#resolve = null;
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

