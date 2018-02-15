var config=require('../config/config.json');
var destURL=config.getFolderTarget === undefined || config.getFolderTarget === "" ? config.getFolderTarget : "";
config.getFolder = config.getFolderTarget === undefined || config.getFolderTarget === "" ? false : config.getFolder

var request = require('request');
var fs = require('fs');
var path = require('path');

function checkLocImg (theURL, cllbck) {
    request.head (theURL, function(error,response,body) {
      console.log("fetch local:\t "+ theURL);
        if (error !== null) console.log("got error "+ error);
        if (response.statusCode !==200) {
            console.log ("not found -- error: "+response.statusCode,response.statusMessage);
            theURL="";
        };
        cllbck(theURL);
    });
}

module.exports = function () {
    return function(req,res,next){
        if (!config.getFolder) return next();
        if (res.URL!== undefined && res.URL!== "") return next(); 
        console.log('lookup local http for folder ', req.params.path);
        var theURL=destURL+req.params.path.replace(/\/$/,"")+"/Folder.jpg";
        checkLocImg (theURL, function(checkedURL){
            if (res.JSON!==undefined) res.JSON['folderURL']=checkedURL;
            if (checkedURL!=="") {
                res.URL=checkedURL; //invalidates other lookups
                res.Resource=request(checkedURL);
            } 
            return next();//error case. Useful here??
        });
    }
};
