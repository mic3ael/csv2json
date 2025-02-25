const assert = require('assert');
const { describe, it } = require('node:test');
const { Worker } = require('worker_threads');
const path = require('path');

const workerPath = path.join(__dirname, '../src/worker.js');

describe('worker', () => {
  it('Worker is instantiated with correct path', async () => {
    const worker = new Worker(workerPath, { workerData: { id: 0, params: {} } });
    assert(worker);
    await worker.terminate();
  });
});
