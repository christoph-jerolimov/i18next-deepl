import chalk from 'chalk';

const colorize = {
  filename: chalk.yellow,
  language: chalk.cyan,
  key: chalk.blueBright,
  value: chalk.blue,
  number: chalk.green,
  percentage: (n: number) => {
    const s = `${Math.round(n * 1000) / 10} %`;
    if (n < 0.5) {
      return chalk.redBright(s);
    } else if (n < 1) {
      return chalk.yellowBright(s);
    } else if (n >= 1) {
      return chalk.greenBright(s);
    } else {
      return s;
    }
  },
};

export default colorize;
