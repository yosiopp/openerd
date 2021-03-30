#!/usr/bin/env node
const fs = require('fs');
const openerd = require('../index');

let procno = 0;

(async () => {
  try {
    // 起動パラメタのパース -> options
    procno = 1;
    const [options, context] = parseArguments(process.argv);
    if (context) {
      console.log(context.output);
      if (context.exit) {
        return;
      }
    }

    // 入力の取得
    procno = 2;
    const input = getInput(options);
    
    // yamlの検証
    procno = 3;
    const [ret, data] = openerd.validate(input);
    if (!ret) {
      // 検証エラー
      throw { message: 'validate error', data };
    }
    
    // render
    procno = 4;
    const output = openerd.render(data, options);

    // 出力
    procno = 5;
    if (options.output === 'file') {
      // file出力
    } else {
      // 標準出力
      console.log(output);
    }
    
  } catch(e) {
    console.error(procno, e);
    process.exit(procno);
  }
})();

function parseArguments(argv) {
  const options = {
    input: 'stdin',
    output: 'stdout',
    format: 'svg',
  };
  if (argv.length > 2) {
    // オプション処理
  }
  return [options, null];
}

function getInput(options) {
  return `
openerd: 1.0.0
info:
  title: test
`;

  if (options.input === 'stdin' || options.input === '-') {
    // TODO 標準入力
  } else {
    // ファイル入力
    return fs.readFileSync(options.input, { encoding: 'utf-8' });
  }
}