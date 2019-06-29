export type ArgsType<T extends (...a: any) => any> = T extends (...a: infer R) => any ? R : any;

export type ArgsOrArg0<T extends (...a: any) => any> = ArgsType<T> extends [ArgsType<T>[0]]
  ? (ArgsType<T> | ArgsType<T>[0])
  : ArgsType<T>;

export type Include<T, U> = T extends U ? T : never;

export function excludeCircular<T>(obj: T): T {
  JSON.stringify(obj);
  return obj;
}
