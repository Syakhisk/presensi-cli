const fs = require("fs")
const {promises: Fs} = require("fs")
const {promisify} = require("util")
const path = require("path")

const readFile = promisify(fs.readFile)
const accessFile = promisify(fs.access)

async function getUserConfig(){
  // const isExists = await accessFile("./blockResources.js")
  const isExists = await Fs.access("./blockResources.js").catch(e => console.log(e))
  console.log(isExists)
  // const text = await readFile("../../package.json", {encoding: "utf-8"})
  // const parsed = JSON.parse(text)
}

// export default getUserConfig
getUserConfig()

