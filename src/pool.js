'use strict';

class Pool {
  #instances;
  #timeout;
  #free;
  #queue;
  #attachedTimeoutIDs;
  #available;

  constructor(createInstance, options = {}) {
    const { size = 0, timeout = 0 } = options;
    this.#free = new Array(size).fill(true);
    this.#timeout = timeout;
    this.#attachedTimeoutIDs = new WeakMap();
    this.#instances = new Array(size).fill(null);
    this.#queue = new Map();

    for (let index = 0; index < size; index++) {
      const instance = createInstance(this.#releaseInstance);
      this.#instances[index] = instance;
      this.#queue.set(instance, { terminate: null, processes: [] });
    }
    this.#available = size;
  }
  async #nextInstance() {
    if (!this.#instances.length) throw new Error('pool is empty');
    if (!this.#available) {
      const index = Math.floor(Math.random() * this.#instances.length);
      const instance = this.#instances[index];
      return new Promise((resolve) => {
        this.#queue.get(instance).processes.push(resolve);
      });
    }
    const index = this.#free.findIndex((isFree) => isFree);
    const instance = this.#instances[index];
    return instance;
  }
  #findInstanceIndex(instance) {
    const index = this.#instances.indexOf(instance);
    if (index < 0) throw new Error('RoundRobin: release unexpected instance');
    return index;
  }
  #releaseInstance = async (instance) => {
    const index = this.#findInstanceIndex(instance);
    if (this.#free[index]) throw new Error('RoundRobin: release not captured');
    this.#clearTimeout(instance);
    const { processes, terminate } = this.#queue.get(instance);
    if (processes.length > 0) {
      const resolve = processes.shift();
      if (resolve) setTimeout(resolve, 0, instance);
      return;
    }

    this.#available++;
    this.#free[index] = true;

    if (terminate) {
      await this.#deleteInstance(instance);
      setTimeout(terminate, 0);
    }
  };
  #clearTimeout(instance) {
    clearTimeout(this.#attachedTimeoutIDs.get(instance));
    this.#attachedTimeoutIDs.delete(instance);
  }
  #exceeds = (instance) => {
    console.log(`RoundRobin: time limit exceeded -> release instance ${instance.name}`);
    instance.cancel();
    this.#releaseInstance(instance);
  };
  async #deleteInstance(instance) {
    const index = this.#findInstanceIndex(instance);
    if (this.#free[index]) {
      await instance.terminate();
      this.#clearTimeout(instance);
      this.#free.slice(index, index);
      this.#instances.slice(index, index);
      this.#queue.delete(instance);
    } else {
      return new Promise((resolve) => { this.#queue.get(instance).terminate = resolve; });
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
