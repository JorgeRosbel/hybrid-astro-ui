import { writeFile, readdir } from 'fs/promises';
import path from 'node:path';
import { join } from 'node:path';

const createSchema = (name: string) => {
  const schema = `{
  "name": "${name}",
  "files": [
    { "from": "${name}.astro", "to": "src/components/hybrid-astro-ui/${name}/${name}.astro" },
    { "from": "index.ts", "to": "src/components/hybrid-astro-ui/${name}/index.ts" }
  ]
}`;

  return schema;
};

type Files = { from: string; to: string };

interface Schema {
  name: string;
  files: Files[];
}

export const buildJSONComponent = async () => {
  const baseDir = join(process.cwd(), 'registry');

  const folders = await readdir(baseDir, { withFileTypes: true });

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;

    const folderPath = path.join(baseDir, folder.name);
    const files = await readdir(folderPath);

    const json_body: Schema = {
      name: '',
      files: [{ from: 'index.ts', to: `src/components/hybrid-astro-ui/${folder.name}/index.ts` }],
    };

    for (const file of files) {
      const cleanName = file.split('.')[0];

      if (cleanName !== 'index' && cleanName !== 'component') {
        json_body.name = cleanName;
        json_body.files.push({
          from: `${cleanName}.astro`,
          to: `src/components/hybrid-astro-ui/${folder.name}/${cleanName}.astro`,
        });
      }
    }

    await writeFile(join(folderPath, 'component.json'), JSON.stringify(json_body, null, 2));
  }
};

buildJSONComponent();
