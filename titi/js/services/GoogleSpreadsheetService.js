function GoogleSpreadsheetService(spreadsheetFileKey) {
    this.spreadsheetFileKey=spreadsheetFileKey;
    this.postLink={};
}

/**
 * Gets all the worksheets of a given object
 * @param callback
 */
GoogleSpreadsheetService.prototype.getWorksheets = function(callback, callbackError) {
    var url='https://spreadsheets.google.com/feeds/worksheets/'+this.spreadsheetFileKey+'/private/full';
    //console.log(url);


    $.ajax({
        url:url,
        type:'GET',
        data: { 'alt': 'json-in-script', 'access_token' : GlobalConfiguration.getAccessToken().access_token },
        dataType: 'jsonp',
        success: function(data) {
            callback(data.feed.entry);
        },
        error: function(errordata) {
            callbackError(errordata);
        }
    });

}

/**
 * Returns back a list of projects; each element is: it.id.$t;
 * @param callback
 * @param callbackError
 */
GoogleSpreadsheetService.prototype.getProjects = function(callback, callbackError) {

    var that=this;
    this.getWorksheets(function(entries) {
        var proyKey='';
        entries.forEach(function(it) {
            if (it.title.$t==GlobalConfiguration.CMOFile_TAB_PROYECTOS) {
                //console.log(it.id.$t);
                proyKey=it.id.$t.substr(it.id.$t.lastIndexOf('/')+1);
            }
        });

        var url='https://spreadsheets.google.com/feeds/list/#KEY#/#WORKSHEETID#/private/full'.replace('#KEY#',that.spreadsheetFileKey);
        url=url.replace('#WORKSHEETID#',proyKey);
        //console.log(url);


        $.ajax({
            url:url,
            type:'GET',
            data: { 'alt': 'json-in-script', 'access_token' : GlobalConfiguration.getAccessToken().access_token },
            dataType: 'jsonp',
            success: function(data) {
                //console.log(data.feed.entry);
                callback(data.feed.entry);
            },
            error: function(errordata) {
                callbackError(errordata);
            }
        });
    }, function(error) {
        callbackError(error);
    });

}

GoogleSpreadsheetService.prototype.sortProjects = function(projects) {
    projects.sort(function(a,b) {
        return a.gsx$proyecto.$t.trim().toLowerCase().localeCompare(b.gsx$proyecto.$t.trim().toLowerCase());
    });

}


/**
 * Gets a lists of the hours of one day and user
 * @param filter a filter to send the query to GSS (not encoded, here we'll do it)
 * @param idUser iduser
 * @param callback function to be called with hours array, object:
 */
GoogleSpreadsheetService.prototype.getHours = function (filter, idUser, callback, callbackError) {

    var url='https://spreadsheets.google.com/feeds/list/#KEY#/#WORKSHEETID#/private/full'.replace('#KEY#',this.spreadsheetFileKey);
    
    url=url.replace('#WORKSHEETID#',idUser);
    //console.log(url);
    if (filter!='') {
        //console.log(filter);
        url=url+'?sq='+encodeURIComponent(filter);
    }
    //url=url+"?sq="

    var that=this;
    $.ajax({
        url:url,
        type:'GET',
        data: { 'alt': 'json-in-script', 'access_token' : GlobalConfiguration.getAccessToken().access_token },
        dataType: 'jsonp',
        success: function(data) {
            //console.log(data.feed.entry);
            //console.log(data.feed.link);
            data.feed.link.forEach(function(l) {
                if (l.rel=="http://schemas.google.com/g/2005#post") {
                    that.postLink= l;
                }
            });
            if (data.feed.entry==undefined) { callback([]); return; }

            callback(data.feed.entry);
        },
        error: function(errordata) {
            callbackError(errordata);
        }
    });
}


GoogleSpreadsheetService.prototype.addTask = function(worksheetId, task, callback, callbackError) {
    //setTimeout(function() { callback(); }, 1000);
    $.ajax({
        url:'proxy/add-row.php',
        type:'POST',
        data: { 'access_token' : GlobalConfiguration.getAccessToken().access_token,
                'tasks': JSON.stringify(task),
                'postLink' : this.postLink.href,
                'content-type' : this.postLink.type,
                'worksheetId' : worksheetId },
        success: function(data) {
            //console.log(data.feed.entry);
            callback();
        },
        error: function(errordata) {
            alert('Error saving task!');
            callbackError();
        }
    });
}

GoogleSpreadsheetService.prototype.updateTask = function(worksheetId,task, callback, callbackError) {
    $.ajax({
        url:'proxy/edit-row.php',
        type:'POST',
        data: { 'access_token' : GlobalConfiguration.getAccessToken().access_token,
            'task': JSON.stringify(task),
            'postLink' : this.postLink.href,
            'content-type' : this.postLink.type,
            'worksheetId' : worksheetId,
            'keyFile' : GlobalConfiguration.CMOFile  },
        success: function(data) {
            //console.log(data.feed.entry);
            //console.log('yea -> callback');
            callback();
        },
        error: function(errordata) {
            alert('Error saving task!');
            callbackError(errordata);
        }
    });
}

/**
 * Deletes a row from the CMO file
 * @param worksheetId
 * @param task
 * @param callback
 * @param callbackError
 */
GoogleSpreadsheetService.prototype.deleteTask = function(worksheetId,task, callback, callbackError) {
    $.ajax({
        url:'proxy/delete-row.php',
        type:'POST',
        data: { 'access_token' : GlobalConfiguration.getAccessToken().access_token,
            'task': JSON.stringify(task),
            'postLink' : this.postLink.href,
            'content-type' : this.postLink.type,
            'worksheetId' : worksheetId,
            'keyFile' : GlobalConfiguration.CMOFile  },
        success: function(data) {
            //console.log(data.feed.entry);
            //console.log('yea -> callback');
            callback();
        },
        error: function(errordata) {
            alert('Error saving task!');
            callbackError(errordata);
        }
    });
}
