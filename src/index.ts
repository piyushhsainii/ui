#!/usr/bin/env node
import { createInterface } from "readline"
import path from "path"
import process from "process"
import fs from "fs"
import { Command } from "commander";
import { add } from "./commands/add";
import ora from "ora"
import { init } from "./commands/init";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query: any) {
    return new Promise((resolve) => {
        rl.question(query, (answer: any) => {
            resolve(answer);
        });
    });
}

export async function main() {
    const ui = new Command()
        .name("ui")
        .argument("[component...]")
        .action(async (components) => {
            console.log("initialised")
        })
        .addCommand(init)
        .addCommand(add)
    ui.parse()
}

async function writeToDir(data: any) {
    const spinner = ora('Writing components.json...').start()               //display loading text
    const targetPath = path.resolve(process.cwd(), 'components.json')       //specify the path to write the file
    await fs.writeFile(targetPath, JSON.stringify(data, null, 2), () => { })
    spinner.succeed()
    return "sucess"
}

main();