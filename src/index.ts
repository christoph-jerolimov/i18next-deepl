import { Command } from 'commander';

import { default as helloworld } from './helloworld.js';

const cmd = new Command();

cmd
  .name('i18next-deepl')
  .description('CLI to translate i18next files with deepl');

cmd.addCommand(helloworld);

cmd.parse();
