(function () {

    var app = angular.module('RAP', [
        'ngRoute', 
        'rzModule', 
        'ngImage',
        'angularLazyImg'
        ]).config(['lazyImgConfigProvider', function(lazyImgConfigProvider){
                  var scrollable = document.querySelector('#scrollable');
                  lazyImgConfigProvider.setOptions({
                    offset: 20, // how early you want to load image (default = 100)
                    // errorClass: 'error', // in case of loading image failure what class should be added (default = null)
                    successClass: 'animated fadeIn' // in case of loading image success what class should be added (default = null)
                    // onError: function(image){}, // function fired on loading error
                    // onSuccess: function(image){}, // function fired on loading success
                    // container: angular.element(scrollable) // if scrollable container is not $window then provide it here. This can also be an array of elements.
                  });
                }]);

    app.config(function($routeProvider) {
      $routeProvider

      .when('/playlistDep', {
        templateUrl : '../AngularHTML/playlist.html',
        controller  : 'PlaylistController'
      })

      .when('/browseAlbumsDyna/:viewType', {
        templateUrl : '../AngularHTML/browseAlbumsDyna.html',
        controller  : 'AlbumController'
      })

      .when('/status', {
        templateUrl : '../AngularHTML/status.html',
        controller  : 'StatusController'
      })
        
      .otherwise({redirectTo: '/browseAlbumsDyna/albumsSearch/'});
    });




    app.filter('normalize', function () {
    return function (stringToNormalize) {
       return stringToNormalize.toString().toLowerCase()
       .replace(/\ & /gi," and ")
       .replace(/\ et /gi," and ")
       .replace(/[\ -]*mono$/,"")
       .replace(/[\ -]*disc [0-9]$/i,"")
       .replace(/[^a-zA-Z0-9 ]/g, "")
       .replace(/^the\ /i,"")
       .replace(/\[[^\]]*\]$/g,"")
       .replace(/\([^\)]*\)$/g,"")
       .trim();
        }
    });


       
    app.controller('CurrentController', function ($scope, $interval, $http) {
        $interval(function () {
            $http.get('/api/current').success(function (data) {
                $scope.currentSong = data;
            })
        }, 1000);
    });

    app.controller('SeekerController', function ($scope, $interval, $http) {
        $interval(function () {
            $http.get('/api/seek-percent').success(function (data) {
                $scope.seekPercent = (data.elapsed / data.total) * 100;
            })
        }, 1000);
    });


    app.filter('dateDisplay', function() {
        return function (item) {
            return String("0" + Math.floor(item/60)).slice(-2)+":"+String("0" + Math.floor(item%60)).slice(-2)}
    });

    app.controller('StatusController', function ($scope, $interval, $timeout, $http) {
        $scope.volume_slider={
            'value' : 0,
            'visible':false,
            'options' : {'showSelectionBar': true, 
                         floor: 0,
                         ceil: 100,
                         onEnd: function () { $scope.volume($scope.volume_slider.value)}
                        }
        };
        
        
        $scope.toggleVolume = function () {
            console.log("toggleVolume from "+ $scope.volume_slider.visible)// $scope.volume_slider.visible=!$scope.volume_slider.visible;
            if ($scope.volume_slider.visible== undefined) $scope.volume_slider.visible=true;
            else $scope.volume_slider.visible=!$scope.volume_slider.visible;

            if ($scope.volume_slider.visible) $scope.refreshSlider();
        }

        $scope.refreshSlider = function () {
            $timeout(function () {
                $scope.$broadcast('rzSliderForceRender');
            });
        };

        $scope.play = function () {
            $http.post('/api/play');
        };

        $scope.pause = function () {
            $http.post('/api/pause');
        };

        $scope.next = function () {
            $http.post('/api/next');
        };

        $scope.previous = function () {
            $http.post('/api/previous');
        };

        $scope.toggleRandom= function () {
            $http.post('/api/toggle-random');
        };

        $scope.toggleRepeat = function () {
            $http.post('/api/toggle-repeat');
        };

        $scope.volume = function (vol) {
            $http.get('/api/volume/'+vol);
        };

        $scope.volumeInc = function (vol) {
            $http.get('/api/volumeInc/'+vol);
        };

        $interval(function () {
            $http.get('/api/status').success(function (data) {
                $scope.status = data;
                $scope.playing = data.state == "play";
                $scope.repeat = data.repeat != 0;
                if ($scope.repeat) {
                    $scope.repeatStyle = "color:#0ce3ac";
                } else {
                    $scope.repeatStyle = "color:#ddd";
                }
                $scope.random = data.random != 0;
                if ($scope.random) {
                    $scope.randomStyle = "color:#0ce3ac";
                } else {
                    $scope.randomStyle = "color:#ddd";
                }
                $scope.volume_slider.value=data.volume;

            });
        }, 1000);
    });

    app.controller('ArtistController', function ($scope, $http) {
        $http.get('/api/artists').success(function (data) {
            $scope.artists = data;
        });
    });


    
    
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    app.service('AlbumService', ['$http', function($http){
        //fetch detaild (track list) from an album name

        this.getAlbumDetails=function(albumName){
            var htreq = $http.get('/api/albumStruct/'+encodeURIComponent(albumName)).success(function (data) {
                return data; //will have to care about twin albums with same names
            });
            return htreq; 
        }
        //fetch a list of 'count' albums in random fashion
        //legacy to get rid of - keep fetchDataFromServer instead
        this.randomList=function(count){
            var htreq = $http.get('/api/albumsRandom/'+count+'/1').success(function (data) {
               return data;
            });
            return htreq; 
        }

        this.fetchStructDataFromServer=function(criterion, nbEntries, pageId, searchStr){
            var htreq = $http.get('/api/'+criterion+'/'+encodeURIComponent(searchStr)+'/'+nbEntries+'/'+pageId).success(function (data) {
                return data; //data is structured already on server
            });
            return htreq; 
        }

        this.fetchDataFromServer=function(viewType,PageSize,PageId,queryStr){
            if (queryStr!== undefined){
                var htreq = $http.get('/api/'+viewType+'/'+PageSize+'/'+PageId+'/'+encodeURIComponent(queryStr)).success(function (data) {
                   return data;
                });
            } else {
                var htreq = $http.get('/api/'+viewType+'/'+PageSize+'/'+PageId).success(function (data) {
                   return data;
                });
            }
            return htreq; 
        }
    }]);




    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    app.controller('AlbumController', function ($scope, $interval, $http, $routeParams,$timeout, AlbumService) {
        $scope.Math = window.Math;
        $scope.alDetToggle="";
        $scope.refreshSlider = function (callback) {
            var value=($scope.PageInfo!==undefined && $scope.PageInfo.PageId!==undefined) ? $scope.PageInfo.PageId : 0;
            var ceil=($scope.PageInfo!==undefined && $scope.PageInfo.maxPageAvail!==undefined) ? $scope.PageInfo.maxPageAvail : 0;
            console.log('slider:', value, ceil)
            $scope.album_slider={
                value: parseInt(value),
                options: {
                    floor: 0,
                    ceil: parseInt(ceil),
                    onEnd: function () { 
//                        if ($scope.PageInfo.PageId !== $scope.album_slider.value)  $scope.getAlbumData($scope.PageInfo.viewType,$scope.PageInfo.viewPageSize,$scope.album_slider.value)
                        if ($scope.PageInfo.PageId !== $scope.album_slider.value) 
                            callback(
                                $scope.PageInfo.viewType,
                                $scope.PageInfo.PageSize,
                                $scope.album_slider.value,
                                $scope.searchString
                                );
                    }
                }
            };
            if (ceil>0){
                $scope.albumsSliderHide = false;
                $timeout(function () {
                    $scope.$broadcast('rzSliderForceRender');
                },50);
            } else {
                $scope.albumsSliderHide = true;
            }
        };

        $scope.encURIC = function (textToEncode) {
            return encodeURIComponent(textToEncode);
        }//not sure it's needed?


        $scope.albumsRandomHide = false;
        $scope.showDetails=false;
        $scope.PageInfo={};
        $scope.PageInfo.thinking=false;
        $scope.PageInfo.PageTitle=$routeParams.viewType;

        $scope.selectedAlbumDetails={};
        $scope.showSearch=$routeParams.viewType === "albumsSearch";

        //init slider
        $scope.refreshSlider($scope.getAlbumData);
        $scope.searchStringFromJS="";

        //this is used for the case where a list of albums is first fetched, and then albumDetails are taken
        //not really suite for a search

        $scope.getPageSize = function (viewType) {
            if ($scope.PageInfo==undefined) $scope.PageInfo={};
            //Paging defaults
            var availableWidth = angular.element(document.getElementById("albumCollection"))[0].clientWidth;
            console.log(availableWidth);
            var defaultLineSizeFromWindowSize=Math.floor(availableWidth/128); //one line of small album frames / see CSS
            var defaultPageSize=Math.floor(16/defaultLineSizeFromWindowSize)*defaultLineSizeFromWindowSize;
            //30 entries max
            if (viewType!==undefined && viewType.search(/album/i)<0) defaultPageSize=defaultPageSize*4;

            $scope.PageInfo.defaultPageSize=defaultPageSize;
        }

        $scope.getAlbumData = function (
            viewType,
            viewPageSize,
            viewPageId,
            searchStr
            ) {
            $scope.PageInfo={PageTitle: "getting data...",thinking:true}
            $scope.albumsSliderHide = true;
            console.log ('call getAlbumData ',viewType,viewPageSize,viewPageId,searchStr,$routeParams.viewType);
            //fix ViewType if not passed in the call
            viewType=(viewType == undefined || viewType == null) ? $routeParams.viewType : viewType;

            searchStr=$scope.PageInfo.searchString;
            console.log("using viewType:", viewType)

            //convention page id = -1 means find a random page to start with. Implementation on server
            $scope.getPageSize(viewType);
            var PageSize = (viewPageSize == null || viewPageSize == undefined)  ? $scope.PageInfo.defaultPageSize : viewPageSize;
            var PageId = (viewPageId == null || viewPageId == undefined) ? -1 : viewPageId;
            var PageTitle = viewType // later have a translation object

            console.log("calling now fetchDataFromServer",viewType,PageSize,PageId,searchStr);
            AlbumService.fetchDataFromServer(viewType,PageSize,PageId,searchStr).then(function(data){
                var meta={'pageNb': PageId, 'fullDataSetLength':10}//defaults
                //looking for paging meta data as first element 
                if (data.data[0].meta !== undefined) {
                    meta=data.data.shift();
                }

                console.log("meta");
                console.log(meta);
                //add pseudo path to albums
                $scope.albums = [];
                data.data.forEach(function (item){
                    item.Path="";
                    $scope.albums.push(item)
                });
                console.log(data.data);

                PageId=meta.pageNb;
                var maxPageAvail= Math.floor(meta.fullDataSetLength/PageSize)-1;
                $scope.PageInfo={
                    'viewType'  : viewType,
                    'PageSize'  : PageSize, 
                    'PageId'    : PageId, 
                    'PageTitle' : PageTitle,
                    'maxPageAvail': maxPageAvail,
                    'startPos'  : meta.startPos+1,
                    'endPos'    : meta.endPos,
                    'fullDataSetLength' :meta.fullDataSetLength,
                    'searchStr': searchStr
                }
                $scope.AlbumsDetails={};
                $scope.PageInfo.thinking=false;
                $scope.refreshSlider($scope.getAlbumData);

                //change only if needed to avoid wrong display
                console.log($scope.PageInfo);
            });
        }


        //show something when landing on page (artist list, or album list)
        $timeout(function(){
            var firstViewType= $routeParams.viewType;           
            //case albumSearch but no search string yet
            if ($routeParams.viewType=='albumsSearch' && ($scope.searchString==undefined || $scope.searchString==null || $scope.searchString=="")) firstViewType='albumsRandom'; 
            $scope.getAlbumData(firstViewType);//async init  first fetch
            },1000);

        //this one is made to get albums matching a search criterion, no paging
        $scope.searchAlbumData = function (
            criterion,
            viewPageSize,
            viewPageId,
            searchStr
            ) {
            $scope.PageInfo={PageTitle: "searching...",thinking:true}
            $scope.albumsSliderHide = true;
            
            //convention page id = -1 means find a random page to start with. Implementation on server
            $scope.getPageSize(criterion);
            var pageSize = (viewPageSize == null || viewPageSize == undefined)  ? $scope.PageInfo.defaultPageSize : viewPageSize;
            var pageId = (viewPageId == null || viewPageId == undefined) ? -1 : viewPageId;
            var pageTitle = criterion // later have a translation object

            console.log("using criterion:", criterion)

            console.log("calling now fetchStructDataFromServer",criterion,searchStr,pageSize,pageId);
            AlbumService.fetchStructDataFromServer(criterion,pageSize,pageId,searchStr).then(function(data){
                console.log("fetchStructDataFromServer",criterion,searchStr,pageSize,pageId);
                console.log(data.data);
                $scope.albums=[]; //remove all
                $scope.AlbumsDetails={}//the list of albums to show with details, we need to extract the whole list
                var albumList=[];
                var searchMatches=0;
                data.data.data.forEach(function(item){
                     console.log(item);
                     if (item.Album!==undefined){
                        searchMatches++;
                        albumList.push({Album: item.album, Path:item.Path})
                    }
                });
                var meta=data.data.meta;
                var actualStartPos=parseInt(meta.startPos)+1;
                $scope.PageInfo={
                    viewType: criterion,
                    PageSize: meta.nbEntries,
                    PageId: meta.pageId,
                    startPos:  actualStartPos,
                    endPos:  meta.endPos,
                    maxPageAvail:  meta.maxPage,
                    fullDataSetLength: meta.fullDataSetLength,
                    searchStr: searchStr,
                    PageTitle: "showing "+searchMatches+" matches for "+searchStr+" ["+actualStartPos+"-"+meta.endPos+"]/"+meta.fullDataSetLength
                }
                $scope.refreshSlider($scope.searchAlbumData);

                //sort albums tracks as it is sometimes messed up by mpd
                data.data.data.forEach(function(albumEntry){
                    albumEntry.Tracks.sort(function (a,b) {
                        return (parseInt(a['sortCrit']) < parseInt(b['sortCrit'])) ? -1 : ( parseInt(a['sortCrit']) > parseInt(b['sortCrit'])) ? 1 : 0;
                    });
                });

                // triggers updating the gui
                $scope.albums=albumList; 
                $scope.AlbumsDetails=data.data.data;

                //hide the slide we show it all
                $scope.PageInfo.thinking=false;
            });
        }



        $scope.closeAlbumDetails = function () {
            console.log('openAlbumDetails for id: '+$scope.selectedAlbumDetails.Album);
            $scope.selectedAlbumDetails={};
            $scope.alDetToggle="animated fadeOutLeft";
            $timeout(function (){
                $scope.showDetails=false;
            }, 1000);
        }

        $scope.openAlbumDetails = function (idOnPage) {
            $scope.alDetToggle="animated fadeInLeft";
            $scope.showDetails=true;
            $scope.selectedSongs={};
            $scope.selectedAlbumDetails=$scope.AlbumsDetails[idOnPage];
            $scope.selectedAlbumDetails.index=idOnPage;
            $scope.selectedAlbumDetails.amzURL="https://www.allmusic.com/search/album/"+encodeURIComponent($scope.selectedAlbumDetails.Album)+"%20"+encodeURIComponent($scope.selectedAlbumDetails.Artist);

            console.log('openAlbumDetails for id: '+idOnPage+" album: "+$scope.selectedAlbumDetails.Album);
            console.log($scope.selectedAlbumDetails);
        }
        
        $scope.selectSong = function (songPath) {
            console.log("selectSong",songPath);
            if ($scope.selectedSongs[songPath]!== undefined) {
                delete $scope.selectedSongs[songPath]; //remove song
            } else {
                //get sond id
                maxId=0
                Object.keys($scope.selectedSongs).forEach(function(thisSong){ if (maxId<$scope.selectedSongs[thisSong]) maxId=$scope.selectedSongs[thisSong]});
                $scope.selectedSongs[songPath]=maxId+1; //Object.keys($scope.selectedSongs).length+1; //put it in the last position
            }
        }

        $scope.playAll = function (idOnPage, method) {
            //get new files from the service;
            var callType= (method == null || method == undefined) ? playAll : method
            console.log('playAll:'+method+' -> '+callType);
            var thisAlbumDetails=$scope.AlbumsDetails[idOnPage];
            var playlist=[];
            var plSize=Object.keys($scope.selectedSongs).length;
            console.log("playall "+thisAlbumDetails.Album);
            if (thisAlbumDetails !== undefined) {
                if (plSize>0) { //custom playlist// carefull: bug if item selected and deselected
                    var invertedSelection={};
                    var tempIds=[];
                    Object.keys($scope.selectedSongs).forEach(function(thisSong){
                        invertedSelection[$scope.selectedSongs[thisSong]]=thisSong; //turns file->id to id->file
                        tempIds.push($scope.selectedSongs[thisSong]); //list the ids
                    });
                    tempIds.sort().forEach(function(id){
                        playlist.push(invertedSelection[id]); //this is the file 
                    });
                } else {
                    //extract tracklist - should not ne needed actually
                    //todo missing subobject to reach out to tracklist
                    thisAlbumDetails.Tracks.forEach(function(song){
                        playlist.push(song.file);
                    })
                }
                console.log(playlist);
                $http.post('/api/'+callType+'/', playlist).success(function(data, status) {$scope.showDetails=false});                
            }
        };

        //It seems Angular JS calls this only when the details are not known yet.... magic!
        $scope.enrich = function (idOnPage,albumName,albumPath) {
            console.log("enrich ",idOnPage,albumName);
            // console.log("found before any fetch");
            // console.log($scope.AlbumsDetails[idOnPage]);
            var albumToCheck=$scope.albums[idOnPage];
            if (albumToCheck.Album!==undefined && albumToCheck.Artist==albumToCheck.Album){
                console.log ("we need to enrich this artist");
                albumToCheck.Path=albumToCheck.Album;
                albumToCheck.Album="";
                $scope.AlbumsDetails[idOnPage]=albumToCheck;
            } 


            if ($scope.AlbumsDetails[idOnPage]==undefined) {
                console.log("need to fetch fresh data");
                $scope.PageInfo.thinking=true;
                AlbumService.getAlbumDetails(albumName).then(function(detailsData){
                    console.log(detailsData.data);
                    if (detailsData.data.data !== undefined) {
                        $scope.AlbumsDetails[idOnPage]=detailsData.data.data[0]; //manage next entries if any
                        if (detailsData.data.nbEntries > 1) $scope.AlbumsDetails[idOnPage].star=true;
                    }
                    $scope.PageInfo.thinking=false;
                });
            }

        }

    });

    
    
    
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    
    app.controller('PlaylistController', function ($scope, $interval, $timeout, $http, $location, $anchorScroll, AlbumService) {
        $scope.Math = window.Math;
        $scope.hidePlaylist=true;
        $scope.plToggle="";

        $scope.showHidePlaylist = function (){
            if ($scope.hidePlaylist) {
                $scope.plToggle="animated fadeInUp";
                $scope.hidePlaylist = !$scope.hidePlaylist;
                var playingItem=angular.element(document.getElementById("playingItem"))[0].parentElement.parentElement.previousElementSibling.id;
                $timeout(function (){
                    $location.hash(playingItem);
                    $anchorScroll();
                }, 10);


            } else {
                $scope.plToggle="animated fadeOutDown";
                $timeout(function (){
                    $scope.hidePlaylist = !$scope.hidePlaylist;
                }, 1000);
            }
        }

        $scope.playId = function (trackId) {
            $http.post('/api/play/'+trackId,{});
        };
        
        $interval(function () {
            $http.get('/api/playlistStruct').success(function (data) {
                var playlist = data.data;
                var totalPlayTime=0;
                var totalPlayedTime=0;
                var songPlayed=true;
                $http.get('/api/status').success(function (data) {
                    var lastItem={};// for duplicate check
                    var albumPlId=1;
                    var trackPlId=1;
                    var evenOdd=["Even","Odd"];
                    playlist.forEach(function(plItem){                    
                        plItem.Tracks.forEach(function(item){
                            //test if song is playing
                            totalPlayTime+=parseInt(item.Time);
                            item.playingStyle = "notPlayed";

                            if (songPlayed) {
                                totalPlayedTime+=parseInt(item.Time);
                                item.playingStyle = "played";
                            }

                            if(item.Pos == data.song){
                                item.selected=true;
                                item.playingStyle = "playing";
                                songPlayed=false;
                            }else{
                                item.selected=false;
                            }

                            //detect albumchange
                            item.showHeader = false;
                            if (item.Artist == lastItem.Artist && item.Album == lastItem.Album) {
                                item.showHeader = true;
                            }else{
                                albumPlId=(albumPlId+1)%2;
                            }
                            
                            item.playlistClass="track"+evenOdd[trackPlId]+"album"+evenOdd[albumPlId]+" "+item.playingStyle;

                            trackPlId=(trackPlId+1)%2;
                            item.song = data.song;
                            lastItem=item;
                        });
                    });
                    var accTime=0;
                    var accWeight=0;
                    
                    playlist.forEach(function(plItem){                    
                        plItem.Tracks.forEach(function(item){
                            accTime += parseInt(item.Time);
                            item.RelWeight = Math.round(accTime/totalPlayTime*99)-accWeight;
                            accWeight += parseInt(item.RelWeight);                            
                        });
                    });
                    
                    $scope.playlist = playlist;
                    $scope.playListStats = {'totalPlayedTime' : totalPlayedTime,'totalPlayTime':totalPlayTime}
                });
            });
        }, 1000);
    });
})();