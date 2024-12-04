import chalk from "chalk"
import path from "path"

export const checkPackageJson = () => {
    const packageJsonExists = path.resolve(process.cwd(), "package.json")
    if (!packageJsonExists) {
        return console.log(chalk.red("Cannot Initialise pacakage in empty directory,"))
    }
    return console.log(packageJsonExists, "package json exists")
}

export const checkTypeScript = () => {

    const FrameWork = path.join(process.cwd(), "tsconfig.json")
    if (FrameWork !== undefined) {
        return FrameWork
    }
    console.log(FrameWork, "this is typescript")

}

export const checkFrameWork = () => {
    const frameWorks = ["vite.config.ts", "vite.config.js", "next.config.mjs"]

    frameWorks.forEach((frmWrks) => {
        const FrameWork = path.resolve(process.cwd(), frmWrks)
        if (FrameWork !== undefined) {
            return FrameWork
        }
        console.log(FrameWork, "this is framework")
    })

}



