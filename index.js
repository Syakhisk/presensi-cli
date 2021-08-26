require('dotenv').config();
const puppeteer = require('puppeteer-core');
const tempDir = require('temp-dir');

const config = {
  headless: false,
  devtools:true,
  executablePath: "/usr/bin/google-chrome-stable",
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

const blocked = [
  "googletagmanager",
  // "jquery",
  // "common",
  // "nprogress",
  "favicon",
];

(async () => {
  const browser = await puppeteer.launch(config)
  const page = await browser.newPage()

  await page.setRequestInterception(true);
  page.on("request", blockResources)

  await waitAll(
    page.goto(urls.presensi),
    page.waitForNavigation({waitUntil: 'domcontentloaded'})
  )

  if(page.url().includes("my.its.ac.id")){
    console.log("Logging in")
    await waitAll(
      page.evaluate(login, {selectors, env: process.env}),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    )
  }

  const listKelas = await page.$$eval(selectors.listKelas, filterKelas, selectors).catch((e) => {console.log(e)})
  console.log(listKelas)

  await page.close()
})();

async function filterKelas(list, selector){
  let data =[]
  for(let item of list){
    let link = item.querySelector(selector.itemKelas).href

    let nameCode = item.querySelector(selector.itemKelas).innerText
    let name = nameCode.match(/(.*)\n(.*)/)[2]
    if(!name) name = nameCode

    let jadwal = item.querySelector(selector.time).innerText

    data.push({link, name, jadwal})
  }
  return data
}

async function login({selectors, env}){
  document.querySelector("input#username").value = env.USERNAME;
  document.querySelector("input#password").value = env.PASSWORD;

  const encrypted = window.encrypt();

  document.querySelector("#encrypted").value = encrypted;
  document.querySelector("#form-login").submit();
}

async function waitAll(...fns){
  return Promise.all([...fns])
}

async function blockResources(req){
    if(["image", "media", "stylesheet"].includes(req.resourceType())){
      req.abort();
    // } else if (req.url().includes("jquery")){
    //     req.respond({
    //         status: 200,
    //         contentType: 'application/javascript; charset=utf-8',
    //         body: require("fs").readFileSync("./jquery-mini.js", {encoding: "utf-8"})
    //     });
    } else {
    for(let block of blocked){
      if(req.url().includes(block)){
        req.abort();
        return;
      }
    }
    req.continue()
  }
}
