const assert = require('assert');
const { describe, it } = require('node:test');
const { Thread, threadFactory } = require('../src/thread');

describe('Thread', () => {
  const releaseInstanceMock = async () => { };
  const params = { headers: ['header1'], seperator: ',' };

  it('constructor initializes thread', async () => {
    const thread = new Thread(0, params, releaseInstanceMock);
    assert.strictEqual(thread.name, 0);
    await thread.terminate();
  });

  it('do method processes strings', async () => {
    const thread = new Thread(0, params, releaseInstanceMock);
    const result = await thread.do(['test']);
    assert(result);
    await thread.terminate();
  });

  it('terminate method terminates worker', async () => {
    const thread = new Thread(0, params, releaseInstanceMock);
    await thread.terminate();
  });

  it('cancel method cancels processing when the process still not started', async () => {
    const thread = new Thread(0, params, releaseInstanceMock);
    thread.cancel();
    await thread.terminate();
  });
});

describe('threadFactory', () => {
  const params = { headers: ['header1'], seperator: ',' };

  it('creates thread instances', async () => {
    const factory = threadFactory(params);
    const thread = factory(async () => { });
    assert(thread instanceof Thread);
    await thread.terminate();
  });
});
