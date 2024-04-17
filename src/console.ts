import { Command } from 'commander';
import { glob } from 'glob';
import path from 'node:path';
import { default as count } from './count.js';
import { default as compare } from './compare.js';
import { default as translate } from './translate.js';

const cmd = new Command();

interface Options {
}

cmd
  .name('console')
  .argument('[console-folder]', '', '../../openshift/console')
  .action(async (consoleFolder, options: Options) => {
    console.log(consoleFolder, options)

    // TODO
    const sourceLanguage = 'en';
    const targetLanguages = ['ja', 'ko', 'zh', 'de'];

    const sourceFolders = await glob(['frontend/public/locales', 'frontend/packages/*/locales'], {
      cwd: consoleFolder,
    });

    for (const sourceFolder of sourceFolders) {
      // console.log(sourceFolder)
      const sourceFilenames = await glob('*.json', {
        cwd: path.join(consoleFolder, sourceFolder, 'en'),
      });

      for (const sourceFilename of sourceFilenames) {
        // console.log(sourceFilename)
        await count.parseAsync(
          [
            '--language', 'en',
            '--filename', path.join(consoleFolder, sourceFolder, sourceLanguage, sourceFilename),
          ],
          { from: 'user' },
        );

        // Target
        for (const targetLanguage of targetLanguages) {
          await compare.parseAsync(
            [
              '--source-language', 'en',
              '--source-filename', path.join(consoleFolder, sourceFolder, sourceLanguage, sourceFilename),
              '--target-language', targetLanguage,
              '--target-filename', path.join(consoleFolder, sourceFolder, targetLanguage, sourceFilename),
            ],
            { from: 'user' },
          );
        }

        // WIP: Translate DE only
        const sourceFilename1 = path.join(consoleFolder, sourceFolder, 'en', sourceFilename);
        const targetFilename2 = sourceFilename1.replace('/en/', '/de/');
        await translate.parseAsync(
          [
            '--source-language', 'en',
            '--source-filename', sourceFilename1,
            '--target-language', 'de',
            '--target-filename', targetFilename2,
          ],
          { from: 'user' },
        );
      }
    }
  });

export default cmd;
