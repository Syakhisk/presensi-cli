const blocked = [
  "googletagmanager",
  "favicon",
];

async function blockResources(req){
    if(["image", "media", "stylesheet"].includes(req.resourceType())){
      req.abort();
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

module.exports = blockResources
