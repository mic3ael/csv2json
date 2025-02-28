'use strict';
// const path = require('node:path');
const fs = require('node:fs');
const parsers = require('./src/parsers.js');
const TransformStream = require('./src/transform.js');

const init = ({ headers = [], seperator = ',' } = {}) => {
  return {
    parse: (inputPath) => {
      const actions = {};
      for (let [name, func] of Object.entries(parsers))
        actions[name] = func({ headers, seperator }, inputPath);
      return actions;
    },
    transform: () => new TransformStream({ headers, seperator })
  };
}

module.exports = init;

