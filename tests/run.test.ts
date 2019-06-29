import 'jest';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { joiSchemaParser, yamlToJoi, JoiSchema } from '../src/index';
import { excludeCircular } from '../src/utils';

interface TestCase {
  schema: JoiSchema;
  cases: { value: any; error: boolean }[];
}
const testInputPath = path.join(__dirname, './cases.yml');
const testInput: TestCase[] = yaml.load(fs.readFileSync(testInputPath, 'utf8'));

describe('Run parser', () => {
  it('api exists', () => {
    expect(yamlToJoi).toBeTruthy();
    expect(joiSchemaParser).toBeTruthy();
    expect(excludeCircular).toBeTruthy();
  });

  it('excludeCircular', () => {
    expect(() => {
      const circularObj = { circularObj: null };
      circularObj.circularObj = circularObj;
      excludeCircular(circularObj);
    }).toThrow(TypeError);

    expect(excludeCircular({})).toEqual({});
  });

  it('invalid input', () => {
    expect(() => joiSchemaParser(null!)).toThrow();
    expect(() => joiSchemaParser({} as any)).toThrow();
  });

  it('parse', () => {
    testInput.forEach(({ schema, cases }) => {
      const parsed = joiSchemaParser(schema);
      for (const item of cases) {
        const { error } = parsed.validate(item.value);
        if (!!error !== item.error) {
          console.log(yaml.dump(schema));
          console.log(yaml.dump(item));
          if (error) console.log(error.message);
        }
        expect(!!error).toBe(item.error);
      }
    });
  });

  it('yaml loader', () => {
    expect(() => {
      yamlToJoi(yaml.dump(testInput[0].schema));
    }).not.toThrow();
  });
});
