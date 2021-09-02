require("dotenv").config()

const puppeteer = require('puppeteer-core')
const tempDir = require("temp-dir")
const chromePath = require("chrome-paths")

const blockResources = require("./lib/helper-fn/blockResources.js")
const waitAll = require("./lib/helper-fn/waitAll.js")
const login = require("./lib/page-fn/login.js")
const parseTatapMukaBunch = require("./lib/page-fn/parseTatapMukaBunch.js")
const getTatapMukaToday = require("./lib/page-fn/getTatapMukaToday.js")
const axios = require('axios')

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

async function presence({class_url, presenceCode}) {
  const ora = (await import("ora")).default
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

  await page.goto(class_url, {waitUntil: 'domcontentloaded'})
  await page.waitForSelector(selectors.tatapmuka_bunch)

  spinner.text = "Getting tatap muka"
  const listTatapMuka = await page.$$eval(selectors.tatapmuka_bunch, parseTatapMukaBunch).catch(e => console.log(e))

  spinner.text = "Getting latest class"
  const tatapMukaToday = getTatapMukaToday(listTatapMuka)[0]

  spinner.text = "Getting cookies"
  const cookies = await page.cookies()
  const phpsessid = cookies.filter(item => item.name == "PHPSESSID")[0]
  if(!phpsessid){
    console.log("PHPSESSID not found!")
    return
  }

  // console.log(phpsessid)
  spinner.text = "Filling presence form"
  spinner.stop()
  await postToPresence(presenceCode,tatapMukaToday, phpsessid)

  // console.log(tatapMukaToday)
  await browser.close()
}

async function postToPresence(presenceCode, class_data, phpsessid){
  const url = "https://presensi.its.ac.id/kehadiran-mahasiswa/updatehadirmhs"
  const data = {
    kode_akses: presenceCode,
    id_kelas: class_data.btn_datasets.klsid,
    id_tm: class_data.btn_datasets.tmid,
    jns_hadir: "H",
    jns_hdr_tm: "D",
  }

  const params = new URLSearchParams()
  for(let item in data){
    params.append(item, data[item])
  }

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: `PHPSESSID=${phpsessid.value}`
    }
  }

  const res = await axios.post(url, params, config)
  if(!res.data){
    console.log("Request error")
    return
  }

  if(res.data.response == 1){
    console.log("Berhasil mengubah kehadiran")
  } else if(res.data.response == 2){
    console.log("Gagal, melebihi batas waktu")
  }else{
    console.log("Kode presensi salah")
  }

  console.log(res.data)
}

module.exports = presence
