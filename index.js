const fs = require('fs');
const Yaml = require('yaml');
const Ajv = require("ajv");
const svg = require('./lib/svg');
const ddl = require('./lib/ddl');

exports.validate = (input) => {
  const data = Yaml.parse(input);
  const schema = Yaml.parse(fs.readFileSync("schema.yaml", { encoding: 'utf-8' }));
  const ajv = new Ajv(); 
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return [valid, valid ? data : validate.errors];
}

exports.render = (data, options) => {
  if (options.format === 'svg') {
    return svg.render(data, options);
  } else if (options.format === 'ddl') {
    return ddl.render(data, options);
  } else {
    throw `unknown format: ${options.format}`;
  }
}