var Dat = require('dat-node')
const fs = require('fs');
const path = require('path')
class Cache {
  constructor() {
    this.datclients=[]
  }

syncDat(datkey){
  let self=this
  let datalreadyexist=false

  return new Promise((resolve, reject) => {
  self.datclients.forEach((datclient) => {

    if (datclient.key==datkey){
        console.log('dat already exit',datclient.key)
        datalreadyexist=true 
      resolve ('index.html')
    }      
  });

  if (!datalreadyexist){
  Dat(path.join(__dirname,'../cached/'+datkey), {key: datkey, sparse: true,indexing:false}, function (err, dat) {
    self.datclients.push({
                          dat:dat,
                          key:datkey
                        })
    dat.joinNetwork(function (err) {
    // After the first round of network checks, the callback is called
    // If no one is online, you can exit and let the user know.
    if (!dat.network.connected || !dat.network.connecting) {
      console.error('No users currently online for that key.')
      //process.exit(1)
      reject()
    }
    
    dat.network.on('connection', function () {
      console.log('I connected to someone!')
    })
    //
      dat.archive.readFile('/root.json', function (err, rootcontent) {
        if (err) throw err
        //console.log(JSON.parse(rootcontent.toString()))
        let rootcontentobj=JSON.parse(rootcontent.toString())
        rootcontentobj.rootfilesnames.forEach(rootfile=> console.log(rootfile))
        rootcontentobj.rootfilesnames.forEach(rootfile=> {dat.archive.readFile(rootfile, function (err, content) {
              if (err) throw err
            })
        })
        console.log('Syncing done',datkey)
        //return true
        if (err) reject (err)
        else resolve('index.html')
      })

    })
  })
}
})
  
}


  async loadFile(datkey,filename){
    let self=this
    let dat
    for (let i = 0; i < self.datclients.length; i++) { 
      if (self.datclients[i].key===datkey){
        dat=self.datclients[i].dat
      }
    }
    return new Promise((resolve, reject) => {
      dat.archive.readFile(filename, (err, data) => {
        if (err) reject(err)//toBrowserError(err, 'getFile'))
        else resolve(data)
      })
    })
  }
}
module.exports = Cache;