import Joi from 'joi';

/**
 * The basic data types can be dump to string by yaml.
 */
export type YamlDumpSupportBasicType = string | number | null | boolean | Buffer | Date;
/**
 * The data types can be dump to string by yaml.
 */
export type YamlDumpSupportType =
  | YamlDumpSupportBasicType
  | YamlDumpSupportBasicType[]
  | { [k: string]: YamlDumpSupportType };

export type ArgsType<T extends (...a: any) => any> = T extends (...a: infer R) => any ? R : any;

export type ArgsOrArg0<T extends (...a: any) => any> = ArgsType<T> extends [ArgsType<T>[0]]
  ? (ArgsType<T> | ArgsType<T>[0])
  : ArgsType<T>;

export type Include<T, U> = T extends U ? T : never;

const yamlDumpableBasicTypeValidator = Joi.alternatives(
  Joi.string(),
  Joi.number(),
  Joi.boolean(),
  Joi.binary(),
  Joi.date(),
  null,
).required();

export function isYamlDumpableBasicType(value: any): value is YamlDumpSupportBasicType {
  return !yamlDumpableBasicTypeValidator.validate(value).error;
}

export function isYamlDumpable(value: any): value is YamlDumpSupportType {
  if (!value || typeof value !== 'object') return isYamlDumpableBasicType(value);
  return !Object.keys(value).some(key => !isYamlDumpable(value[key]));
}

export function excludeCircular<T>(obj: T): T {
  JSON.stringify(obj);
  return obj;
}
