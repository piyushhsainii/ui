import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import stripJsonComments from "strip-json-comments";
import inquirer from "inquirer"


export const init = new Command()
    .name("init")
    .description("Initialize your project and install dependencies")
    .action(async () => {
        if (!checkPackageJson()) return;
        if (!checkImportAlias()) return;
        if (!VerifyFramework()) return;
        configureStyles()
        console.log(chalk.green("Initialization complete!"));
    });

const VerifyFramework = () => {
    const frameWorks = ["vite.config.ts", "vite.config.js", "next.config.mjs"];
    const checkFramework = ora("Verifying Framework").start();

    for (const val of frameWorks) {
        const frameworkPath = path.resolve(process.cwd(), val);
        if (fs.existsSync(frameworkPath)) {
            checkFramework.succeed(`Found ${val.slice(0, 4)}`);
            return true;
        }
    }

    checkFramework.fail(chalk.red("No Framework could be found"));
    return false;
};

const checkPackageJson = () => {
    const spinner = ora("Preflight Checks").start();
    const packageJsonPath = path.resolve(process.cwd(), "package.json");

    if (!fs.existsSync(packageJsonPath)) {
        spinner.fail("Cannot initialise package in empty directory");
        console.log(chalk.red("Cannot initialise package in empty directory."));
        return false;
    }
    spinner.succeed();
    return true;
};

const checkImportAlias = () => {
    const checkAlias = ora("Validating Import Alias").start();
    const tsConfigPath = path.resolve(process.cwd(), "tsconfig.json");

    if (!fs.existsSync(tsConfigPath)) {
        checkAlias.fail("No tsconfig.json found.");
        console.log(chalk.red("Check our docs: [link]"));
        return false;
    }
    const tsConfigContent = fs.readFileSync(tsConfigPath, "utf-8");
    const cleanContent = stripJsonComments(tsConfigContent);
    try {
        const tsConfig = JSON.parse(cleanContent);
        if (tsConfig.compilerOptions?.paths?.['@/*']) {
            checkAlias.succeed();
            return true;
        } else {
            checkAlias.fail("No Import Alias found in tsconfig.json.");
        }
    } catch {
        checkAlias.fail("Error parsing tsconfig.json.");
    }
    return false;
};

const configureStyles = async () => {
    const data = await inquirer.prompt([
        {
            type: 'select',
            name: 'base color',
            message: 'Which color would you like to use as the base color?',
            choices: ['Neutral', 'Slate', 'Zinc'],
        },
        {
            type: 'select',
            name: 'CSS variables',
            message: 'Would you like to use CSS variables for theming?',
            choices: ['no', 'yes'],
        },
    ])
    console.log(data["base color"])
    console.log(data["CSS variables"])
}

