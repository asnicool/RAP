var mpd = require('mpd'),
    cmd = mpd.cmd;
var client = mpd.connect({
    port: 6600,
    host: 'mbox'
});
// var cache = require('/opt/node/node_modules/memory-cache');
// var cacheValidity=3600; //seconds -> 1 hour



//batch raw interface: each line in array res.mpdParams is a full command
module.exports = function () {
    return function(req,res,next){
        if (res.freshCache!==undefined && res.freshCache) {console.log("using cache");return next();} //cached already
        var myCommand = "";
        var params = res.mpdParams == null ? [] : res.mpdParams;
        // if(req.params.query != null) {
        //     var query = " \"" + req.params.query.replace(/\"/g, "\\\"") + "\"";
        //     myCommand += query;
        // }
        params.unshift("command_list_begin");
        params.forEach(function(cmd){
            myCommand+=cmd+"\n";
        });
        myCommand+="command_list_end";
        console.log(myCommand);

//        if (cache.get(myCommand) === null) {
        client.sendCommand(myCommand, function (err, msg) {
            if(err) throw err;
            res.msg = msg;
//            cache.put(myCommand, msg, cacheValidity);
            return next();
        });
//        }else{ res.msg=cache.get(result); return next()}
    }
};
