'use strict';
const path = require('node:path');
const parsers = require('./src/parsers.js');

const init = (options = {}) => {
  return {
    parse: (inputPath) => {
      const actions = {};
      for (let [name, func] of Object.entries(parsers))
        actions[name] = func(options, inputPath);
      return actions;
    }
  };
}

async function main() {
  const parser = init();
  // await parser.parse(resources[1]).toFileStream('copy.json');
  // await parser.parse(resources[resources.length - 2]).toFile('copy.json');
  // await parser.parse(`data/customers-100000.csv`).toFileStream('output/copy.json');
  // await parser.parse(resources[2]).toFileStream('copy.json');
  await parser.parse(`data/customers-2000000.csv`).toFileStream('output/copy.json');
  // const data = await parser.parse(resources[resources.length - 1]).toJson('copy.json');
  // console.log("data: ", data.length);

  // const resources = ['0', 'customers-100', 'customers-1000', 'customers-10000', 'customers-100000', '1', 'customers-2000000'];
  // for (let resource of resources) {
  //   await parser.parse(
  //     path.join(__dirname, 'data', `${resource}.csv`)
  //   ).toFileStream(
  //     path.join(__dirname, 'output', `${resource}.json`)
  //   );
  // }
}

main();
module.exports = init;

