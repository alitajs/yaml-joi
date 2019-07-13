import Joi from 'joi';
import Yaml from 'js-yaml';
import { JoiSchema, JoiSchemaTypeName, YamlJoiSchema } from './types';
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
export function joiSchemaParser(unparsed: JoiSchema): YamlJoiSchema {
  const { error } = schemaValidator.validate(unparsed);
  if (error) throw new Error(`[joiSchemaParser] :\t\n${error.message}`);
  let joiSchema: Joi.Schema = Joi[unparsed.type]();
  if (unparsed.limitation) {
    for (const step of unparsed.limitation) {
      const entries = Object.entries(step);
      for (const item of entries) {
        const args = excludeCircular(Array.isArray(item[1]) ? item[1] : [item[1]]);
        // @ts-ignore
        joiSchema = joiSchema[item[0]](...objToSchemaArgs(args));
      }
    }
  }
  switch (unparsed.allowEmpty) {
    case true:
      joiSchema = Joi.alternatives(null, joiSchema);
      break;
    case 'null':
      joiSchema = Joi.alternatives(null, joiSchema).required();
      break;
    case 'nothing':
      break;
    default:
      joiSchema = joiSchema.required();
      break;
  }
  const ret = joiSchema as YamlJoiSchema;
  ret.load = unparsed;
  return ret;
}

export function yamlToJoi(yaml: string, loadOpts?: Yaml.LoadOptions): YamlJoiSchema {
  return joiSchemaParser(Yaml.load(yaml, loadOpts));
}

export default yamlToJoi;
