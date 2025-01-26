'use strict';

const stateFactory = (headers, seperator) => (
  {
    start:
    {
      default: () => {
        return {
          index: 0,
          accumulator: [],
          result: {},
          state: 'value'
        };
      }
    },
    end: {
      default: (target) => {
        const { index, accumulator, result } = target;
        const value = accumulator.join('').trim();
        const key = headers[index];
        result[key] = value;
        return target;
      }
    },
    close: {
      default: (target) => {
        target.accumulator = [];
        target.index = 0;
        target.state = 'value';
        target.result = {};
        return target;
      }
    },
    value: {
      default: (target, char) => {
        const { accumulator } = target;
        accumulator.push(char);
        return target
      },
      [seperator]: (target) => {
        const { index, accumulator, result } = target;
        const value = accumulator.join('').trim();
        const key = headers[index];
        result[key] = value;

        target.index = index + 1;
        target.accumulator = [];
        return target;
      },
      '"': (target) => {
        target.state = 'text';
        return target;
      },
    }, text: {
      '"': (target) => {
        target.state = 'value';
        return target;
      },
      default: (target, char) => {
        const { accumulator } = target;
        accumulator.push(char);
        return target;
      }
    }
  });

module.exports = stateFactory;
