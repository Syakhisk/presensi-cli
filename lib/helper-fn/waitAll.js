async function waitAll(...fns){
  return Promise.all([...fns])
}

module.exports = waitAll
