function getTatapMukaToday(list){
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  // const today = new Date("09/01/2021").toLocaleDateString("id", dateOptions)
  const today = new Date().toLocaleDateString("id", dateOptions)
  const match = list.filter((item) => item.date == today)

  return match
}

export default getTatapMukaToday

