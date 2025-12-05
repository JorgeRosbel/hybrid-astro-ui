import { folderExists } from "./folder_exists"
import { join } from "path"
import { writeFile, mkdir, readFile } from "fs/promises"
import chalk from "chalk"


const globals_css = `
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(99% 0.005 280);
  --foreground: oklch(18% 0.015 280);

  --primary: oklch(52% 0.18 250);
  --primary-foreground: oklch(99% 0.005 250);

  --secondary: oklch(98% 0.006 259.931);
  --secondary-foreground: oklch(22% 0.02 260);

  --muted: oklch(95% 0.008 270);
  --muted-foreground: oklch(50% 0.015 270);

  --accent: oklch(94% 0.025 200);
  --accent-foreground: oklch(20% 0.03 200);

  --border: oklch(90% 0.008 270);
  --input: oklch(92% 0.008 270);
  --ring: oklch(52% 0.18 250);

  --radius: 0.625rem;
}

.dark {
  --background: oklch(13% 0.01 280);
  --foreground: oklch(96% 0.008 280);

  --primary: oklch(68% 0.19 250);
  --primary-foreground: oklch(13% 0.01 250);

  --secondary: oklch(22% 0.015 260);
  --secondary-foreground: oklch(96% 0.01 260);

  --muted: oklch(20% 0.012 270);
  --muted-foreground: oklch(60% 0.015 270);

  --accent: oklch(25% 0.03 200);
  --accent-foreground: oklch(96% 0.01 200);

  --border: oklch(28% 0.015 270);
  --input: oklch(26% 0.015 270);
  --ring: oklch(68% 0.19 250);
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
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`

export const addGlobalsCss = async () => {
  const stylesFolderPath = join(process.cwd(), "src/styles");
  const globalsCssPath = join(stylesFolderPath, "global.css");

  // ───────────────────────────────────────────────
  // 1. Ensure that src/styles exists
  // ───────────────────────────────────────────────
  const stylesExists = await folderExists(stylesFolderPath);

  if (!stylesExists) {
    await mkdir(stylesFolderPath)
  }

  // ───────────────────────────────────────────────
  // 2. Read existing globals.css or create it
  // ───────────────────────────────────────────────
  let existingContent = "";
  const fileExists = await folderExists(globalsCssPath); // detects file too

  if (fileExists) {
    existingContent = await readFile(globalsCssPath, "utf-8");
  }

  // Build final content: keep user content, add ours below
  const finalContent =
    existingContent.trim().length > 0
      ? `${existingContent.trim()}\n\n${globals_css.trim()}\n`
      : `${globals_css.trim()}\n`;

  // ───────────────────────────────────────────────
  // 3. Write file
  // ───────────────────────────────────────────────
  await writeFile(globalsCssPath, finalContent, "utf-8");

  console.log(
    chalk.green("✔ Successfully updated ") +
      chalk.magenta("globals.css")
  );
};