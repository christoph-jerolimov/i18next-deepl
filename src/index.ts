import { Command } from 'commander';

import { default as helloworld } from './helloworld.js';
import { default as count } from './count.js';

const cmd = new Command();

cmd
  .name('i18next-deepl')
  .description('CLI to translate i18next files with deepl');

cmd.addCommand(helloworld);
cmd.addCommand(count);

cmd.parse();
