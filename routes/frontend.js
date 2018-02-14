var express = require('express');
var router = express.Router();

var mpdInterface = require('../app/mpdInterface');
var mpdListToJSON = require('../middleware/mpdListToJSON');
var renderMW = require('../middleware/renderMW');
var mpdJSONListScreen = require('../middleware/mpdJSONListScreen');
var forwardArgs = require('../middleware/forwardArgs');

/* GET home page. */
//more Angular driven pages (they will call the API to init on browser side)
router.get('/', renderMW('pageView'));


router.get('/playlist', renderMW('playlist'));
router.get('/current', renderMW('current'));

//used to show a list of albums which enrich one after the other
//viewType=albumRandom is a specific case
router.get('/AlbumDisplay/:viewType', forwardArgs(), renderMW('browseAlbumsDyna'));
router.get('/search', renderMW('search'));


//EJS based rendering, data filled from server and sent with the page - hardly scalable for paging
router.get('/browse/artists', mpdInterface("list artist"), mpdListToJSON("Artist"), renderMW('browseArtists'));
router.get('/browse/albums', mpdInterface("list album"), mpdListToJSON("Album"), renderMW('browseAlbums'));

router.get('/albumDetails/:query', forwardArgs(), renderMW('albumsDyn'));

router.get('/browse/genres', mpdInterface("list genre"), mpdListToJSON("Genre"), renderMW('browseGenres'));

router.get('/status', renderMW('status'));

router.get('/singlePage', renderMW('pageView'));



module.exports = router;
