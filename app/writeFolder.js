var request = require('request');
var fs = require('fs');
var path = require('path');

const location="/media/big/music/"
var changePath = new RegExp ("^ms");


function mkdirp (dirPath, callback) {
    var cleanPath=dirPath.trim().replace(/\/\//g,"/").replace(/\/$/,"");
    console.log("creating path", cleanPath);
        var pathToBuild=cleanPath.split("/");
        var pathFragment=cleanPath.substr(0,1)==="/" ? "/" : "";
        while (pathToBuild.length > 0) {
            pathFragment=pathFragment+pathToBuild.shift();
            if (!fs.existsSync(pathFragment)) fs.mkdirSync(pathFragment);
            pathFragment=pathFragment+"/";
        }
    callback();
}

module.exports = function () {
    return function(req,res,next){
        if (res.doCache === undefined || res.doCache!==true) return next(); // do we need to cache ?
        if (res.URL== undefined || res.URL== "") return next(); // anything to cache ?
        var thePath=req.params.path.replace(changePath ,location);
        var theFile=thePath+"/Folder.jpg";
        mkdirp(thePath, function(){            //write the file in async mode, return faster
            console.log('saving local folder ',thePath);
            var writeFile = fs.createWriteStream(theFile);
            request(res.URL).pipe(writeFile); //writing file
        });
        return next();//error case. Useful here??
    }
}