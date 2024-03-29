# yaml-joi

[![Alita](https://img.shields.io/badge/alitajs-yaml%20joi-blue.svg)](https://github.com/alitajs/yaml-joi)
[![NPM version](https://img.shields.io/npm/v/yaml-joi.svg?style=flat)](https://npmjs.org/package/yaml-joi)
[![NPM downloads](http://img.shields.io/npm/dm/yaml-joi.svg?style=flat)](https://npmjs.org/package/yaml-joi)
[![Build Status](https://travis-ci.com/alitajs/yaml-joi.svg?branch=master)](https://travis-ci.com/alitajs/yaml-joi)
[![Coverage Status](https://coveralls.io/repos/github/alitajs/yaml-joi/badge.svg?branch=master)](https://coveralls.io/github/alitajs/yaml-joi?branch=master)
[![License](https://img.shields.io/npm/l/yaml-joi.svg)](https://npmjs.org/package/yaml-joi)

Parse string in [yaml](https://yaml.org/) format into [Joi](https://github.com/hapijs/joi) validator.

## Install

```bash
$ npm install yaml-joi
or
$ yarn add yaml-joi
```

## Example

```js
import yamlToJoi from 'yaml-joi';

const yamlLoadOpts = {};
const yamlSchema = `
type: string
allowEmpty: true
limitation:
  - min: 3
  - max: 5
  - regex: !!js/regexp /^(\S*)$/
`;

const validator = yamlToJoi(yamlSchema, yamlLoadOpts);
validator.validate(null).error === null;
validator.validate('a').error !== null;
validator.validate('abc').error === null;
validator.validate('a b c').error !== null;
validator.validate('abcdef').error !== null;
```

```js
import yamlToJoi from 'yaml-joi';

const yamlSchema = `
type: object
limitation:
  - keys:
      name:
        isSchema: true
        type: string
        allowEmpty: nothing
        limitation:
          - min: 5
          - max: 24
`;

const validator = yamlToJoi(yamlSchema);
validator.validate({}).error === null;
validator.validate({ name: 'str' }).error !== null;
validator.validate({ name: 'Alita' }).error === null;
```

Get more at [cases.yml](https://github.com/alitajs/yaml-joi/blob/master/tests/cases.yml).

### Used for model definition

- Define: [alitajs/notification/app/model/chat.ts#L50-L86](https://github.com/alitajs/notification/blob/67f5130b6a7ec02c891f5934296eb7ae7ad498ad/app/model/chat.ts#L50-L86)

```ts
export const DefineChat: DefineModel<Chat> = {
  Attr: {
    chatId: {
      type: CHAR(22),
      allowNull: false,
    },
    ...
  },
  Sample: {
    chatId: 'abcdefghijklmnopqrstuv',
    ...
  },
  Validator: yamlJoi(`
    type: object
    isSchema: true
    limitation:
      - keys:
          chatId:
            type: string
            isSchema: true
            limitation:
              - length: 22
              - token: []
          ...
```

- Utils: [alitajs/notification/app/utils/index.ts#L80-L92](https://github.com/alitajs/notification/blob/67f5130b6a7ec02c891f5934296eb7ae7ad498ad/app/utils/index.ts#L80-L92)

```ts
export function validate<T>(instance: T, validator: Schema): T {
  const { error, value } = validator.validate(instance);
  if (error) throw error;
  return value;
}

export function validateModel<T>(define: DefineModel<T>, attrs: Partial<T>): T {
  return validate({ ...define.Sample, ...attrs }, define.Validator);
}

export function validateAttr<T, U>(define: DefineModel<T>, attrs: U): U {
  return pick(validateModel(define, attrs), ...Object.keys(attrs)) as U;
}
```

- Validate attributes: [alitajs/notification/app/service/chat.ts#L27-L28](https://github.com/alitajs/notification/blob/master/app/service/chat.ts#L27-L28)

```ts
export default class ChatService extends Service {
  ...
  public getAllAccountChats(accountId: string) {
    const where = validateAttr(DefineChat, { accountId });
    return this.ctx.model.Chat.findAll({ where });
  }
  ...
}
```
