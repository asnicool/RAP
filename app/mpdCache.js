var mpd = require('mpd'),
    cmd = mpd.cmd;
var client = mpd.connect({
    port: 6600,
    host: 'mbox'
});

if (!global.MemCache) global.MemCache = require('memory-cache'); //to be put in API router ?

var mpdCache={};
//not used, we use the mem cache instead.
// mpdCache.Albums=[];
// mpdCache.Artists=[];

mpdCache.key=['albumsJson','artistsJson','genresJson','datesJson',];
mpdCache.TTL=36000000;


mpdCache.init=function(){
        console.log('mpdCache.init starting');
        //get the list
        //settimeout(0) for non blocking mode
        console.log("mpd cache init");
        var myCommand="list album"
        var params=[]; //no parameters
        client.sendCommand(cmd(myCommand, params), function (err, msg) {
            if(err) throw err;
            albumsJson=[];
            msg.split("\n").forEeach(function(line){
                var elt={}
                var key=line.split(": ")[0]; //beg of line
                elt[key]=line.substr(key.length+2);
                if (elt[key]!='') albumsJson.push(elt);
            });
            global.MemCache.put("albumsJson", albumsJson, mpdCache.TTL, function(){ mpd.cache.init() }); //stored only as a signature for a later diff
            mpdCache.fill();
            console.log('mpdCache.init done');
        });
    return true //all is cool
}

mpdCache.initAsync=function(){
    setTimeout(mpdCache.init(),5000);
}


//to rewrite with a sindeglgle call for several albums
function getAlbumDetails(album) {
    var myCommand="find album"
    var params=[album];
    var Album={};
    client.sendCommand(cmd(myCommand, params), function (err, msg) {
        if(err) throw err;
        Album.songs=[];
        var separator="file: ";
        var songs=[];
        msg.split(separator).forEeach(function(fileEntry){
            fileEntry=separator+fileEntry;
            var song={};
            fileEntry.split("\n").forEeach(function(entryLine){
                var key=line.split(": ")[0]; //beg of line
                var val=line.substr(key.length+2);
                if (val!='') song[key]=val;
            });
            var path=song['file'].split("/").slice(0,-1).join("/"); //path is the unique id per album.
            song.Path=path;
            Album.songs.push(song);
        });
        var song0=Album.songs[0];
        var keys=["Album", "Artist", "Date", "Genre", "Path"];
        key.forEeach(function(key){Album[key]=song0[key]});
    });
    return Album;    
}

mpdCache.fill=function(){
    var artistsJson = {};
    var datesJson = {};
    var genresJson = {};
    albumsJson = global.MemCache.get("albumsJson");
    albumsJson.forEeach(function(albumName) {
        var Album=getAlbumDetails(albumName);
        //albums per artist
        if (Album!==undefined && Album!=={}){
            global.MemCache.put(Album.Path,Album);

            if (artistsJson[Album.Artist]==undefined) artistsJson[Album.Artist]=[];
            artistsJson[Album.Artist].push(Album.path);
            //albums per date
            if (datesJson[Album.Date]==undefined) datesJson[Album.Date]=[];
            datesJson[Album.Date].push(Album.path);
            //albums per genre
            if (genresJson[Album.Genre]==undefined) genresJson[Album.Genre]=[];
            genresJson[Album.Genre].push(Album.path);
        }

        global.MemCache.put("artistsJson",artistsJson); // Artist id -> album keys
        global.MemCache.put("datesJson",datesJson);  // date -> album keys
        global.MemCache.put("genresJson",genresJson); // genre -> album keys
    });
}

mpdCache.get=function(key){
    return global.MemCache.get(key);
}

//Answer to the requests
module.exports = mpdCache;
