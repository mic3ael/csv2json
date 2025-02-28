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

async function main() {
  const parser = init();
  // await parser.parse(resources[1]).toFileStream('copy.json');
  // await parser.parse(`data/customers-100.csv`).toFile('output/copy.json');
  // const data = fs.readFileSync('output/copy.json');
  // const content = v8.deserialize(data);
  // console.log("content: ", content);
  // await parser.parse(`data/customers-1000.csv`).toFileStream('output/copy.json');
  // await parser.parse(resources[2]).toFileStream('copy.json');
  // await parser.parse(`tests/test.csv`).toFileStream('output/copy.json');
  // await parser.parse(`data/customers-100000.csv`).toFileStream('output/copy.json');
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

  // transform
  // const readStream = fs.createReadStream('data/customers-2000000.csv');
  const readStream = fs.createReadStream('data/customers-100000.csv');
  // const readStream = fs.createReadStream('tests/test.csv');
  const writeStream = fs.createWriteStream('output/copy.json');
  readStream
    .pipe(parser.transform())
    .pipe(writeStream)
    .on('finish', () => {
      console.log('Done');
    });
}

main();
module.exports = init;

