
var WebTorrent = require('webtorrent')
const fs = require('fs');
const path = require('path')
class TorrentCache {
  constructor() {

/*    this.fd = fs.openSync(path, 'a+')
    this.path=path
*/
    //this.torrent
    this.torrentinfo={files:[]}
    this.client = new WebTorrent()
    this.torrentId=''
  }
 syncTorrent(magnetURI,filename){
  let self=this
  if ((this.torrentId!='')&&(this.torrentId!=undefined)) {
    this.removeTorrent()
  }
  this.torrentId= magnetURI 
  //console.log(magnetURI)
  this.client.add(magnetURI, { path: path.join(__dirname,'../cached/') }, function (torrent) {
  //console.log('id:',torrent.infoHash)
   /*torrent.on('done', function () {
     console.log('torrent download finished')
   })*/
   /////////////
   //self.torrent=torrent
   var file = torrent.files.find(function (file) {
    return file.path.endsWith(filename)
  })
/*
  for (let i=0;i<torrent.files.length;i++){
    if (torrent.files[i].endsWith('.mp4')){
      file=torrent.files[i]
    }
  }*/

  // Stream the file in the browser
  file.renderTo('video#contentvideo')//(renderingelement)//('video#contentvideo')//.appendTo('#output')

  //torrent.files[0].renderTo('video#contentvideo')//.appendTo('body')
   ////////
   //console.log(torrent.files[0].path) 
   //return 'torrent.files[0].path'
   //
   torrent.on('download', function (bytes) {
    let tmpinfo=[]
    torrent.files.forEach(function(file){
       // do something with file
       tmpinfo.push({
         //name:file.name,
         path:file.path,
         downloadSpeed:torrent.downloadSpeed,
         numPeers:torrent.numPeers,
         progress:file.progress
       })
      
    })
    self.torrentinfo.files=tmpinfo
  })
  })


}
  getTorrentInfo(){

    return this.torrentinfo.files//this.torrentinfo
  }
  /*displayFile(fileindex,locationid){

    this.torrent.files[fileindex].renderTo(locationid)
  }*/
  removeTorrent(){
    //this.client.remove(torrentId, [function callback (err) {}])
    if ((this.torrentId!='')&&(this.torrentId!=undefined)) {
      this.client.remove(this.torrentId)
      console.log('remove torrent',this.torrentId)
    }

  }
  destroyClient(){
    //this.client.destroy([function callback (err) {}])
    this.client.destroy()
  }
}
module.exports = TorrentCache;