module.exports = function () {
    return function(req,res,next){
        var JSONarray= res.JSON;
        var fullDataSetLength = JSONarray.length;
        var pageSize = req.params.size == null ? 20 : req.params.size;
        var pageNb = (req.params.page == null || parseInt(req.params.page) == -1) ? Math.round(Math.random()*fullDataSetLength/pageSize) : req.params.page;
        var startPos = (parseInt(pageNb)-1) * parseInt(pageSize);
        var endPos = Math.min(fullDataSetLength, parseInt(startPos) + parseInt(pageSize))-1;

        var pagedArray = JSONarray.slice(startPos, endPos+1);

        //adding properties
        var meta = {
            'meta': true,
            'pageNb': pageNb,
            'startPos' : startPos, 
            'endPos': endPos,
            'fullDataSetLength' :fullDataSetLength
        }
        pagedArray.unshift(meta);
        console.log ("paging results p"+pageNb+" size="+pageSize + " start-end=" + startPos + "-" + endPos + "array size="+fullDataSetLength);

        res.JSON = pagedArray;
        return next();
    }
};