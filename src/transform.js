'use strict';

const { Transform } = require('node:stream');
const os = require('node:os');
const Pool = require('./pool.js');
const { threadFactory } = require('./thread.js');
const { normalizeHeader, aggregator } = require('./utils.js');

class TransformStream extends Transform {
  #seperator;
  #headers;
  #poolSize;
  #lb;
  #processesAggregator;
  #bufferSize;
  #rest;
  #isInit;
  constructor({ seperator, headers }) {
    super();
    this.#seperator = seperator;
    this.#headers = headers;
    this.#poolSize = os.cpus().length - 1; // Number of logical processors, - 1 main thread
    this.#lb = null;
    this.#processesAggregator = null;
    this.#bufferSize = 2000;
    this.#rest = '';
    this.#isInit = true;
    this.#setupPoolAndAggregator();
  }

  #setupPoolAndAggregator() {
    if (this.#headers.length) {
      this.#lb = new Pool(
        threadFactory({ headers: this.#headers, seperator: this.#seperator }, this.#poolSize),
        { size: this.#poolSize, timeout: 200 }
      );
      this.#processesAggregator = aggregator(this.#lb, this.#bufferSize);
    }
  }

  #complete(result, done, isLast) {
    const str = JSON.stringify(result, null, 2);
    const sliceIdx = isLast ? [1] : [1, -1];
    if (this.#isInit) sliceIdx[0] = 0;
    this.#isInit = false;
    done(null, str.slice(...sliceIdx));
  }

  async _transform(chunk, _, done) {
    try {
      const text = this.#rest + chunk.toString();
      const lines = text.split(/\r?\n/);
      if (!this.#lb) {
        this.#headers = normalizeHeader(lines.shift(), this.#seperator);
        this.#setupPoolAndAggregator();
      }
      if (text.charAt(text.length - 1) === '\n') this.#rest = lines.pop();
      let result = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const jsonArr = await this.#processesAggregator.exec(line);
        if (!jsonArr) continue;
        result.push(...jsonArr);
      }
      this.#complete(result, done);
    } catch (err) {
      done(err);
    }
  }

  async _flush(done) {
    try {
      if (!this.#processesAggregator) return done();
      const jsonArr = await this.#processesAggregator.flush(); // Get remaining results
      if (jsonArr) this.#complete(jsonArr.flat(), done, true); // Finalize and close stream
      else done(); // Signal that flush is complete
    } catch (err) {
      done(err); // Handle any errors during flush
    } finally {
      if (this.#lb) await this.#lb.cleanup();
    }
  }
}

module.exports = TransformStream;
