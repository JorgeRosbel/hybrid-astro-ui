import { mkdir, writeFile, readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { created, fail } from '@/utils/logs';
import { fileURLToPath } from 'url';
import { checkTsConfig } from '@/utils/check_tsconfig';
import { folderExists } from '@/utils/folder_exists';

async function loadComponentFiles(componentPath: string) {
  const files = await readdir(componentPath);

  const result = await Promise.all(
    files.map(async filename => {
      const fullPath = join(componentPath, filename);
      const file_content = await readFile(fullPath, 'utf-8');

      return {
        filename,
        file_content,
      };
    })
  );

  return result;
}

const creation_workflow = async (component: string) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const componentPath = join(__dirname, 'hybrid-astro-ui', component);

  if (!folderExists(componentPath)) {
    fail(`Component ${component} does not exist`);
    process.exit(1);
  }

  const componentsPath = join(process.cwd(), 'src/components');
  const uiElementsPath = join(process.cwd(), 'src/components', 'hybrid-astro-ui');

  const componentFolderExists = await folderExists(componentsPath);
  const uiElementsFolderExists = await folderExists(uiElementsPath);

  if (!componentFolderExists) {
    await mkdir(componentsPath);
  }

  if (!uiElementsFolderExists) {
    await mkdir(uiElementsPath);
  }

  const files = await loadComponentFiles(componentPath);

  if (await folderExists(join(uiElementsPath, component))) {
    fail(
      `This component: ${component} already exists inside ./src/components/hybrid-astro-ui/. Duplicate components are not allowed.`
    );
    process.exit(1);
  }

  await mkdir(join(uiElementsPath, component));

  await Promise.all(
    files.map(file => writeFile(join(uiElementsPath, component, file.filename), file.file_content))
  );

  created(component);
};

export const add = async () => {
  try {
    await checkTsConfig();
    const selected_components = process.argv.slice(3, process.argv.length);

    if (!selected_components) {
      fail('Missing component name!');
      process.exit(1);
    }

    await Promise.all(selected_components.map(component => creation_workflow(component)));
  } catch (error) {
    fail(error as string);
    process.exit(1);
  }
};
