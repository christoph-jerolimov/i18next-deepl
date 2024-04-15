import { Command } from 'commander';
import { glob } from 'glob'
import fs from 'node:fs/promises';
import path from 'node:path'; 
import * as deepl from "deepl-node";
import { default as colorize } from './colorize.js';
import { default as utils } from './utils.js';

const cmd = new Command();

const sourceLanguage: deepl.SourceLanguageCode = 'en';
const targetLanguages: deepl.TargetLanguageCode[] = [
  'de',
  'fr',
  'es',
  // 'hi',
  'ja',
  'zh',
  'ko',
];

cmd
  .name('translate')
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
        let oldTargetJson: Record<string, string> = {};
        const newTargetJson: Record<string, string> = {};

        const authKey = process.env["DEEPL_AUTH_KEY"];
        const serverUrl = process.env["DEEPL_SERVER_URL"];
        if (!authKey) {
          throw new Error("DEEPL_AUTH_KEY environment variable not defined");
        }
        const translator = new deepl.Translator(authKey, { serverUrl });
        const options: deepl.TranslateTextOptions = {
        }
        
        const t = (text: string) => translator.translateText(
          text,
          sourceLanguage,
          targetLanguage,
          options,
        );

        let translationUnchanged = 0;
        let translated = 0;
        console.log('Target:', colorize.filename(targetFilename));

        try {
          const targetText = await fs.readFile(targetFilename, { encoding: 'utf-8' });
          oldTargetJson = JSON.parse(targetText);
        } catch (error) {
          console.log(
            `Translated from ${colorize.language(sourceLanguage)} to ${colorize.language(targetLanguage)}:`,
            error,
          );
          continue;
        }
  
        for (const property in sourceJson) {
          if (!Object.hasOwn(sourceJson, property)) {
            continue;
          }
          if (oldTargetJson[property]) {
            console.log("KEEP:", property, "=>", oldTargetJson[property]);
            newTargetJson[property] = oldTargetJson[property];
            translationUnchanged++;
            continue;
          }
          const text = sourceJson[property];
          const htmlString = utils.mustachToHtml(text);
          const result = await t(htmlString);
          const mustachString = utils.htmlToMustach(result.text);
          console.log(text, "=>", htmlString, "=>", result.text, "=>", mustachString);
          newTargetJson[property] = mustachString;
          translated++;
        }

        fs.writeFile(targetFilename, JSON.stringify(newTargetJson, null, 2));

        console.log();
        console.log(
          `Translated from ${colorize.language(sourceLanguage)} to ${colorize.language(targetLanguage)}:`,
          `${colorize.number(translationUnchanged + translated)} of ${colorize.number(translations)}`,
          `(${colorize.percentage((translationUnchanged + translated) / translations)})`,
          ` new translations: ${colorize.number(translated)}`,
        );
        console.log();
      }
    }
  });

export default cmd;
