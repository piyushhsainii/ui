#!/usr/bin/env node
import { createInterface } from "readline"
import path from "path"
import process from "process"
import fs from "fs"
import { Command } from "commander";
import { add } from "./commands/add";
import ora from "ora"

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
    try {
        console.log('Welcome to the Interactive Prompt Application!\n');
        const name = await askQuestion('What is your name? ');
        const age = await askQuestion('How old are you? ');
        const hobby = await askQuestion('What is your favorite hobby? ');
        console.log('\n--- Your Responses ---');
        console.log(`Name: ${name}`);
        console.log(`Age: ${age}`);
        console.log(`Hobby: ${hobby}`);
        const data = {
            name: name,
            age: age,
            hobby: hobby
        }
        await writeToDir(data)
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        rl.close();
    }
    const ui = new Command()
        .name("ui")
        .argument("[component...]")
        .action(async (components) => {
            console.log("initialised")
        })
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