//from https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = 0;
        if (isNaN(a[property]) || isNaN(b[property])) {
            result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        } else {
            result = (parseInt(a[property]) < parseInt(b[property])) ? -1 : ( parseInt(a[property]) > parseInt(b[property])) ? 1 : 0;
        }
        return result * sortOrder;
    }
}

function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}
//finally not used 


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

        //sorting results, as it appears that mpd sometimes like mixing the track number only.
        //finally not used - messes the playlist - to do in the GUI.
        //JSONarray.sort(dynamicSortMultiple('Date', 'Album', 'Disc'));

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
                    myJson['sortCrit'] = myJson['Date']+myJson['Album']+myJson['Disc'] + String("00000000"+myJson['Track']).slice(-8);
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