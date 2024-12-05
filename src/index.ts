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



main();