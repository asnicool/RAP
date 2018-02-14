var express = require('express');
var router = express.Router();


/* FOLDER IMAGE SEARCHES*/
var fetchFolder = require('../app/fetchFolder');
var getFolder = require('../app/getFolder');
var readFolder = require('../app/readFolder');
var writeFolder = require('../app/writeFolder');


/*

Folder proxy


*/
router.get('/:artist/:album/:path',
    readFolder(), //try local file
    getFolder(),   //try other server
    fetchFolder(), //try remote server, and cache locally if found
    writeFolder(), //write local file if needed, for next time
    function (req, res, next) {
        res.contentType('image/jpeg');
        console.log('sending Folder info for' + res.URL);
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


//external info per album, from amz
router.get('/extInfo/:artist/:album',
    fetchFolder(),
    function (req, res, next) {
        res.json(res.JSON);
    }
);



module.exports = router;
