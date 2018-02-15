module.exports = function (screenType, screenField) {
    return function(req,res,next){
        var JSONarray= res.JSON;
        //special treatment in case of Random Albums: reply 20 random entries
        // in this case we know there is one entry=one album
        //this shall be put in a intermediate MW
        if (screenType === "Random") {
            var outArray=[];
            var maxEntries=(req.params.pageSize!==undefined) ? req.params.pageSize : 20;
            var totalItems = JSONarray.length;
            var selectedEntries=[];
            var randomIndex=0;
            for (var Rindex = 0; Rindex < maxEntries; Rindex++) {
                randomIndex=Math.floor(totalItems * Math.random());
                selectedEntries.push(randomIndex);
                outArray.push(JSONarray[randomIndex]);
                JSONarray.splice(randomIndex,1);
                totalItems=totalItems-1;
            }
            console.log(totalItems+ " entries to pick from: "+ selectedEntries);
            console.log(outArray);
        }

        if (screenType === "Grep" && req.params.grepString !== undefined && req.params.grepString !== null && req.params.grepString !== "") {
            var outArray=[];
            if (req.params.pageSize !==undefined) maxEntries = req.params.pageSize;
            //let's filter based on grep string
            var totalItems = JSONarray.length;
            console.log("grep from #"+totalItems+" items")
            var selectedEntries=[];
            if (req.params.grepString.length<3){
                var grepFilter = new RegExp("^"+req.params.grepString,"gi");
            } else {
                var grepFilter = new RegExp(req.params.grepString,"gi");
            }
            console.log("grep entires for: "+grepFilter);

            for (var Rindex = 0; Rindex < totalItems; Rindex++) {
                // console.log("looking at :"); 
                // console.log(JSONarray[Rindex]["Album"]);
                if(grepFilter.test(JSONarray[Rindex][screenField])) {
                    selectedEntries.push(Rindex);
                    outArray.push(JSONarray[Rindex]);
                }
            }
            console.log(totalItems +" " + screenField + " entries to pick from: "+ selectedEntries);
            console.log(outArray);
        }

        res.JSON = outArray;
        return next();
    }
};