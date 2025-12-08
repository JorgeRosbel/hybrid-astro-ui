import { checkTsConfig } from '@/utils/check_tsconfig';
import { checkDependencies } from '@/utils/check_dependencies';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { folderExists } from '@/utils/folder_exists';
import { fail } from '@/utils/logs';
import { addGlobalsCss } from '@/utils/add_globals_css';
import chalk from 'chalk';
import boxen from 'boxen';

export const warnImportGlobalCss = () => {
  const message =
    chalk.yellow('Import the ') +
    chalk.magenta('globals.css') +
    chalk.yellow(' file in any layout or page where you use UI Elements components.\n') +
    chalk.yellow('We recommend adding it to a shared layout for consistent styling.\n\n') +
    chalk.cyan('Example (Astro layout):\n') +
    chalk.gray(`---
import "../styles/global.css";
---`);

  const box = boxen(message, {
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderColor: 'yellow',
    borderStyle: 'round',
  });

  console.log(box);
};

export const init = async () => {
  try {
    await checkTsConfig();
    console.log(chalk.green('✔ Successfully checked ') + chalk.magenta('tsconfig.json'));

    await checkDependencies();
    console.log(chalk.green('✔ Successfully checked ') + chalk.magenta('dependencies'));

    const utils = `import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cls(...args: ClassValue[]) {
    return twMerge(clsx(args))
}

import type { PaginateFunction } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

import type { collections } from '@/src/content/config';
type CollectionName = keyof typeof collections;

interface PaginationOptions {
    pageSize?: number;
    sortByFn?: ((a: CollectionEntry<CollectionName>, b: CollectionEntry<CollectionName>) => number);
    filterFn?: (post: CollectionEntry<CollectionName>) => boolean;
    collection: CollectionName
}


export function createCollectionPagination(options: PaginationOptions) {
    const {
        pageSize = 10,
        sortByFn ,
        filterFn,
        collection
    } = options;

    return async ({ paginate }: { paginate: PaginateFunction }) => {
        let items = await getCollection(collection);

        if (filterFn) {
            items = items.filter(filterFn);
        }

        if (sortByFn) {
            items = items.sort(sortByFn);
        } 

        return paginate(items, { pageSize });
    };
}

`;

    const libFolderPath = join(process.cwd(), 'src/lib');

    if (!(await folderExists(libFolderPath))) {
      await mkdir(libFolderPath);
    }

    await writeFile(join(libFolderPath, 'utils.ts'), utils);

    console.log(chalk.green('✔ Successfully added ') + chalk.magenta('lib/utils.ts'));

    await addGlobalsCss();

    warnImportGlobalCss();
  } catch (error) {
    fail(error as string);
    process.exit(1);
  }
};
