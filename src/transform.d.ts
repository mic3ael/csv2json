declare module 'csv2json/src/transform' {
  interface TransformOptions {
    seperator: string;
    headers: string[];
  }

  function transform(options: TransformOptions): Transform;

  export = transform;
}


