var mpd = require('mpd'),
    cmd = mpd.cmd;
var client = mpd.connect({
    port: 6600,
    host: 'mbox'
});

module.exports = function (command) {
    return function(req,res,next){
        if (res.freshCache!==undefined && res.freshCache) return next(); //cached already
        var myCommand = command;
        var params = res.mpdParams == null ? [] : res.mpdParams;
        if(req.params.query != null) {
            var query = " \"" + req.params.query.replace(/\"/g, "\\\"") + "\"";
            myCommand += query;
        }
        console.log(myCommand);
        client.sendCommand(cmd(myCommand, params), function (err, msg) {
            if(err) throw err;
            res.msg = msg;
            return next();
        });
    }
};
