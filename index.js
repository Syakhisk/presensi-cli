#!/bin/env node
require("dotenv").config()

const userClasses = require('./user-classes.json')
const {Command, InvalidArgumentError} = require('commander');
const program = new Command();
const presence = require('./presence')

program.version("0.1.0");

program
  .option('-p, --presence-code <number>', "6 Digit Presence Code", validatePresensceCode)
  .option('-c, --class <alias>', "Lecture (class) alias")
  .option('-U, --username <username>', "myITS Username (NRP), optional (will override user-config if defined)")
  .option('-P, --password <password>', "myITS Password, optional (will override user-config if defined)")
  .option('-l, --list', "List defined user classes/lectures")

program.parse()

if(program.opts().list){
  for(let index in userClasses){
    console.log()
    console.log(`Index: [${index}]`)
    console.log(`Name: ${userClasses[index].name}`)
    console.log(`Alias: ${userClasses[index].alias}`)
    console.log(`Time: ${userClasses[index].schedule}`)
    console.log(`URL: ${userClasses[index].url}`)
    console.log()
  }

  return
}

if(program.opts().class){
  if(!program.opts().presenceCode){
    console.log("Presence code is not provided, provide it with --presence-code")
    return
  }

  const chosen = userClasses.filter(item => item.alias == program.opts().class)[0]
  if(!chosen){
    console.log("Alias not found, use --list to see available aliases")
    return
  }

  presence({class_url:chosen.url, presenceCode: program.opts().presenceCode})
}


function validatePresensceCode(value){
  if(isNaN(value)) throw new InvalidArgumentError("Please enter a number")
  if(value.length !== 6) throw new InvalidArgumentError("Presence code should be 6 digit")

  return value
}


