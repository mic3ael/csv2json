'use strict';

class Pool {
  #instances;
  #timeout;
  #free;
  #queue;
  #attachedTimeoutIDs;
  #available;
  #createInstance;

  constructor(createInstance, options = {}) {
    const { size = 0, timeout = 0 } = options;
    this.#free = new Array(size).fill(true);
    this.#timeout = timeout;
    this.#attachedTimeoutIDs = new WeakMap();
    this.#instances = new Array(size).fill(null);
    this.#queue = new Map();
    this.#createInstance = createInstance;
    for (let index = 0; index < size; index++) {
      this.#addInstance(index);
    }
    this.#available = size;
  }
  get size() {
    return this.#instances.length;
  }
  #addInstance(index) {
    let waitList = [];
    let close = null;
    if (this.#instances[index]) {
      const { close: currentClose, waitList: currentWaitList } = this.#queue.get(this.#instances[index]);
      if (currentClose && !currentWaitList.length) return;
      waitList = currentWaitList;
      close = currentClose;
    }

    const instance = this.#createInstance(this.#releaseInstance);
    this.#instances[index] = instance;
    this.#queue.set(instance, { close, waitList });
  }
  async #nextInstance() {
    if (!this.#instances.length) throw new Error('pool is empty');
    if (!this.#available) {
      const index = Math.floor(Math.random() * this.#instances.length);
      const instance = this.#instances[index];
      return new Promise((resolve) => {
        this.#queue.get(instance).waitList.push(resolve);
      });
    }
    const index = this.#free.findIndex((isFree) => isFree);
    const instance = this.#instances[index];
    return instance;
  }
  #findInstanceIndex(instance) {
    const index = this.#instances.indexOf(instance);
    if (index < 0) throw new Error('release unexpected instance');
    return index;
  }
  #releaseInstance = async (instance) => {
    const index = this.#findInstanceIndex(instance);
    if (this.#free[index]) throw new Error('release not captured');
    this.#clearTimeout(instance);
    const { waitList, close } = this.#queue.get(instance);
    if (waitList.length > 0) {
      const resolve = waitList.shift();
      if (resolve) setTimeout(resolve, 0, instance);
      return;
    }

    this.#available++;
    this.#free[index] = true;

    if (close) {
      await this.#deleteInstance(instance);
      setTimeout(close, 0);
    }
  };
  #clearTimeout(instance) {
    clearTimeout(this.#attachedTimeoutIDs.get(instance));
    this.#attachedTimeoutIDs.delete(instance);
  }
  #exceeds = async (instance) => {
    console.log(`pool:exceeded -> time limit exceeded, release instance ${instance.name}`);
    await instance.terminate();
    const index = this.#findInstanceIndex(instance);
    this.#addInstance(index);
  };
  async #deleteInstance(instance) {
    const index = this.#findInstanceIndex(instance);
    if (this.#free[index]) {
      await instance.close();
      this.#clearTimeout(instance);
      this.#free[index] = false;
      this.#instances[index] = null;
      this.#queue.delete(instance);
    } else {
      return new Promise((resolve) => { this.#queue.get(instance).close = resolve; });
    }
  }
  #attachInstance(instance) {
    const index = this.#findInstanceIndex(instance);
    this.#free[index] = false;
    this.#available--;
    const attachedTimeoutID = setTimeout(this.#exceeds, this.#timeout, instance);
    this.#attachedTimeoutIDs.set(instance, attachedTimeoutID);
  }
  async getInstance() {
    const instance = await this.#nextInstance();
    if (!instance) return null;
    this.#attachInstance(instance);
    return instance;
  }
  async cleanup() {
    const promises = new Array(this.#instances.length);
    for (let i = 0; i < this.#instances.length; i++) {
      const instance = this.#instances[i];
      promises[i] = this.#deleteInstance(instance);
    }
    return Promise.all(promises);
  }
}

module.exports = Pool;
