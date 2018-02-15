module.exports = function () {
    return function(req,res,next){
        if (res.freshCache!==undefined && res.freshCache) next(); //cached already
        var lines = res.msg.split('\n');
        var jsonString = "{";
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line != "") {
                if (i != 0) {
                    jsonString = jsonString.concat(",");
                }
                var lineItems = line.replace(/"/g,"\\\"").split(':');
                jsonString = jsonString.concat("\"" + lineItems[0] + "\":" + "\"" + lineItems[1].trim() + "\"");
            }
        }
        jsonString = jsonString.concat("}");
        //adding a new field for Folder image if the file field is present
        //dirty hack, needs to add a router entry instead, based on '.file' as songid.
        var myJson = JSON.parse(jsonString);
        if (myJson.file !== undefined) { //this is actually a file
            myJson['imgSource'] = "api/Folder/"+encodeURIComponent(myJson.Artist)+"/"+encodeURIComponent(myJson.Album)+"/"+encodeURIComponent(myJson.file.replace (/[^/]*$/g,""));
            myJson['timeDisplay']=String("0" + Math.floor(myJson.Time/60)).slice(-2)+":"+String("0" + Math.floor(myJson.Time%60)).slice(-2)
        }

        res.JSON = myJson;
        //res.JSON = JSON.parse(jsonString);
        return next();
    }
};