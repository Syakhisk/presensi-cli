require("dotenv").config()

const puppeteer = require('puppeteer-core')
const tempDir = require("temp-dir")
const ora = require("ora")
const chromePath = require("chrome-paths")

const filterKelas = require("./lib/filterKelas.js")
const login = require("./lib/login.js")
const blockResources = require("./lib/blockResources.js")
const waitAll = require("./lib/waitAll.js")

const config = {
  headless: false,
  devtools:true,
  executablePath: chromePath.chrome,
  args: [`--user-data-dir=${tempDir}/pptr`]
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
  const spinner = ora('Initiating...').start();

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
  spinner.stop()
  console.log(listKelas)

  await browser.close()
})();

