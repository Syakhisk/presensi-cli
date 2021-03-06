require("dotenv").config()

const puppeteer = require('puppeteer-core')
const tempDir = require("temp-dir")
const chromePath = require("chrome-paths")

const filterKelas = require("./lib/page-fn/filterKelas.js")
const login = require("./lib/page-fn/login.js")
const blockResources = require("./lib/helper-fn/blockResources.js")
const waitAll = require("./lib/helper-fn/waitAll.js")
const {access, readFile, writeFile} = require('fs/promises')

const config = {
  headless: true,
  devtools:true,
  executablePath: chromePath.chrome, args: [`--user-data-dir=${tempDir}/pptr`]
}

const selectors = {
  username: "#username",
  password: "#password",
  continue: "#continue",
  login : "#login",
  listKelas: ".block .block-content ul li .content-li",
  itemKelas: "h5 a",
  time: ".row .col",

};

const urls = {
  myIts: "https://my.its.ac.id",
  presensi: "https://presensi.its.ac.id",
};

(async () => {
  const ora = (await import("ora")).default
  const spinner = ora('Initiating...').start();

  // const userClasses = await getUserClasses()

  const browser = await puppeteer.launch(config)
  const page = await browser.newPage()

  //* Login
  await page.setRequestInterception(true);
  page.on("request", blockResources)

  //* Visit
  spinner.text = `Heading to ${urls.presensi}`
  await waitAll(
    page.goto(urls.presensi),
    page.waitForNavigation({waitUntil: 'domcontentloaded'})
  )

  //* Login check
  if(page.url().includes("my.its.ac.id")){
    spinner.text = "Logging in"
    await waitAll(
      page.evaluate(login, {selectors, env: process.env}),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    )
  } else {
    spinner.text = "Logged in."
  }

  //* Get class
  spinner.text = "Getting classes"
  const listKelas = await page.$$eval(selectors.listKelas, filterKelas, selectors).catch((e) => {spinner.text = e})

  spinner.text = "Writing user-classes.json"
  await writeFile("./user-classes.json", JSON.stringify(listKelas, null, 2), {encoding: "utf-8"})
  spinner.stop()
  console.log("User Classes written in " + __dirname + "/user-classes.json")

  await browser.close()
})();

async function getUserClasses(){
  const isExist = await access("./user-classes.json").then(() => true).catch(() => false)
  if(!isExists) return false
  return JSON.parse(await readFile("./user-classes.json"))
}
