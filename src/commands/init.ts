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
        console.log(chalk.green('Success!') + " " + 'Project initialization completed.')
        console.log('You may now add components.')
        return;
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
            choices: ['Neutral', 'Slate', 'Zinc', 'Gray', 'Stone'],
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
        chalk.red("To start over, remove components.json and init again!")
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
    const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.js');
    const tailwindURL = pathToFileURL(tailwindPath).href;

    if (frameWork === "vite" && CssVariables === "no") {
        const updateTailwindConfigSpinner = ora("Updating tailwind.config.js").start();
        try {
            // Dynamically load the tailwind.config.js
            const existingConfig = await import(tailwindURL);

            const plugins = existingConfig?.default?.plugins || [];
            if (!Array.isArray(plugins)) {
                throw new Error("Invalid Tailwind config: 'plugins' is not an array");
            }

            // Check if the plugin is already present
            const pluginExists = plugins.some((plugin) =>
                plugin && plugin.toString().includes("tailwindcss-animate")
            );

            if (pluginExists) {
                updateTailwindConfigSpinner.info("Tailwind.config.js is already up to date.");
                return; // Exit if the plugin already exists
            }

            // If the plugin doesn't exist, add it
            const updatedConfig = {
                ...existingConfig.default,
                theme: {
                    extend: {
                        ...existingConfig.default.theme?.extend,
                        borderRadius: {
                            ...(existingConfig.default.theme?.extend?.borderRadius || {}),
                            lg: "var(--radius)",
                            md: "calc(var(--radius) - 2px)",
                            sm: "calc(var(--radius) - 4px)",
                        },
                    },
                },
                plugins: [
                    ...plugins,
                    `require("tailwindcss-animate")`, // Add plugin as a properly serialized require
                ],
            };

            // Generate updated configuration file content
            const updatedConfigString = `
                /** @type {import('tailwindcss').Config} */
                export default {
                darkMode: ${JSON.stringify(updatedConfig.darkMode)},
                content: ${JSON.stringify(updatedConfig.content, null, 2)},
                theme: ${JSON.stringify(updatedConfig.theme, null, 2).replace(/"([^"]+)":/g, "$1:")},
                plugins: [
                    ${updatedConfig.plugins
                    .map((plugin: any) =>
                        plugin.includes("tailwindcss-animate")
                            ? `require("tailwindcss-animate")`
                            : JSON.stringify(plugin)
                    )
                    .join(",\n    ")}
                ]
                };
            `.trim();

            // Write the updated config back to the file
            fs.writeFileSync(tailwindPath, updatedConfigString, "utf8");
            updateTailwindConfigSpinner.succeed("Tailwind config updated successfully!");
        } catch (error) {
            updateTailwindConfigSpinner.fail("Failed to update Tailwind config.");
            console.error(error);
        }
    }
    if (frameWork === "vite" && CssVariables === "yes" && baseColor === "Gray") {
        const updatingIndexCss = ora("Updating index.css").start()
        const filePath = path.resolve(process.cwd(), 'src/index.css')
        const cssData = `
        @layer base {
    :root {
      --radius: 0.5rem;
      --background: 0 0% 100%;
      --foreground: 224 71.4% 4.1%;
      --card: 0 0% 100%;
      --card-foreground: 224 71.4% 4.1%;
      --popover: 0 0% 100%;
      --popover-foreground: 224 71.4% 4.1%;
      --primary: 220.9 39.3% 11%;
      --primary-foreground: 210 20% 98%;
      --secondary: 220 14.3% 95.9%;
      --secondary-foreground: 220.9 39.3% 11%;
      --muted: 220 14.3% 95.9%;
      --muted-foreground: 220 8.9% 46.1%;
      --accent: 220 14.3% 95.9%;
      --accent-foreground: 220.9 39.3% 11%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 20% 98%;
      --border: 220 13% 91%;
      --input: 220 13% 91%;
      --ring: 224 71.4% 4.1%;
      --chart-1: 12 76% 61%;
      --chart-2: 173 58% 39%;
      --chart-3: 197 37% 24%;
      --chart-4: 43 74% 66%;
      --chart-5: 27 87% 67%;
    }
    .dark {
      --background: 224 71.4% 4.1%;
      --foreground: 210 20% 98%;
      --card: 224 71.4% 4.1%;
      --card-foreground: 210 20% 98%;
      --popover: 224 71.4% 4.1%;
      --popover-foreground: 210 20% 98%;
      --primary: 210 20% 98%;
      --primary-foreground: 220.9 39.3% 11%;
      --secondary: 215 27.9% 16.9%;
      --secondary-foreground: 210 20% 98%;
      --muted: 215 27.9% 16.9%;
      --muted-foreground: 217.9 10.6% 64.9%;
      --accent: 215 27.9% 16.9%;
      --accent-foreground: 210 20% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 210 20% 98%;
      --border: 215 27.9% 16.9%;
      --input: 215 27.9% 16.9%;
      --ring: 216 12.2% 83.9%;
      --chart-1: 220 70% 50%;
      --chart-2: 160 60% 45%;
      --chart-3: 30 80% 55%;
      --chart-4: 280 65% 60%;
      --chart-5: 340 75% 55%;
    }
        @layer base {
    * {
      @apply border-border;
    }
    body {
      @apply bg-background text-foreground;
    }
  }
  }
        `
        fs.readFile(filePath, 'utf8', (err, fileContent) => {
            if (err) {
                // Handle errors such as file not existing
                if (err.code === 'ENOENT') {
                    console.log('File does not exist. Creating and appending data.');
                    fs.writeFile(filePath, cssData, (writeErr) => {
                        if (writeErr) return console.error('Error writing file:', writeErr);
                        console.log('Data appended successfully!');
                    });
                    updatingIndexCss.succeed()
                } else {
                    updatingIndexCss.fail("Something went wrong reading the file")
                    console.error('Error reading file:', err);
                }
                return;
            }
            // Check if data already exists
            if (!fileContent.includes(cssData.trim())) {
                fs.appendFile(filePath, cssData, (appendErr) => {
                    if (appendErr) return updatingIndexCss.fail('Error appending data:');
                    updatingIndexCss.succeed()
                });
            } else {
                updatingIndexCss.info("SData already exists in the file. ")
            }
        });
    }
}
