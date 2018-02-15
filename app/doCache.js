var config=require('../config/config.json');
var cacheValidity=config.cacheValidity || 3600000;

//Answer to the requests
module.exports = function (action,shortURLhint, format) { 
// action=put or get or getAhead
// URLhint=fragment or URL serving as id for the cache
// format=object to fill and monitor as RES property
// somthimes cache is actually a "get ahead", for random Albums for instance

    return function(req,res,next){
        var qHint=req.params.query==undefined ? "" : req.params.query;
        console.log("cache", action ,shortURLhint, qHint)
        URLhint=shortURLhint+ qHint;
        if (action==="put") {
            console.log("cache put");
            var contentToCache = res[format]; // this is the list of albums
            if (contentToCache !== undefined) {
                console.log("caching ", URLhint, "data len=", contentToCache.length)
                if (global.MemCache.get(URLhint+format)===null){ //that was not in cache
                    global.MemCache.put(URLhint+format, contentToCache, cacheValidity, function(key, value){
                        console.log("cache emptied for ", key, value.length)
                        //we should renew cache here
                    });
                }
                res.freshCache=false; //after this cache, action, next modules must operate, not skip
                return next();
            } else return next();            
        }
        if (action==="get") {
            console.log("cache get");
            if (res[format]===undefined){ //nothing found already
                console.log("res[format]===undefined")
                var fromCache=global.MemCache.get(URLhint+format);
                if (fromCache!==null) {
                    console.log("using cache ", URLhint, "data len=",fromCache.length)
                    res[format]=fromCache;
                    res.freshCache=true; // the remainder of the {URLhint: URLhint, format: format}
                    return next();
                } else return next();
            } else return next();
        }
//        return next();
    }
};
