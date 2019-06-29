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
fs.writeFileSync('./temp.json', JSON.stringify(testInput), 'utf8');

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
        const hasErr = !!parsed.validate(item.value).error;
        expect(hasErr).toBe(item.error);
      }
    });
  });
});
