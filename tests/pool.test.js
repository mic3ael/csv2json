const assert = require('assert');
const { describe, it, beforeEach } = require('node:test');
const Pool = require('../src/pool');

describe('Pool', () => {
  const createInstanceMock = (_releaseInstance) => ({
    name: 'instance',
    terminate: () => Promise.resolve(),
    cancel: () => { }
  });
  const options = { size: 2, timeout: 100 };

  let pool;

  beforeEach(() => {
    pool = new Pool(createInstanceMock, options);
  });

  it('constructor initializes pool', () => {
    assert.strictEqual(pool.size, 2);
  });

  it('getInstance returns an instance', async () => {
    const instance = await pool.getInstance();
    assert(instance);
    assert.strictEqual(instance.name, 'instance');
  });

  it('cleanup terminates all instances', async () => {
    await pool.cleanup();
  });
});
