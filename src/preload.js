// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer } = require('electron');
const TorrentCache=require('./torrentcache.js')
let torrentcache=new TorrentCache()

//let syncDatListener
//require('./cache.js')
const bridge = {
  sendMessage: (msg) => ipcRenderer.sendSync('from-api',msg),
  //sendMessage: (key,filepath) => ipcRenderer.sendSync('from-api',arg),
  //onMessage: callback => listener = callback,
  syncTorrent: (magnet,filename) =>  torrentcache.syncTorrent(magnet,filename),
  getTorrentInfo: () =>  torrentcache.getTorrentInfo(),
  removeTorrent:(torrentId) =>  torrentcache.removeTorrent(torrentId),

  loadDatFile:(key,path)=>ipcRenderer.sendSync('synchronous-datfilecontentrequest',{key:key,path:path})
}

ipcRenderer.on('destroyclient', (event, arg) => {
   console.log('destroyclient request', arg)
   torrentcache.destroyClient()
 })


window.bridge = bridge;


