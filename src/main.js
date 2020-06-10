const {app, BrowserView, BrowserWindow} = require('electron')
const path = require('path')

const { ipcMain } = require('electron')
let view =[]
let viewtype=[]
let activeview =0
const DatCache=require('./datcache.js')
const datcache=new DatCache()

const electron=require('electron')
const Menu=electron.Menu
const MenuItem=electron.MenuItem

  
const ctxMenu= new Menu()

ctxMenu.append(new MenuItem({role:'copy'}))
ctxMenu.append(new MenuItem({role:'paste' }))
ctxMenu.append(new MenuItem({role:'selectall' }))


/*
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})***/

ipcMain.on('from-api', (event, arg) => {
  console.log('from-renderer',arg) 
  event.returnValue = 'to-renderer cool'
  //event.reply('asynchronous-reply', 'pong')
})

//
ipcMain.on('synchronous-datfilecontentrequest', async (event, arg) => {
  console.log('synchronous-filecontentrequest',arg) 
  event.returnValue = await datcache.loadFile(arg.key,arg.path)//'to-renderer matrix'
  //event.reply('asynchronous-reply', 'pong')
})



function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    minWidth: 800,
    height: 600,
    minHeight: 600,
    icon: path.join(__dirname, '../icons/logo.png'),
    webPreferences: {
    nodeIntegration: false,
    contextIsolation: false,
    preload: path.join(__dirname, 'controlers.js'),
    }
  })

mainWindow.setMenuBarVisibility(false)
mainWindow.loadFile(path.join(__dirname, 'controlers.html'))
mainWindow.webContents.on('context-menu',function(e,params){
  ctxMenu.popup(mainWindow,params.x,params.y)
})

mainWindow.on('enter-full-screen', () => {
  view[activeview].setBounds({ x: 0, y: 0, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
})

//leave-full-screen
mainWindow.on('leave-full-screen', () => {
  if (view.length>0){
    view[activeview].setBounds({ x: 0, y: 76, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height -76})
  }
  
})


//console.log(mainWindow)


const advMenu=new Menu()

advMenu.append(new MenuItem({label:'hello',
                              click:function(){
                                mainWindow.webContents.send('create-secureview')
                                console.log('advance Menu hello')
                                activeview=view.length
                                console.log(path.join(__dirname, 'preload.js'))
                                viewtype.push('secureview')
                                view.push(new BrowserView(({contextIsolation: true,webPreferences: { preload : path.join(__dirname, 'securepreload.js'), nodeIntegration : false , plugins : false } }))) 
                                mainWindow.setBrowserView(view[activeview])
                                view[activeview].setBounds({ x: 0, y: 76, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-76 })
                                view[activeview].setAutoResize({width:true,height:true})
                                
                                view[activeview].webContents.loadFile(path.join(__dirname, '../static/securepage.html'))
                                //mainWindow.webContents.send('page-loading', '')  
                              
                              
                                view[activeview].webContents.on('context-menu',function(e,params){
                                    ctxMenu.popup(view[activeview],params.x,params.y)
                                })
                              }
}))




ipcMain.on('synchronous-gotourl', async (event, arg) => {
  let loadingurl=arg
  if (viewtype[activeview]!='secureview'){
  if (loadingurl.search('gp://datkey')==0){
    console.log('Request dat key',loadingurl.slice(11))
    mainWindow.webContents.send('page-loading', loadingurl)

    let datview=activeview
    //view[activeview].webContents.send('sync-datcontent',loadingurl.slice(6))
    await datcache.syncDat(loadingurl.slice(11)).catch((error) => {
      console.error(error);
    });
    //view[datview].webContents.loadFile('./cached/'+loadingurl.slice(6)+'/index.html')
    setTimeout(function(){
      view[datview].webContents.loadFile(path.join(__dirname, '../cached/'+loadingurl.slice(11)+'/index.html'))
      console.log('loading page',path.join(__dirname, '../cached/'+loadingurl.slice(11)+'/index.html'))
    }, 3000);
    
  } else{
    view[activeview].webContents.loadURL(arg)
  }
  
  }
  event.returnValue = 'pong'
})
ipcMain.on('synchronous-goback', async (event, arg) => {

    view[activeview].webContents.goBack()
  event.returnValue = 'pong'
})
ipcMain.on('synchronous-goforward', async (event, arg) => {

  view[activeview].webContents.goForward()
event.returnValue = 'pong'
})
ipcMain.on('synchronous-pagerefresh', async (event, arg) => {
  let url=view[activeview].webContents.getURL()
  view[activeview].webContents.loadURL(url)
event.returnValue = 'pong'
})

ipcMain.on('synchronous-advancemenu', async (event, arg) => {
  advMenu.popup({window:mainWindow,x:arg.x+58,y:arg.y+48})
event.returnValue = 'pong'
})

//
//
//
ipcMain.on('synchronous-createnewview', (event, arg) => {
  console.log('newview',arg)

  activeview=view.length
  console.log(path.join(__dirname, 'preload.js'))
  viewtype.push('basicview')
  view.push(new BrowserView(({contextIsolation: true,webPreferences: { preload : path.join(__dirname, 'preload.js'), nodeIntegration : false , plugins : false } }))) 
  mainWindow.setBrowserView(view[activeview])
  view[activeview].setBounds({ x: 0, y: 76, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-76 })
  view[activeview].setAutoResize({width:true,height:true})
  
  view[activeview].webContents.loadFile(path.join(__dirname, '../static/defaultpage.html'))
  mainWindow.webContents.send('page-loading', '')  


  view[activeview].webContents.on('context-menu',function(e,params){
      ctxMenu.popup(view[activeview],params.x,params.y)
  })

  view[activeview].webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('page-loading', view[activeview].webContents.getURL())
  })
  view[activeview].webContents.on('will-navigate',async (event, url) => {
    
    if (url.slice(0,11)=='gp://datkey'){
      mainWindow.webContents.send('page-loading', url)
      event.preventDefault() // prevent default navigation

      let datview=activeview
      //view[activeview].webContents.send('sync-datcontent',url.slice(6))
      await datcache.syncDat(url.slice(11)).catch((error) => {
        console.error(error);
      });
      //view[datview].webContents.loadFile('./cached/'+url.slice(6)+'/index.html')
      setTimeout(function(){
        view[datview].webContents.loadFile(path.join(__dirname, '../cached/'+url.slice(11)+'/index.html'))
      }, 3000);
    } else if (url.slice(0, 8)=='browser:'){
      console.log('browser')
      event.preventDefault() // prevent default navigation

      mainWindow.webContents.send('page-loading', url)  
      view[datview].webContents.loadFile(path.join(__dirname, '../cached/'+url.slice(8)+'.html')) 
      console.log('defaultpage loading')
    } else {
      console.log('loading url',url)
    }

  })
  ///
  
  view[activeview].webContents.on('console-message', (event,level,message) => {
    console.log('Renderer message:',message);
    //setTimeout(app.quit, 3000);
//view.webContents.send('channel', 'data');
  });

  //////
  /*view[activeview].webContents.on('ipc-message-sync', (event,message) => {
    console.log('synchronous-filecontentrequest') 
    event.returnValue = 'to-renderer matrix cool'
  })*/
  //////
  //
  event.returnValue = 'pong'
})



ipcMain.on('synchronous-selectview', (event, arg) => {
  //console.log(arg)
  activeview =arg

  view[activeview].setBounds({ x: 0, y: 76, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height -76})
  mainWindow.setBrowserView(view[activeview])
  console.log('selecting view',activeview)
  event.returnValue = 'pong'
})
//
ipcMain.on('synchronous-deleteview', (event, arg) => {
  //console.log(arg)
  viewid =arg
  console.log('destoyin',viewid)
  view[viewid].webContents.send('destroyclient','')
  view[viewid].webContents.loadFile(path.join(__dirname, 'empty.html')) 
  view.splice(viewid, 1);
  viewtype.splice(viewid, 1);

  event.returnValue = 'pong'
})


}

app.whenReady().then(createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
