declare module 'transform' {
  import { Transform } from 'node:stream';

  interface TransformOptions {
    seperator: string;
    headers: string[];
  }

  const transform: (options: TransformOptions) => Transform;

  export = transform;
}

