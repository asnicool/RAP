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

global.getFolder=false;

module.exports = function () {
    return function(req,res,next){
        if (global.getFolder!==undefined && global.getFolder==false) return next(); 
        if (res.URL!== undefined && res.URL!== "") return next(); 
        console.log('lookup local http for folder ', req.params.path);
        var theURL="http://mbox:8000/"+req.params.path.replace(/\/$/,"")+"/Folder.jpg";
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
