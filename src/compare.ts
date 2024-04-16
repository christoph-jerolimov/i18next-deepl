import { Command } from 'commander';
import fs from 'node:fs/promises';
import { default as colorize } from './colorize.js';

interface Options {
  sourceLanguage: string;
  sourceFilename: string;
  targetLanguage: string;
  targetFilename: string;
}

const cmd = new Command();

cmd
  .name('compare')
  .requiredOption('--source-language <string>')
  .requiredOption('--source-filename <string>')
  .requiredOption('--target-language <string>')
  .requiredOption('--target-filename <string>')
  .action(async (options: Options) => {
    //
    // Source
    //
    let translations = 0;
    const sourceText = await fs.readFile(options.sourceFilename, { encoding: 'utf-8' });
    const sourceJson = JSON.parse(sourceText);
    for (const property in sourceJson) {
      if (!Object.hasOwn(sourceJson, property)) {
        continue;
      }
      translations++;
    }

    //
    // Target
    //
    let translatedInSource = 0;
    let translatedNotInSource = 0;
    let targetJson: Record<string, string>;
    try {
      const targetText = await fs.readFile(options.targetFilename, { encoding: 'utf-8' });
      targetJson = JSON.parse(targetText);
    } catch (error: any) {
      console.log(
        ' ',
        colorize.language(options.targetLanguage),
        colorize.filename(options.targetFilename),
        '- error:',
        error.code ?? error.message ?? error,
      );
      return;
    }

    for (const property in targetJson) {
      if (!Object.hasOwn(targetJson, property)) {
        continue;
      }
      if (sourceJson[property]) {
        translatedInSource++;
      } else {
        translatedNotInSource++;
      }
      // console.log(`- ${colorize.key(property)}: ${colorize.value(targetJson[property])}`);
    }
    console.log(
      ' ',
      colorize.language(options.targetLanguage),
      colorize.filename(options.targetFilename),
      '- translations:',
      `${colorize.number(translatedInSource)} of ${colorize.number(translations)}`,
      `(${colorize.percentage(translatedInSource / translations)})`,
      translatedNotInSource ? ` other translations: ${colorize.number(translatedNotInSource)}` : '',
      translatedNotInSource ? `(${colorize.percentage(translatedNotInSource / translations)})` : '',
    );
  });

export default cmd;
