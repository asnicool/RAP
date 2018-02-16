var config=require('../config/config.json');

var mpd = require('mpd'),
    cmd = mpd.cmd;

var client = mpd.connect({
    port: config.mpdPort || 6600,
    host: config.mpdHost || 'localhost'
});


module.exports = function (command) {
    return function(req,res,next){
        if (res.freshCache!==undefined && res.freshCache) return next(); //cached already
        
        if (command==="__batch__") {
            var myCommand = "";
            var params = res.mpdParams == null ? [] : res.mpdParams;
            params.unshift("command_list_begin");
            params.forEach(function(cmd){
                myCommand+=cmd+"\n";
            });
            myCommand+="command_list_end";
            console.log(myCommand);

            client.sendCommand(myCommand, function (err, msg) {
                if(err) throw err;
                res.msg = msg;
                return next();
            });
        } else {
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

    }
};
