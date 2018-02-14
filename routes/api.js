var express = require('express');
var router = express.Router();

/* MIDDLEWARES */
var mpdToJSON = require('../middleware/mpdToJSON');
var mpdListToJSON = require('../middleware/mpdListToJSON');
var mpdJSONListScreen = require('../middleware/mpdJSONListScreen');
var mpdJSONListPage = require('../middleware/mpdJSONListPage');
var structureAlbum = require('../middleware/structureAlbum');
var mpdJSONStructPage = require('../middleware/mpdJSONStructPage');
var respond = require('../middleware/respond');

var doCache = require('../app/doCache');

/* MPD QUERIES*/
var mpdInterface = require('../app/mpdInterface');
var mpdBatchInterface = require('../app/mpdBatchInterface');

/* FOLDER IMAGE SEARCHES*/
var fetchFolder = require('../app/fetchFolder');
var getFolder = require('../app/getFolder');
var readFolder = require('../app/readFolder');
var writeFolder = require('../app/writeFolder');

// MPD Local memory base
const mpdCache=require('../app/mpdCache');

// mpdCache.initAsync();

/*  

State  

*/
router.get('/current', 
    mpdInterface("currentsong"), 
    mpdToJSON(), 
    respond()
);

router.get('/playlist',
    mpdInterface("playlistinfo"),
    mpdListToJSON("file"),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/status', 
    mpdInterface("status"), 
    mpdToJSON(), 
    respond()
);

router.get('/seek-percent',
    mpdInterface("status"),
    mpdToJSON(),
    function (req, res, next) {
        var seek = {};
        seek.elapsed = res.JSON.elapsed;
        res.seek = seek;
        return next();
    },
    mpdInterface("currentsong"),
    mpdToJSON(),
    function (req, res, next) {
        res.seek.total = res.JSON.Time;
        res.JSON = res.seek;
        return next();
    },
    respond()
);

/*  

Actions  

*/
router.post('/play', mpdInterface("play"), function (req, res, next) {
    res.sendStatus(200);
});

router.post('/play/:trackId',
    function (req, res, next) {
        var mpdParams = [];
        mpdParams.push(req.params.trackId);
        res.mpdParams = mpdParams;
        return next();
    },
    mpdInterface("playid"),
    function (req, res, next) {
        res.sendStatus(200);
    }
);

router.post('/playAll/',
    function (req, res, next) {
        var mpdParams = [];
        mpdParams.push("clear");
        req.body.forEach (function(song){
            mpdParams.push("add \""+song+"\"");
        });
        mpdParams.push("play 0");
        res.mpdParams = mpdParams;
        return next();
    },
    mpdBatchInterface(),
    function (req, res, next) {
        res.sendStatus(200);
    }
);

router.post('/playNextAll/',    //FIXME: TODO 
    mpdInterface("currentsong"), //get current position
    mpdToJSON(), //res contains current pos
    function (req, res, next) {
        var mpdParams = [];
        var enqueuePos=parseInt(res.JSON.Pos)+1;
        console.log("enqueuing from " + enqueuePos);
        req.body.forEach (function(song, index){
            var position= index + enqueuePos;
            mpdParams.push("addid \"" + song + "\" " + position );
        });
        res.mpdParams = mpdParams;
        return next();
    },
    mpdBatchInterface(),
    function (req, res, next) {
        res.sendStatus(200);
    }
);

router.post('/enqueueAll/',
    function (req, res, next) {
        var mpdParams = [];
        req.body.forEach (function(song){
            mpdParams.push("add \""+song+"\"");
        });
        res.mpdParams = mpdParams;
        return next();
    },
    mpdBatchInterface(),
    function (req, res, next) {
        res.sendStatus(200);
    }
);


router.post('/pause', mpdInterface("pause"), function (req, res, next) {
    res.sendStatus(200);
});

router.post('/next', mpdInterface("next"), function (req, res, next) {
    res.sendStatus(200);
});

router.post('/previous', mpdInterface("previous"), function (req, res, next) {
    res.sendStatus(200);
});

router.post('/toggle-repeat',
    mpdInterface("status"),
    mpdToJSON(),
    function (req, res, next) {
        var repeat = res.JSON.repeat;
        if (repeat == 0) {
            res.mpdParams = [1];
        } else {
            res.mpdParams = [0];
        }
        return next();
    },
    mpdInterface("repeat"),
    function (req, res, next) {
        res.sendStatus(200);
    }
);

router.post('/toggle-random',
    mpdInterface("status"),
    mpdToJSON(),
    function (req, res, next) {
        var random = res.JSON.random;
        if (random == 0) {
            res.mpdParams = [1];
        } else {
            res.mpdParams = [0];
        }
        return next();
    },
    mpdInterface("random"),
    function (req, res, next) {
        res.sendStatus(200);
    }
);

router.get('/volumeInc/:vol',
    mpdInterface("status"),
    mpdToJSON(),
    function (req, res, next) {
        var volume = res.JSON.volume;
        volume=parseInt(volume)+parseInt(req.params.vol);
        if (volume < 0) volume=0;    
        if (volume > 100) volume=100;    
        res.mpdParams = [];
        res.mpdParams.push(volume);
        return next();
    },
    mpdInterface("setvol"),
    function (req, res, next) {
        res.sendStatus(200);
    }
);

router.get('/volume/:volume',
    function (req, res, next) {
        volume=parseInt(req.params.volume);
        if (volume < 0) volume=0;    
        if (volume > 100) volume=100;    
        res.mpdParams = [];
        res.mpdParams.push(volume);
        return next();
    },
    mpdInterface("setvol"),
    function (req, res, next) {
        res.sendStatus(200);
    }
);



/*

Folder proxy


*/
router.get('/Folder/:artist/:album/:path',
    readFolder(), //try local file
    getFolder(),   //try local server
    fetchFolder(), //try remote server, and cache locally if found
    writeFolder(), //write local file if needed, for next time
    function (req, res, next) {
        res.contentType('image/jpeg');
        
        if (res.URL== undefined || res.URL=="") {
            // res.URL="http://localhost:3000/img/DefaultFolder.jpg";
            // res.Resource=request(res.URL);
            res.status(404);
            res.end();
        } else {
            res.status(200);
            res.Resource.pipe(res);
        }
    }
);

/*  

dB queries 

*/
router.get('/albumList/:size/:page',
    mpdInterface("list album"),
    mpdListToJSON("Album"),
    mpdJSONListPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/artistList/:size/:page',
    mpdInterface("list artist"),
    mpdListToJSON("Artist"),
    mpdJSONListPage(),
    function(req, res, next) {
        var JSONSartists = res.JSON;
        JSONSartists.forEach(function(item){
            item.Album=item.Artist;
            item.Date="";
        });
        next();
    },
    function (req, res, next) {
        res.json(res.JSON);
    }
);

//external info per album, from amz
router.get('/extInfo/:artist/:album',
    fetchFolder(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

//find albums from the whole list, will be usefull once mpd db cache is implemented
//todo: some caching
router.get('/albumsSearch/:size/:page/:grepString',
    mpdInterface("list album"), 
    mpdListToJSON("Album"),
    mpdJSONListScreen("Grep", "Album"),
    mpdJSONListPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

// gives a list of albums for matching artists --not used. requires enrichment
router.get('/artistAlbumsSearch/:size/:page/:grepString',
    mpdInterface("list artist"), 
    mpdListToJSON("Artist"),
    mpdJSONListScreen("Grep","Artist"),
    mpdJSONListPage(), //we've got the list of artists, not the albums yet
    function (req, res, next) {
        res.json(res.JSON);
    }
);

//find exact match albums from MPD and gives a list of songs; used in the FE album per album
//replaced by albumStruct/:query
router.get('/albums/:query',
    mpdInterface("find album"),
    mpdListToJSON("file"),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/artists/:query',
    mpdInterface("find artist"),
    mpdListToJSON("file"),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

//random list of albums, note that :pageId is actually not used (not applicable)
router.get('/albumsRandom/:pageSize/:page', 
    doCache("get","list album", "JSON"), //check cache for current request
    mpdInterface("list album"), 
    mpdListToJSON("Album"),
    doCache("put","list album", "JSON"), //fill cache for next requests
    mpdJSONListScreen("Random","Album"),
    function (req, res, next) {
        res.json(res.JSON);
    }
);
//random albums :query and :page are ignored
router.get('/albumsRandomStruct/:query/:pageSize/:page',        
    doCache("get","list album", "JSON"), //check cache for current request
    mpdInterface("list album"), 
    mpdListToJSON("Album"),
    doCache("put","list album", "JSON"), //fill cache for next requests
    mpdJSONListScreen("Random","Album"),
// testing: enrich data and send structured answer
    function(req,res,next){
        console.log("enriching");
        delete res.freshCache;
        res.mpdParams=[];
        var RandAlb=res.JSON
        RandAlb.forEach(function (item) {
            res.mpdParams.push("find album \""+item.Album+"\"");
        });
        console.log(res.mpdParams);
        return next();
    },
    mpdBatchInterface(),
    mpdListToJSON("file"),
    structureAlbum(),
// :testing
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);


//exact matches, full details structured by album

router.get('/playlistStruct',
    mpdInterface("playlistinfo"),
    mpdListToJSON("file"),
    structureAlbum(),
    mpdInterface("playlistinfo"),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/albumStruct/:query',
    doCache("get","find album", "JSON"), //fill cache for next requests
    mpdInterface("find album"),
    mpdListToJSON("file"),
    doCache("put","find album", "JSON"), //fill cache for next requests
    structureAlbum(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/artistStruct/:query/:pageSize/:page',
    doCache("get","find artist", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("find artist"),
    mpdListToJSON("file"),
    doCache("put","find artist", "JSON"), //fill cache for next requests
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/dateStruct/:query/:pageSize/:page',
    doCache("get","find date", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("find date"),
    mpdListToJSON("file"),
    doCache("put","find date", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/genreStruct/:query/:pageSize/:page',
    doCache("get","find genre", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("find genre"),
    mpdListToJSON("file"),
    doCache("put","find genre", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

//partial matches, slower search, full details
router.get('/albumMatchStruct/:query/:pageSize/:page',
    doCache("get","search album", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("search album"),
    mpdListToJSON("file"),
    doCache("put","search album", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/artistMatchStruct/:query/:pageSize/:page',
    doCache("get","search artist", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("search artist"),
    mpdListToJSON("file"),
    doCache("put","search artist", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/dateMatchStruct/:query/:pageSize/:page',
    doCache("get","search date", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("search date"),
    mpdListToJSON("file"),
    doCache("put","search date", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);

router.get('/genreMatchStruct/:query/:pageSize/:page',
    doCache("get","search genre", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    mpdInterface("search genre"),
    mpdListToJSON("file"),
    doCache("put","search genre", "JSON"), //fill cache for next requests, note: query is automatically sorted out
    structureAlbum(),
    mpdJSONStructPage(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);


module.exports = router;
