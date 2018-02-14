module.exports = function () {
    return function(req,res,next){
        var detailsData=res.JSON; // entry that we are goind to modify
        var albData=[];
        var currentalb={};
        //try to make a structured object out of the track list
        //we detect albums by Path
        var lastAlbumPath="";
        var EntryId=0;
        detailsData.forEach(function(entry){
            if (entry.file !== undefined) {
                var albumPathArray=entry.file.split("/")
                albumPathArray.pop()
                var albumPath=albumPathArray.join("/");
                if (lastAlbumPath !== albumPath) { //new album by Path
                    //if last album not empty, add it
                    if (lastAlbumPath!=="") { //it was not the first
                        albData.push(currentalb);
                        currentalb={};
                    }
                    EntryId+=1;
                    var newHeader={};
                     //todo: iterate on entry components
                    newHeader.EntryId=EntryId;
                    newHeader.Album=entry.Album; //first track data serves as header (so some fields are duplicated)
                    newHeader.Artist=entry.Artist; //first track data serves as header (so some fields are duplicated)
                    newHeader.Date=entry.Date; //first track data serves as header (so some fields are duplicated)
                    newHeader.imgSource=entry.imgSource; //first track data serves as header (so some fields are duplicated)
                    newHeader.Path=albumPath;
                    newHeader.TotalTracks=0;
                    newHeader.Time=0;
                    newHeader.Tracks=[];
                    //albData[EntryId]=newHeader
                    currentalb=newHeader;
                    lastAlbumPath = albumPath;
                }
                currentalb.TotalTracks+=1;
                currentalb.Time +=parseInt(entry.Time);
                currentalb.timeDisplay=String(Math.floor(currentalb.Time/60))+":"+String("0" + Math.floor(currentalb.Time%60)).slice(-2)

                // albData[EntryId].TotalTracks+=1;
                // albData[EntryId].Time +=parseInt(entry.Time);
                // albData[EntryId].timeDisplay=String(Math.floor(albData[EntryId].Time/60))+":"+String("0" + Math.floor(albData[EntryId].Time%60)).slice(-2)

                var newTrack=entry; //must do a copy to avoid circular error reference
                //could take time to remove some fat here someday
                //however the following does not really work, as it removes the fields also from the original object
                //corny, isn't it ?
                // delete newTrack.imgSource; //don't do that
                // delete newTrack.Genre; //don't do that
                // delete newTrack.Date; //don't do that
                currentalb.Tracks.push(newTrack);
                //albData[EntryId].Tracks.push(newTrack);
            
                //albData.nbEntries=EntryId;
            } else {
                console.log ("error");
                console.log (entry);
            }
        });
        albData.push(currentalb);//last entry
        res.JSON = {nbEntries: albData.length, data: albData};
        return next();
    }
};