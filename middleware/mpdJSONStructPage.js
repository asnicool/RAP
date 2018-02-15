module.exports = function () {
    return function(req,res,next){
        var structDataToPage=res.JSON;
        var fullDataSetLength=structDataToPage.nbEntries;
        delete structDataToPage.nbEntries;
        var pageSize = req.params.pageSize == null ? 20 : parseInt(req.params.pageSize);
        if (fullDataSetLength>pageSize) {
            var pageNb = (req.params.page == null || parseInt(req.params.page) == -1) ? Math.round(Math.random()*fullDataSetLength/pageSize) : parseInt(req.params.page);
            
            var startPos = parseInt(pageNb) * parseInt(pageSize);
            var endPos = Math.min(fullDataSetLength, parseInt(startPos) + parseInt(pageSize));
            var slicedData=structDataToPage.data.slice(startPos, endPos);
            
            var Meta={
                nbEntries: pageSize,
                pageId: pageNb,
                startPos: startPos,
                endPos: endPos,
                fullDataSetLength: fullDataSetLength,
                maxPage: Math.floor(parseInt(fullDataSetLength-1)/parseInt(pageSize))
            }

            structDataToPage.data=slicedData;
            structDataToPage.meta=Meta;

            res.JSON=structDataToPage;
        } else {
            //just add some standard info
            res.JSON.meta={
                nbEntries: fullDataSetLength,
                pageId: 0,
                startPos: 0,
                endPos: fullDataSetLength,
                fullDataSetLength: fullDataSetLength,
                maxPage: 0
            }            
        }
        return next();
    }
};