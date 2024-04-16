import { Command } from 'commander';
import fs from 'node:fs/promises';
import { default as colorize } from './colorize.js';

interface Options {
  language: string;
  filename: string;
}

const cmd = new Command();

cmd
  .name('count')
  .requiredOption('--language <string>')
  .requiredOption('--filename <string>')
  .action(async (options: Options) => {
    let translations = 0;

    const sourceText = await fs.readFile(options.filename, { encoding: 'utf-8' });
    const sourceJson = JSON.parse(sourceText);
    for (const property in sourceJson) {
      if (!Object.hasOwn(sourceJson, property)) {
        continue;
      }
      // console.log(`- ${colorize.key(property)}: ${colorize.value(sourceJson[property])}`);
      translations++;
    }
    console.log(
      ' ',
      colorize.language(options.language),
      colorize.filename(options.filename),
      '- translations:',
      colorize.number(translations),
    );
  });

export default cmd;
