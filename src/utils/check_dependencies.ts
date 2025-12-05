import { readFile } from "fs/promises";
import { join } from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { execSync } from "child_process";

export const checkDependencies = async () => {
  const path = join(process.cwd(), "package.json");
  const raw = await readFile(path, "utf-8");
  const pkg = JSON.parse(raw);

  const deps = {
    normal: ["@lucide/astro", "tailwind-merge", "clsx"],
    tailwind: "tailwindcss"
  };

  const installed = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  const missingNormal: string[] = [];
  let missingTailwind = false;

  // Detect normal deps
  for (const dep of deps.normal) {
    if (!installed[dep]) missingNormal.push(dep);
  }

  // Detect Tailwind
  if (!installed["tailwindcss"]) {
    missingTailwind = true;
  }

  // If nothing missing → exit silently
  if (missingNormal.length === 0 && !missingTailwind) {
    return;
  }

  // ───────────────────────────────────────────────
  // Ask for package manager
  // ───────────────────────────────────────────────
  const { pkgManager } = await inquirer.prompt([
    {
      type: "list",
      name: "pkgManager",
      message: "Which package manager do you want to use?",
      choices: ["pnpm", "npm", "yarn", "bun"],
      default: "pnpm"
    }
  ]);

  // ───────────────────────────────────────────────
  // Build dynamic install commands
  // ───────────────────────────────────────────────
  let installCmd = "";
  let tailwindCmd = "";

  switch (pkgManager) {
    case "pnpm":
      if (missingNormal.length > 0) installCmd = `pnpm add ${missingNormal.join(" ")}`;
      if (missingTailwind) tailwindCmd = `pnpm astro add tailwind`;
      break;

    case "npm":
      if (missingNormal.length > 0) installCmd = `npm install ${missingNormal.join(" ")}`;
      if (missingTailwind) tailwindCmd = `npx astro add tailwind`;
      break;

    case "yarn":
      if (missingNormal.length > 0) installCmd = `yarn add ${missingNormal.join(" ")}`;
      if (missingTailwind) tailwindCmd = `yarn astro add tailwind`;
      break;

    case "bun":
      if (missingNormal.length > 0) installCmd = `bun add ${missingNormal.join(" ")}`;
      if (missingTailwind) tailwindCmd = `bunx astro add tailwind`;
      break;
  }

  // Tailwind always last
  let finalCommand = installCmd;
  if (tailwindCmd) {
    if (finalCommand) finalCommand += " && ";
    finalCommand += tailwindCmd;
  }

  // ───────────────────────────────────────────────
  // Show missing dependencies
  // ───────────────────────────────────────────────
  console.log(chalk.cyan("\nMissing dependencies for ui-elements:\n"));

  if (missingNormal.length > 0) {
    console.log(chalk.yellow("• Missing:"));
    missingNormal.forEach(dep => console.log("  - " + chalk.red(dep)));
  }

  if (missingTailwind) {
    console.log(chalk.yellow("\n• Missing Tailwind:"));
    console.log("  - " + chalk.red("tailwindcss"));
  }

  console.log(
    chalk.cyan("\nInstall command:\n") +
    chalk.green(finalCommand) +
    "\n"
  );

  // ───────────────────────────────────────────────
  // Ask confirmation
  // ───────────────────────────────────────────────
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Install the missing dependencies?",
      default: true
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow("✖ Dependencies were not installed."));
    return;
  }

  // Execute command
  try {
    console.log(chalk.cyan("\nInstalling...\n"));
    execSync(finalCommand, { stdio: "inherit" });
    console.log(chalk.green("\n✔ Dependencies installed successfully.\n"));
  } catch (err) {
    console.log(chalk.red("\n✖ Failed to install dependencies.\n"));
  }
};
