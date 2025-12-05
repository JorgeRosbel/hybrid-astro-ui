import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import inquirer from "inquirer";
import chalk from "chalk";

export const checkTsConfig = async () => {
    const path = join(process.cwd(), "tsconfig.json");
    const raw = await readFile(path, "utf-8");
    const json = JSON.parse(raw);

    const original = JSON.parse(JSON.stringify(json));

    if (!json.compilerOptions) json.compilerOptions = {};
    if (!json.compilerOptions.baseUrl) json.compilerOptions.baseUrl = ".";
    if (!json.compilerOptions.paths) json.compilerOptions.paths = {};
    if (!json.compilerOptions.paths["@/*"]) json.compilerOptions.paths["@/*"] = ["./*"];


    if (JSON.stringify(original) === JSON.stringify(json)) {
        //console.log(chalk.green("✔ tsconfig.json is already correctly configured."));
        return;
    }


    console.log(chalk.cyan("\nProposed modifications to tsconfig.json:\n"));

    const newConfigStr = JSON.stringify(json, null, 2).split("\n");
    const oldConfigStr = JSON.stringify(original, null, 2).split("\n");

    newConfigStr.forEach((line, i) => {
        const oldLine = oldConfigStr[i];

        if (oldLine === line) {
            console.log(chalk.gray("  " + line));
        } else {
            console.log(chalk.green("+ " + line));
        }
    });


    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Apply these changes to tsconfig.json?",
            default: true,
        },
    ]);

    if (!confirm) {
        console.log(chalk.yellow("✖ Changes were not applied."));
        return;
    }

    await writeFile(path, JSON.stringify(json, null, 2));
    console.log(
        chalk.green("\n✔ tsconfig.json updated successfully.")
            .replace("tsconfig.json", chalk.magenta("tsconfig.json"))
    );

};
