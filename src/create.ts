import { Command } from 'commander';
import { glob } from 'glob'
import fs from 'node:fs/promises';
import path from 'node:path'; 
import { default as colorize } from './colorize.js';

const cmd = new Command();

const sourceLanguage = 'en';
const targetLanguages = [
  'de',
  'fr',
  'es',
  'hi',
  'ja',
  'zh-cn',
  'ko',
];

cmd
  .name('count')
  .action(async () => {
    const sourceFilenames = await glob(`**/${sourceLanguage}.json`)

    for (const sourceFilename of sourceFilenames) {
      let translations = 0;

      console.log('Source:', colorize.filename(sourceFilename), '...');

      const sourceText = await fs.readFile(sourceFilename, { encoding: 'utf-8' });
      const sourceJson = JSON.parse(sourceText);

      for (const property in sourceJson) {
        if (!Object.hasOwn(sourceJson, property)) {
          continue;
        }
        translations++;
        console.log(`- ${colorize.key(property)}: ${colorize.value(sourceJson[property])}`);
      }
      console.log();

      for (const targetLanguage of targetLanguages) {
        const targetFilename = path.join(sourceFilename, `../${targetLanguage}.json`);

        let translated = 0;
        let targetJson: Record<string, string>;

        console.log('Target:', colorize.filename(targetFilename));

        try {
          const targetText = await fs.readFile(targetFilename, { encoding: 'utf-8' });
          targetJson = JSON.parse(targetText);
        } catch (error) {
          console.log(
            `Translated from ${colorize.language(sourceLanguage)} to ${colorize.language(targetLanguage)}:`,
            error,
          );
          continue;
        }
  
        for (const property in targetJson) {
          if (!Object.hasOwn(targetJson, property)) {
            continue;
          }
          translated++;
          console.log(`- ${colorize.key(property)}: ${colorize.value(targetJson[property])}`);
        }
        console.log();
        console.log(
          `Translated from ${colorize.language(sourceLanguage)} to ${colorize.language(targetLanguage)}:`,
          `${colorize.number(translated)} of ${colorize.number(translations)}`,
          `(${colorize.percentage(translated / translations)})`);
        console.log();
      }
    }
  });

export default cmd;
