var config=require('../config/config.json');

const cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var path = require('path');

String.prototype.normalize = function(){
       return this.toString().toLowerCase()
       .replace(/\ & /gi," and ")
       .replace(/\ et /gi," and ")
       .replace(/[\ -]*mono$/,"")
       .replace(/[\ -]*disc [0-9]$/i,"")
       .replace(/[^a-zA-Z0-9 ]/g, "")
       .replace(/^the\ /i,"")
       .replace(/\[[^\]]*\]$/g,"")
       .replace(/\([^\)]*\)$/g,"")
       .trim();
}


function compareNames (inputName, readName, matchtype) {
  if (matchtype === undefined) matchtype=1 // 
  var iNN= inputName.normalize(),
      rNN= readName.normalize();
  if (iNN === rNN) return true; //best match
  var regiNN="/"+iNN.replace(/\ /g, ".*")+"/"
  if (matchtype > 1 && rNN.match(regiNN)) return true; //good match, one way
  var regrNN="/"+rNN.replace(/\ /g, ".*")+"/"
  if (matchtype > 1 && iNN.match(rNN)) return true; //good match, other way
  return false //no match
}


function getAmzImg (amzArtistPageURL, cllbck) {
    var theURL="";
    request (amzArtistPageURL, function(error,response,body) {
      console.log("fetch amz:\t "+ amzArtistPageURL);
        if (error !== null) console.log("got error "+ error);
        var $=cheerio.load(body);
        $('.album-contain').each(function(i, thisContent){
            // console.log ("fetch amz: found in .album-contain: \n" + $(thisContent));//.img.data-largeurl);
            //get the first URL
            theURL= $('img', thisContent).attr('data-largeurl');
            if (theURL!==undefined && theURL!=="") {
                console.log("found amz large img:\t "+ theURL);
            } else { 
                theURL= $('img', thisContent).attr('src');
                if (theURL!==undefined && theURL!=="" && theURL.indexOf("no_image") < 0) {
                    console.log("found amz small img:\t "+ theURL); 
                } else {
                console.log("did not find amz img");
                theURL="";
                }
            }
            cllbck(theURL);
        });
    });
}


function lookUpAmzAlbum (albumStr, artistStr, callback) {
    var artistJson={};
    artistJson['name']=artistStr;
    artistJson['id']=artistStr.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")
    var amzUrl="http://www.allmusic.com/search/albums/";
    var thisURL = "";
    var notYetFound=true;
    var result={};
    request(amzUrl + albumStr + " " + artistStr,function(error, response, body)
    {
        console.log("fetch amz:\t Name= " + albumStr + " - Artist=" + artistStr);
        if (error !== null) console.log("got error "+ error);
        var $=cheerio.load(body);
        $('.title').each(function(i, thisAlbum){
            //parse the entry
            var thisAlbumText = $(thisAlbum).text().trim();
            console.log("Album Name  =",thisAlbumText);
            //if (notYetFound && thisAlbumText.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === albumStr.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")) {
            if (notYetFound && thisAlbumText.normalize() === albumStr.normalize()) {
                console.log (thisAlbumText + ' is a match');
                //console.log ($(thisArtist).html());
                var thisArtistText = $(thisAlbum).parent().children('.artist').text().trim();
                console.log("Artist=",thisArtistText);
                //if (thisArtistText.toLowerCase().replace(/[^a-zA-Z0-9]/g, "") === artistStr.toLowerCase().replace(/[^a-zA-Z0-9]/g, "")) {
                //if (thisArtistText.normalize() === artistStr.normalize()) {
                if (compareNames(thisArtistText, artistStr, 2)) {
                    console.log (thisArtistText + ' is a match');
                    result["artist"]=artistStr;
                    result["album"]=albumStr;
                    var thisDate = $(thisAlbum).parent().children('.year').text().trim();
                    result["Date"]=thisDate;
                    var thisURL = $('a', thisAlbum).attr('href');
                    result["AlbumURL"]=thisURL;
                    notYetFound=false; //don't call the callback twice
                }

            }
        });
        console.log("lookUpAmzAlbum callback ",result);
        callback(result);
    });
}

module.exports = function () {
    return function(req,res,next){
        if (!config.fetchFolder) return next();
        if (res.URL!== undefined && res.URL!== "") return next();
        console.log('lookup amz for artist='+ req.params.artist +' album =' + req.params.album);
        //here params are expected to album and artist
        //todo: we should look on the local hard drive first to find the Folder.
        lookUpAmzAlbum (req.params.album, req.params.artist, function(result){
            if (result.AlbumURL !==undefined && result.AlbumURL !== null && result.AlbumURL !=="" ){
                console.log("go to AmzImg "+result.AlbumURL);
                getAmzImg (result.AlbumURL, function(theURL){
                    if (theURL!==""){
                        result['folderURL']=theURL;
                        res.JSON=result;
                        res.URL=theURL;
                        res.Resource=request(theURL);
                        res.doCache=true;
                    }
                    console.log ("done amz, returning");
                    return next();
                });
            } else {
                console.log("no album found");
                res.JSON=result;
                res.URL="";
                return next();//error case. Useful here??
            }
        });
    }
};
