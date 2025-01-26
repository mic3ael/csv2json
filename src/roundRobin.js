'use strict';

class RoundRobin {
  #instances;
  #timeout;
  #free;
  #available;
  #queue;
  #attachedTimeoutIDs;
  #current;

  constructor(createInstance, options = {}) {
    const { size = 0, timeout = 0 } = options;
    this.#instances = new Array(size).fill(null);
    this.#free = new Array(size).fill(true);
    this.#available = 0;
    this.#queue = new Map();
    this.#current = 0;
    this.#timeout = timeout;
    this.#attachedTimeoutIDs = new WeakMap();
    for (let index = 0; index < size; index++) {
      const instance = createInstance(this.#releaseInstance);
      this.#instances[index] = instance;
      this.#queue.set(instance, { terminate: null, data: [] });
      this.#available++;
    }
  }
  async #nextInstance() {
    const instance = this.#instances[this.#current];
    const free = this.#free[this.#current];
    this.#current = (this.#current + 1) % this.#available;

    if (!free) {
      return new Promise((resolve) => {
        this.#queue.get(instance).data.push(resolve);
      });
    }
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
    clearTimeout(this.#attachedTimeoutIDs.get(instance));
    this.#attachedTimeoutIDs.delete(instance);
    const { data, terminate } = this.#queue.get(instance);
    if (data.length > 0) {
      const resolve = data.shift();
      if (resolve) setTimeout(resolve, 0, instance);
      return;
    }
    this.#free[index] = true;
    if (terminate) {
      await instance.terminate();
      setTimeout(terminate, 0);
    }
  };
  #exceeds = (instance) => {
    console.log(
      `RoundRobin: time limit exceeded -> release instance ${instance.name}`
    );
    instance.cancel();
    this.#releaseInstance(instance);
  };
  #attachInstance(instance) {
    const index = this.#findInstanceIndex(instance);
    this.#free[index] = false;
    // const attachedTimeoutID = setTimeout(this.#exceeds, this.#timeout, instance);
    // this.#attachedTimeoutIDs.set(instance, attachedTimeoutID);
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
      if (this.#free[i])
        promises[i] = instance.terminate();
      else {
        promises[i] = new Promise((resolve) => { this.#queue.get(instance).terminate = resolve; });
      }
    }
    return Promise.all(promises);
  }
}

module.exports = RoundRobin;
