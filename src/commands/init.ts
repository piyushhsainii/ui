import { Command } from "commander";
import ora from "ora";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import stripJsonComments from "strip-json-comments";
import inquirer from "inquirer"
import { pathToFileURL } from "url";

export const init = new Command()
    .name("init")
    .description("Initialize your project and install dependencies")
    .action(async () => {
        if (!checkPackageJson()) return;
        if (!checkImportAlias()) return;
        if (!VerifyFramework()) return;
        const Data = await configureStyles()
        const { baseColor, CssVariables } = Data;
        if (!await WriteComponentsJson(baseColor, CssVariables)) return;
        updateTailwindConfig(baseColor, CssVariables)
    });
let frameWork: string
const VerifyFramework = () => {
    const frameWorks = ["vite.config.ts", "vite.config.js", "next.config.mjs"];
    const checkFramework = ora("Verifying Framework").start();

    for (const val of frameWorks) {
        const frameworkPath = path.resolve(process.cwd(), val);
        if (fs.existsSync(frameworkPath)) {
            checkFramework.succeed(`Found ${val.slice(0, 4)}`);
            frameWork = val.slice(0, 4)
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
    const Data = {
        baseColor: data["base color"],
        CssVariables: data["CSS variables"]
    }
    return Data
}
//write components.json
async function WriteComponentsJson(baseColor: string, CssVariables: string) {
    const spinner = ora('Writing components.json...').start()               //display loading text
    const targetPath = path.resolve(process.cwd(), 'components.json')       //specify the path to write the file
    if (frameWork == "vite" && fs.existsSync(targetPath)) {
        spinner.fail("components.json already exists!")
        return false
    }
    if (frameWork == "vite") {
        const Viteconfig = {
            "style": "default",
            "rsc": false,
            "tsx": true,
            "tailwind": {
                "config": "tailwind.config.js",
                "css": "src/index.css",
                "baseColor": baseColor,
                "cssVariables": CssVariables == 'yes' ? true : false,
                "prefix": ""
            },
            "aliases": {
                "components": "@/components",
                "utils": "@/lib/utils",
                "ui": "@/components/ui",
                "lib": "@/lib",
                "hooks": "@/hooks"
            },
            "iconLibrary": "lucide"
        }
        await fs.writeFile(targetPath, JSON.stringify(Viteconfig, null, 2), () => { })
        spinner.succeed()
        return true
    }

}
async function updateTailwindConfig(baseColor: string, CssVariables: string) {
    const updateTailwindConfigSpinner = ora("Updating tailwind.config.js").start();
    const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.js');
    const tailwindURL = pathToFileURL(tailwindPath).href;
    if (frameWork == "vite" && CssVariables == "off") {
        try {
            const existingConfig = await import(tailwindURL);
            const pluginExists = existingConfig.default.plugins.some(
                (plugin: any) => plugin === 'require("tailwindcss-animate")'
            );
            if (!pluginExists) {
                const updatedConfig = {
                    ...existingConfig.default,
                    plugins: [
                        ...existingConfig.default.plugins,
                        'require("tailwindcss-animate")' // Add the plugin
                    ]
                };
                const updatedConfigString = `
                /** @type {import('tailwindcss').Config} */
                export default {
                ...${JSON.stringify(updatedConfig, null, 2).replace(/"([^"]+)":/g, '$1:')}
                };
                `.trim();
                // Write back to the file
                fs.writeFileSync(tailwindPath, updatedConfigString, 'utf8');
                updateTailwindConfigSpinner.succeed("Tailwind config updated successfully!");
            } else {
                updateTailwindConfigSpinner.info("Plugin already exists. No update needed.");
            }
        } catch (error) {
            updateTailwindConfigSpinner.fail("Failed to update Tailwind config.");
            console.error(error);
        }
    }
    if (frameWork == "vite" && CssVariables == "on") {

    }

}
