import { join } from 'path';
import { created, fail } from '@/utils/logs';
import { checkTsConfig } from '@/utils/check_tsconfig';
import { folderExists } from '@/utils/folder_exists';
import fs from 'node:fs/promises';

const REGISTRY_BASE =
  'https://raw.githubusercontent.com/JorgeRosbel/hybrid-astro-ui/registry/registry';

async function addFromGitHub(name: string) {
  try {
    const uiElementsPath = join(process.cwd(), 'src/components', 'hybrid-astro-ui');

    if (await folderExists(join(uiElementsPath, name))) {
      fail(
        `This component: ${name} already exists inside ./src/components/hybrid-astro-ui/. Duplicate components are not allowed.`
      );
      process.exit(1);
    }

    const jsonUrl = `${REGISTRY_BASE}/${name}/component.json`;

    // 1) Cargar JSON del componente
    const metaResp = await fetch(jsonUrl);
    if (!metaResp.ok) throw new Error(`No encontrado: ${jsonUrl}`);

    const meta = await metaResp.json();

    console.log(`→ Instalando componente: ${meta.name}`);

    // 2) Descargar cada archivo
    for (const file of meta.files) {
      const fileUrl = `${REGISTRY_BASE}/${name}/${file.from}`;
      const destPath = file.to;

      const fileResp = await fetch(fileUrl);

      if (!fileResp.ok) {
        throw new Error(`Error descargando: ${fileUrl}`);
      }

      const content = await fileResp.text();

      await fs.mkdir(destPath.split('/').slice(0, -1).join('/'), {
        recursive: true,
      });

      await fs.writeFile(destPath, content);

      console.log(`✔ Guardado: ${destPath}`);
    }

    created(name);
  } catch (e) {
    console.error(`❌ Error: ${e}`);
  }
}

export const add = async () => {
  try {
    await checkTsConfig();
    const selected_components = process.argv.slice(3, process.argv.length);

    if (!selected_components) {
      fail('Missing component name!');
      process.exit(1);
    }

    await Promise.all(selected_components.map(component => addFromGitHub(component)));
  } catch (error) {
    fail(error as string);
    process.exit(1);
  }
};
