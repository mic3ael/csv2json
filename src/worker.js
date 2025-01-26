'use strict';

const { parentPort, workerData } = require('node:worker_threads');
const StringParser = require('./stringParser');
const stateFactory = require('./state.js');

parentPort.on('message', ({ strs }) => {
  const { headers, seperator } = workerData.params;
  const state = stateFactory(headers, seperator)
  const stringParser = new StringParser(state);

  const jsonArray = new Array(strs.length);
  for (let i = 0; i < strs.length; i++) {
    const str = strs[i];
    const json = stringParser.parse(str);
    jsonArray[i] = json;
  }

  parentPort.postMessage({ jsonArray });
});
