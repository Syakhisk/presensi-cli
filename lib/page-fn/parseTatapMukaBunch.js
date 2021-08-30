async function parseTatapMukaBunch(list){
  let data =[]
  for(let item of list){
    const index = item.querySelector("tr > td:nth-child(1)").innerText.trim()
    const date = item.querySelector("tr > td:nth-child(2) > p:nth-child(1)").innerText.trim()
    const status_kehadiran = item.querySelector("tr > td:nth-child(3)").innerText.trim()
    const btn_datasets = {...item.querySelector("tr > td:nth-child(4) > button:nth-child(1)").dataset }

    data.push({
      index,
      date,
      status_kehadiran,
      btn_datasets,
    })
  }
  return data
}

module.exports = parseTatapMukaBunch
