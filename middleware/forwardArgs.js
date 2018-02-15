module.exports = function () {
    return function(req,res,next){
        //passing the viewtype info to the page
        console.log (req.params);
        res.JSON=req.params;
        
        res.JSON.params=req.params;

        //set default value for the view
//        var passedViewType= req.params.viewType == null ? "randomAlbum" : req.params.viewType;
//        res.JSON.params.viewType = passedViewType;
        return next();
    }
};