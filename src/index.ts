import { Command } from 'commander';
import dotenv from 'dotenv';

import { default as compare } from './compare.js';
import { default as console } from './console.js';
import { default as count } from './count.js';
import { default as translate } from './translate.js';

dotenv.config({
  path: ['.env.local', '.env'],
});

const cmd = new Command();

cmd
  .name('i18next-deepl')
  .description('CLI to translate i18next files with deepl');

cmd.addCommand(compare);
cmd.addCommand(console);
cmd.addCommand(count);
cmd.addCommand(translate);

cmd.parse();
