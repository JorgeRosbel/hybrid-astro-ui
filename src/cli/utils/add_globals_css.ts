import { folderExists } from './folder_exists';
import { join } from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import chalk from 'chalk';

const globals_css = `
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(98.8% 0.006 290);
  --foreground: oklch(17% 0.018 285);

  --primary: oklch(50% 0.17 270);
  --primary-foreground: oklch(98.5% 0.004 270);

  --secondary: oklch(96% 0.01 285);
  --secondary-foreground: oklch(26% 0.02 285);

  --muted: oklch(94% 0.012 285);
  --muted-foreground: oklch(52% 0.018 285);

  --accent: oklch(92% 0.09 85);
  --accent-foreground: oklch(24% 0.05 85);

  --border: oklch(88% 0.012 285);
  --input: oklch(90% 0.012 285);
  --ring: oklch(50% 0.17 270);

  --radius: 0.625rem;

  --destructive: oklch(58% 0.21 25);
  --destructive-foreground: oklch(98% 0.004 25);
}

.dark {
  --background: oklch(14% 0.012 285);
  --foreground: oklch(96% 0.01 285);

  --primary: oklch(64% 0.18 270);
  --primary-foreground: oklch(14% 0.01 270);

  --secondary: oklch(22% 0.016 285);
  --secondary-foreground: oklch(94% 0.012 285);

  --muted: oklch(20% 0.014 285);
  --muted-foreground: oklch(62% 0.02 285);

  --accent: oklch(32% 0.09 85);
  --accent-foreground: oklch(96% 0.01 85);

  --border: oklch(28% 0.016 285);
  --input: oklch(26% 0.016 285);
  --ring: oklch(70% 0.18 270);

  --destructive: oklch(48% 0.19 25);
  --destructive-foreground: oklch(96% 0.008 25);
}


@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;

export const addGlobalsCss = async () => {
  const stylesFolderPath = join(process.cwd(), 'src/styles');
  const globalsCssPath = join(stylesFolderPath, 'global.css');

  // ───────────────────────────────────────────────
  // 1. Ensure that src/styles exists
  // ───────────────────────────────────────────────
  const stylesExists = await folderExists(stylesFolderPath);

  if (!stylesExists) {
    await mkdir(stylesFolderPath);
  }

  // ───────────────────────────────────────────────
  // 2. Read existing globals.css or create it
  // ───────────────────────────────────────────────
  let existingContent = '';
  const fileExists = await folderExists(globalsCssPath); // detects file too

  if (fileExists) {
    existingContent = await readFile(globalsCssPath, 'utf-8');
  }

  // Build final content: keep user content, add ours below
  const finalContent =
    existingContent.trim().length > 0
      ? `${existingContent.trim()}\n\n${globals_css.trim()}\n`
      : `${globals_css.trim()}\n`;

  // ───────────────────────────────────────────────
  // 3. Write file
  // ───────────────────────────────────────────────
  await writeFile(globalsCssPath, finalContent, 'utf-8');

  console.log(chalk.green('✔ Successfully updated ') + chalk.magenta('globals.css'));
};
