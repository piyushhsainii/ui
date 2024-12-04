import { Command } from "commander"


export const add = new Command()
    .name("add")
    .argument("[component...]")
    .action(async (components) => {
        if (!components[1]) {
            return console.log("Please specify the component you want to add.")
        }
        console.log(components, "this was the argument")
    })
