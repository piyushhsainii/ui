import chalk from "chalk"
import { Command } from "commander"
import path from "path"
import fs, { mkdirSync } from "fs"
import ora from "ora"
import { test } from "../components/test"
import inquirer from "inquirer"
import { exec } from "child_process"

export const add = new Command()
    .name("add")
    .argument("[component...]")
    .action(async (components) => {
        if (!components[0]) {
            return console.log(chalk.red("Please specify the component you want to add."))
        }
        addComponentsToProject(components[0])
    })

const componentsList = [
    'x'
]

const addComponentsToProject = async (component: any) => {
    const addComponents = ora("Adding Components...").start()
    const componentFile = test.find((file) => file.name == component)

    if (!componentFile) {
        return addComponents.fail("This component doesn't exist!")
    }
    const cleanCode = componentFile.code
        .replace(/^```.*\n/, '')   // Remove opening backticks with any text after
        .replace(/```$/, '')       // Remove closing backticks
        .trim();
    const componentPath = path.resolve(process.cwd(), `src/components/ui/${component}.tsx`)
    const componentsDirExist = path.resolve(process.cwd(), `src/components`)
    const UIDirExist = path.resolve(process.cwd(), `src/components/ui`)
    if (fs.existsSync(componentPath)) {
        addComponents.fail("Component already exist")
        const { component } = await inquirer.prompt([
            {
                name: "component",
                type: "confirm",
                message: "This component already exists! Would you like to overwrite?",
                choices: ["no", "yes"]
            }
        ])
        if (!component) {
            addComponents.info("Process ended successfully!")
            return
        }
    }
    // Ensure directories exist
    if (!fs.existsSync(componentsDirExist)) {
        fs.mkdirSync(componentsDirExist, { recursive: true })
    }
    if (!fs.existsSync(UIDirExist)) {
        fs.mkdirSync(UIDirExist, { recursive: true })
    }
    // Use promises for file writing
    await fs.promises.writeFile(componentPath, cleanCode)
    addPackages()
    addComponents.succeed("Component added successfully!")
}

async function addPackages() {
    // const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const addPackage = ora("Adding packages").start()
    try {
        exec('npm install framer-motion', { cwd: process.cwd() })
        addPackage.succeed()
    } catch (error) {
        addPackage.fail()
    }
}
