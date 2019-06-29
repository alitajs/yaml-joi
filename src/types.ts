import Joi from 'joi';
import { ArgsOrArg0 } from './utils';

/**
 * Valid schema type name.
 */
export type JoiSchemaTypeName =
  | 'array'
  | 'binary'
  | 'boolean'
  | 'date'
  | 'number'
  | 'object'
  | 'string';
/**
 * Pick the appropriate type definition of arguments of the function from `Joi`.
 * @example
 * // example of limitation
 * [{ min: 0 }];
 * [{ min: [0] }];
 * [{ items: { isSchema: true, type: 'boolean' } }];
 */
type JoiSchemaArgs<T> = T extends (...a: any[]) => any
  ? ArgsOrArg0<T> | JoiSchemaInLimitationAsArg
  : never;
type JoiSchemaLimitation<T extends { [k: string]: any }> = {
  [K in keyof T]?: JoiSchemaArgs<T[K]>;
}[];
interface JoiBasicSchema<S> {
  /**
   * Allow value to be `null` or `undefined` or both of them.
   * - `'null'`: Only allow `null`.
   * - `'nothing'`: Do nothing about empty check.
   * - `true`: Allow both `null` and `undefined`.
   * - `false`: Deny both `null` and `undefined`.
   * @default
   * false
   */
  allowEmpty?: 'null' | 'nothing' | boolean;
  /**
   * Additional limitations on writing data.
   * @default
   * []
   * @see
   * https://github.com/hapijs/joi
   * @example
   * Joi.array().items(Joi.string());
   * [{
   *   items: {
   *     isSchema: true,
   *     type: 'string',
   *   },
   * }]
   */
  limitation?: JoiSchemaLimitation<S>;
  /**
   * Name of type.
   */
  type: JoiSchemaTypeName;
}
export interface JoiArraySchema extends JoiBasicSchema<Joi.ArraySchema> {
  type: 'array';
}
export interface JoiBinarySchema extends JoiBasicSchema<Joi.BinarySchema> {
  type: 'binary';
}
export interface JoiBooleanSchema extends JoiBasicSchema<Joi.BooleanSchema> {
  type: 'boolean';
}
export interface JoiDateSchema extends JoiBasicSchema<Joi.DateSchema> {
  type: 'date';
}
export interface JoiNumberSchema extends JoiBasicSchema<Joi.NumberSchema> {
  type: 'number';
}
export interface JoiObjectSchema extends JoiBasicSchema<Joi.ObjectSchema> {
  type: 'object';
}
export interface JoiStringSchema extends JoiBasicSchema<Joi.StringSchema> {
  type: 'string';
}
/**
 * Schema that load from string in yaml format.
 */
export type JoiSchema =
  | JoiArraySchema
  | JoiBinarySchema
  | JoiBooleanSchema
  | JoiDateSchema
  | JoiNumberSchema
  | JoiObjectSchema
  | JoiStringSchema;
/**
 * Use the sub schemas as the arguments in the `limitation`
 */
export type JoiSchemaInLimitation = JoiSchema & {
  /**
   * When we need to use the sub schemas as the arguments in the `limitation`,
   * we may have to add the identifier in each schema to distinguish ordinary objects.
   * @example
   * // object
   * const userSchema = {
   *   type: 'object',
   *   desc: 'user',
   *   // use ordinary objects as argument
   *   limitation: [{ keys: { email: {...} } }],
   * }
   * // array
   * const userTable = {
   *   type: 'array',
   *   desc: 'user table',
   *   // use schema as argument
   *   limitation: [{ items: { ...userSchema, isSchema: true } }],
   * }
   */
  isSchema: true;
};
export type JoiSchemaInLimitationAsArg<T = unknown> =
  | JoiSchemaInLimitation
  | JoiSchemaInLimitation[]
  | (T extends unknown ? { [k: string]: unknown } : T);
