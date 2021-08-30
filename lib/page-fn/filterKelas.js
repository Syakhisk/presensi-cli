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

module.exports = filterKelas
