import { program } from 'commander';
import { add } from '@/cli/commands/add';
import { init } from '@/cli/commands/init';

program.name('ui-elements');

program.command('add').action(() => {
  add();
});

program.command('init').action(() => {
  init();
});

process.on('unhandledRejection', error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});

program.parse(process.argv);
