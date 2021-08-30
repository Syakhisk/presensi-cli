require("dotenv").config()

const puppeteer = require('puppeteer-core')
const tempDir = require("temp-dir")
const ora = require("ora")
const chromePath = require("chrome-paths")

const blockResources = require("./lib/helper-fn/blockResources.js")
const waitAll = require("./lib/helper-fn/waitAll.js")
const login = require("./lib/page-fn/login.js")
const parseTatapMukaBunch = require("./lib/page-fn/parseTatapMukaBunch.js")
const getTatapMukaToday = require("./lib/page-fn/getTatapMukaToday.js")

const config = {
  headless: true,
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
  tatapmuka_bunch: "table.js-table-sections-enabled tbody.js-table-sections-header",
};

const urls = {
  myIts: "https://my.its.ac.id",
  presensi: "https://presensi.its.ac.id",
  kelasDummy: "https://presensi.its.ac.id/tatap-muka/20211:42100:ME184412:A"
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
  await page.goto(urls.presensi, {waitUntil: 'domcontentloaded'});

  //* Login check
  if(page.url().includes(urls.myIts)){
    spinner.text = "Logging in"
    await waitAll(
      page.evaluate(login, {selectors, env: process.env}),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    )
  } else {
    spinner.text = "Logged in."
  }

  await page.goto(urls.kelasDummy, {waitUntil: 'domcontentloaded'})
  await page.waitForSelector(selectors.tatapmuka_bunch)

  spinner.text = "Getting tatap muka"
  const listTatapMuka = await page.$$eval(selectors.tatapmuka_bunch, parseTatapMukaBunch).catch(e => console.log(e))

  spinner.text = "Getting latest class"
  const tatapMukaToday = getTatapMukaToday(listTatapMuka)
  spinner.stop()

  // console.log(listTatapMuka)
  console.log(tatapMukaToday)

  await browser.close()
})();

