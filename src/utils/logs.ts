import chalk from 'chalk';
import boxen from 'boxen';

export const created = (name: string) => {
  console.log(
    boxen(chalk.green(`🌟 Successfully added: ${chalk.magenta(`${name}`)} component 🌟`), {
      padding: 1,
      borderColor: 'magenta',
    })
  );
};

export const success = (content: string) => {
  console.log(boxen(chalk.green(`🌟 ${content} 🌟`), { padding: 1, borderColor: 'green' }));
};

export const fail = (content: string) => {
  console.log(boxen(chalk.red(`🌟 ${content} 🌟`), { padding: 1, borderColor: 'red' }));
};

export const warn = (content: string) => {
  console.log(boxen(chalk.yellow(`🌟 ${content} 🌟`), { padding: 1, borderColor: 'yellow' }));
};
