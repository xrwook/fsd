export type TPath = `/${string}`;

export type ExtractPathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : T extends `${string}:${infer Param}`
      ? Param
      : T extends `${string}{${infer Param}}${infer Rest}`
        ? Param | ExtractPathParams<Rest>
        : never;
