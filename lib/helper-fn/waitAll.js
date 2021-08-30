async function waitAll(...fns){
  return Promise.all([...fns])
}

export default waitAll

