var fs = require('fs');
var path = require('path');

var config=require('../config/config.json');
var location=config.folderBasePath || "../public/db";
var urlPathFilter= config.urlPathFilter===undefined ? "" : config.urlPathFilter;
var changePath = new RegExp ("^"+urlPathFilter);

function checkLocImg (thePath, cllbck) {
    var checkedPath=location;
    checkedPath=thePath.replace(changePath,location);
    if (!fs.existsSync(checkedPath)) checkedPath="";
    cllbck(checkedPath);
}

module.exports = function () {
    return function(req,res,next){
        if (res.URL!== undefined && res.URL!== "") return next(); //URL already found
        console.log('lookup local  for folder ');
        console.log(req.params.path);
        var thePath=req.params.path.replace(/\/$/,"")+"/Folder.jpg";
        checkLocImg (thePath, function(checkedPath){
            //res.headers=response.headers
            if (checkedPath!==""){
                if (res.JSON!==undefined) res.JSON['folderURL']=thePath;
                res.URL=thePath; //means we found something, invalidate next steps
                console.log("serving from disk ",checkedPath)
                res.Resource=fs.createReadStream(checkedPath);
                return next();
            }
            return next();//error case
        });
    }
};
