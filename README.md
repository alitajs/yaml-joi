# yaml-joi

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

See more example at [cases.yml](https://github.com/alitajs/yaml-joi/blob/master/tests/cases.yml).
