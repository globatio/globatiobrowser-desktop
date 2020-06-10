const path = require('path')
const { ipcRenderer } = require('electron')

let listener
let createSecureViewListener
const controlers = {
    gotoUrl: (url) => ipcRenderer.sendSync('synchronous-gotourl', url),
    createNewView: () => ipcRenderer.sendSync('synchronous-createnewview', {type:'basicview'}),
    selectView: (selectedview) => ipcRenderer.sendSync('synchronous-selectview', selectedview),
    deleteView: (viewid) => ipcRenderer.sendSync('synchronous-deleteview', viewid),
    pageLoading: callback => listener = callback,
    createSecureView:callback=>createSecureViewListener=callback,
    pageGoBack:()=>ipcRenderer.sendSync('synchronous-goback'),
    pageGoForward:()=>ipcRenderer.sendSync('synchronous-goforward'),
    pageRefresh:()=>ipcRenderer.sendSync('synchronous-pagerefresh'),
    advanceMenu:(positionx,positiony)=>ipcRenderer.sendSync('synchronous-advancemenu',{x:positionx,y:positiony})
    //onMessage: callback => listener = callback,
    //syncTorrent: magnet => cache.syncTorrent(magnet)
  }

 
ipcRenderer.on('page-loading', (event, arg) => {
  console.log('pageloading', arg) // prints "pong"
  if (arg.search('file://'+path.join(__dirname,'../'))==0) {
      console.log('loading url',url)
    } else {
      listener(arg)
    }

})
ipcRenderer.on('create-secureview', (event, arg) => {
  //console.log('pageload') // prints "pong"
      createSecureViewListener(arg)
})
  
window.controlers = controlers;