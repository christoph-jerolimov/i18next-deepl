import { Command } from 'commander';
import fs from 'node:fs/promises';
import path from 'node:path'; 
import * as deepl from "deepl-node";
import { default as colorize } from './colorize.js';
import { default as utils } from './utils.js';

interface Options {
  sourceLanguage: deepl.SourceLanguageCode;
  sourceFilename: string;
  targetLanguage: deepl.TargetLanguageCode;
  targetFilename: string;
}

const cmd = new Command();

cmd
  .name('translate')
  .requiredOption('--source-language <string>')
  .requiredOption('--source-filename <string>')
  .requiredOption('--target-language <string>')
  .requiredOption('--target-filename <string>')
  .action(async (options: Options) => {
    //
    // Source
    //
    let translations = 0;

    console.log('Source:', colorize.filename(options.sourceFilename), '...');

    const sourceText = await fs.readFile(options.sourceFilename, { encoding: 'utf-8' });
    const sourceJson = JSON.parse(sourceText);

    for (const property in sourceJson) {
      if (!Object.hasOwn(sourceJson, property)) {
        continue;
      }
      translations++;
      // console.log(`- ${colorize.key(property)}: ${colorize.value(sourceJson[property])}`);
    }
    console.log();

    let oldTargetJson: Record<string, string> = {};
    const newTargetJson: Record<string, string> = {};

    const authKey = process.env["DEEPL_AUTH_KEY"];
    const serverUrl = process.env["DEEPL_SERVER_URL"];
    if (!authKey) {
      throw new Error("DEEPL_AUTH_KEY environment variable not defined");
    }
    const translator = new deepl.Translator(authKey, { serverUrl });
    const translateOptions: deepl.TranslateTextOptions = {};

    const t = (text: string) => translator.translateText(
      text,
      options.sourceLanguage,
      options.targetLanguage,
      translateOptions,
    );

    let translationUnchanged = 0;
    let translated = 0;
    console.log('Target:', colorize.filename(options.targetFilename));

    try {
      const targetText = await fs.readFile(options.targetFilename, { encoding: 'utf-8' });
      oldTargetJson = JSON.parse(targetText);
    } catch (error: any) {
      console.log(
        `Translated from ${colorize.language(options.sourceLanguage)} to ${colorize.language(options.targetLanguage)}:`,
        error.code ?? error.message ?? error,
      );
    }

    for (const property in sourceJson) {
      if (!Object.hasOwn(sourceJson, property)) {
        continue;
      }
      if (oldTargetJson[property]) {
        console.log("KEEP:", colorize.key(property), "=>", colorize.value(oldTargetJson[property]));
        newTargetJson[property] = oldTargetJson[property];
        translationUnchanged++;
        continue;
      }
      const text = sourceJson[property];
      const htmlString = utils.mustachToHtml(text);
      const result = await t(htmlString);
      const mustachString = utils.htmlToMustach(result.text);
      console.log(colorize.key(property), "=>", text, "=>", htmlString, "=>", result.text, "=>", colorize.value(mustachString));
      newTargetJson[property] = mustachString;
      translated++;
    }

    try {
      await fs.mkdir(path.dirname(options.targetFilename));
    } catch (error) {
      // ignore
    }
    await fs.writeFile(options.targetFilename, JSON.stringify(newTargetJson, null, 2));

    console.log();
    console.log(
      `Translated from ${colorize.language(options.sourceLanguage)} to ${colorize.language(options.targetLanguage)}:`,
      `${colorize.number(translationUnchanged + translated)} of ${colorize.number(translations)}`,
      `(${colorize.percentage((translationUnchanged + translated) / translations)})`,
      ` new translations: ${colorize.number(translated)}`,
    );
    console.log();
});

export default cmd;
