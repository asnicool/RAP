module.exports = function (firstField) {
    return function(req,res,next){
        if (res.freshCache!==undefined && res.freshCache) return next(); //cached already
        var lines = res.msg.split('\n');
        var jsonString = "[{";

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line != "") {
                if (i != 0 && line.indexOf(firstField) > -1) {
                    if (jsonString.slice(-1)!="{") jsonString = jsonString.concat('},{');
                } else if (i != 0) {
                    jsonString = jsonString.concat(",");
                }

                var lineItem = line.slice(0,line.indexOf(':'));// or line.split(':')[0]; // avoid bug when ":" is in the fields
                var lineContent = line.slice(line.indexOf(':')+1);

                if (lineContent.trim()!=="") jsonString = jsonString.concat("\"" + lineItem + "\":" + "\"" + lineContent.trim().replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"");
            }
        }

        jsonString = jsonString.concat("}]");
        var JSONarray= JSON.parse(jsonString);


        //Enriching the info when in file mode (all data list albums)
        //We suppose that the JSON array is/are sorted to add an album picture toether with 1st track
        if (firstField === "file") {
            var prevJSON={};
            var albHeaderJSON={};
            JSONarray.forEach(function (myJson){
                if (myJson.file !== undefined) {
                    // myJson['imgSource'] = encodeURI("http://htpc.local:8000/"+ myJson.file.replace (/[^/]*$/g,"")+"Folder.jpg")
                    myJson['imgSource'] = "api/Folder/"+encodeURIComponent(myJson.Artist)+"/"+encodeURIComponent(myJson.Album)+"/"+encodeURIComponent(myJson.file.replace (/[^/]*$/g,""));

                    myJson['timeDisplay']=String("0" + Math.floor(myJson.Time/60)).slice(-2)+":"+String("0" + Math.floor(myJson.Time%60)).slice(-2)
                }
                myJson.showHeader = false;
                if (myJson.imgSource !== prevJSON.imgSource) {
                    //this is a new album
                    //close the previous album info (if not 0)
                    //set this album as new for the rest
                    myJson.showHeader = true;
                } 
                prevJSON=myJson;
            });
        }

        res.JSON = JSONarray;
        return next();
    }
};