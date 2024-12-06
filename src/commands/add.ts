import chalk from "chalk"
import { Command } from "commander"
import path from "path"
import fs, { mkdirSync } from "fs"
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
    const componentsDirExist = path.resolve(process.cwd(), `src/components`)
    const UIDirExist = path.resolve(process.cwd(), `src/components/ui`)
    if (!fs.existsSync(componentsDirExist)) {
        mkdirSync(componentsDirExist)
        mkdirSync(UIDirExist)
        fs.writeFile(componentPath, componentFile.code, () => {
            addComponents.succeed()
        })
    } else if (!fs.existsSync(UIDirExist)) {
        mkdirSync(UIDirExist)
        fs.writeFile(componentPath, componentFile.code, () => {
            addComponents.succeed()
        })
    } else {
        try {
            fs.writeFile(componentPath, componentFile.code, () => {
                addComponents.succeed()
            })
        } catch (error) {
            console.log(error)
            addComponents.fail("This component doesn't exist!")
        }
    }
}

