'use strict';

const normalizeHeader = (str, seperator) => str.replace(/["']/g, "").split(seperator)
  .map(h => h.split(' ').join(''));

module.exports = {
  normalizeHeader
};

