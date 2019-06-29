import Joi from 'joi';
import Yaml from 'js-yaml';
import { JoiSchema, JoiSchemaTypeName } from './types';
import { excludeCircular } from './utils';

export * from './types';

function objToSchemaArgs(obj: any) {
  if (typeof obj !== 'object' || !obj) return obj;
  if (obj.isSchema) return joiSchemaParser(obj as JoiSchema);
  Object.keys(obj).forEach(k => (obj[k] = objToSchemaArgs(obj[k])));
  return obj;
}

const schemaValidTypeName: JoiSchemaTypeName[] = [
  'array',
  'binary',
  'boolean',
  'date',
  'number',
  'object',
  'string',
];

const schemaValidator = Joi.object({
  allowNull: Joi.boolean(),
  isSchema: Joi.boolean(),
  limitation: Joi.array(),
  type: Joi.string()
    .equal(...schemaValidTypeName)
    .required(),
});

/**
 * Convert object to `Joi.Schema` which is easy to execute.
 */
export function joiSchemaParser(unparsed: JoiSchema): Joi.Schema {
  const { error } = schemaValidator.validate(unparsed);
  if (error) throw new Error(`[joiSchemaParser] :\t\n${error.message}`);
  let ret: Joi.Schema = Joi[unparsed.type]();
  if (unparsed.limitation) {
    for (const step of unparsed.limitation) {
      const entries = Object.entries(step);
      for (const item of entries) {
        item[1] = objToSchemaArgs(excludeCircular(Array.isArray(item[1]) ? item[1] : [item[1]]));
        ret = (ret[item[0] as keyof typeof step] as Function)(...item[1]);
      }
    }
  }
  if (unparsed.allowNull !== false) {
    ret = Joi.alternatives(null, ret);
  }
  return ret;
}

export function yamlToJoi(yaml: string, loadOpts: Yaml.LoadOptions): Joi.Schema {
  return joiSchemaParser(Yaml.load(yaml, loadOpts));
}

export default yamlToJoi;
