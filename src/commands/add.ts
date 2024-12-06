import chalk from "chalk"
import { Command } from "commander"
import path from "path"
import fs from "fs"
import ora from "ora"
import { test } from "../components/test"

export const add = new Command()
    .name("add")
    .argument("[component...]")
    .action(async (components) => {
        console.log(components)
        if (!components[0]) {
            return console.log(chalk.red("Please specify the component you want to add."))
        }
        addComponents(components[0])
    })

const componentsList = [
    'x'
]

const addComponents = async (component: any) => {
    const addComponents = ora("Adding Components...").start()
    const componentFile = test.find((file) => file.name == component)
    if (!componentFile) {
        return addComponents.fail("This component doesn't exist!")
    }
    const componentPath = path.resolve(process.cwd(), `src/components/ui/${component}.tsx`)
    // fs.readFile(componentPath, 'utf8', (err, data) => {
    //     if (err) {
    //         if (err.code === 'ENOENT') {
    //             addComponents.fail()
    //             console.error('File not found:', componentPath);
    //         } else {
    //             addComponents.fail()
    //             console.error('Error reading file:', err);
    //         }
    //         return;
    //     }
    // });
    try {
        console.log(componentPath)
        fs.writeFile(componentPath, componentFile.code, () => {
            addComponents.succeed()
        })
    } catch (error) {
        console.log(error)
        addComponents.fail("This component doesn't exist!")
    }

}

