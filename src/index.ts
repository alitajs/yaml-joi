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
  allowEmpty: Joi.alternatives(Joi.boolean(), 'null', 'nothing'),
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
        const args = excludeCircular(Array.isArray(item[1]) ? item[1] : [item[1]]);
        // @ts-ignore
        ret = ret[item[0]](...objToSchemaArgs(args));
      }
    }
  }
  switch (unparsed.allowEmpty) {
    case true:
      ret = Joi.alternatives(null, ret);
      break;
    case 'null':
      ret = Joi.alternatives(null, ret).required();
      break;
    case 'nothing':
      break;
    default:
      ret = ret.required();
      break;
  }
  return ret;
}

export function yamlToJoi(yaml: string, loadOpts?: Yaml.LoadOptions): Joi.Schema {
  return joiSchemaParser(Yaml.load(yaml, loadOpts));
}

export default yamlToJoi;
