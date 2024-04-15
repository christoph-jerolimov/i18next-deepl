import { Command } from 'commander';
import chalk from 'chalk';

const cmd = new Command();

cmd
  .name('helloworld')
  .action(() => {
    console.log(chalk.blue('Hello world!'));
  });

export default cmd;
