function TitiService() {
    this.googleSpreadsheetService=new GoogleSpreadsheetService(GlobalConfiguration.CMOFile);
    this.cachedTasks=[];
}

/**
 * Gets a lists of projects with id, name and client
 * @param callback the function to be called when we have all projects
 */
TitiService.prototype.getUsers = function (callback) {


    this.googleSpreadsheetService.getWorksheets(function(worksheets) {

        var allUsers=[];
        worksheets.forEach(function(it) {
            if (it.title.$t!='PROYECTOS') {
                var userk=it.id.$t.substr(it.id.$t.lastIndexOf('/')+1);
                console.log(it);
                allUsers.push( { id: userk, name: it.title.$t } );
            };
        });

        callback(allUsers);
    });

}
/**
 * Gets a lists of projects with id, name and client
 * @param callback the function to be called when we have all projects
 */
TitiService.prototype.getProjects = function (callback) {

    var that=this;
    this.googleSpreadsheetService.getProjects(function(projects) {
        var txt='';

        that.googleSpreadsheetService.sortProjects(projects);

        var allProjects=[];

        projects.forEach(function(it) {
            allProjects.push({id: it.gsx$numproyecto.$t, name: it.gsx$proyecto.$t , client: it.gsx$cliente.$t});
        }) ;


        callback(allProjects);
    }, function(error) {
        console.log('ERROR !');
    });

}

/**
 * Gets a lists of the hours of one day and user
 * Also fills the Loaded Hours of this object, so we
 * can cache the results, for saving later
 * @param day day in js object
 * @param idUser iduser
 * @param callback function to be called with hours array, object:
 */
TitiService.prototype.getDay = function (day, idUser, callback) {

    var that=this;
    filter="fecha="+ $.dateFormat(day)+"";

    this.googleSpreadsheetService.getHours(filter, idUser, function(hours) {

        that.cachedTasks=hours;

        var allHours=[];

        hours.forEach(function(it) {
            //console.log(it);
            allHours.push({
                id: it.id.$t,
                date: day,
                client: it.gsx$cliente.$t,
                project: it.gsx$proyecto.$t,
                task: it.gsx$tarea.$t,
                description: it.gsx$descripción.$t,
                hours: GlobalConfiguration.parseFloat(it.gsx$horas.$t),
                facturable: it.gsx$facturablesn.$t,
                motivo: it.gsx$motivo.$t
            });
        }) ;



        callback(allHours);
    }, function(error) {
        alert('Error recovering hours... ');
        alert(JSON.stringify(error));
    });

}


/**
 * Saves the day when sent tasks.
 * It gives feedback through callbackProgress (num, total)
 * When finishes, launches callbackProgress
 * @param tasks
 * @param callbackProgress
 * @param callbackReady
 */
TitiService.prototype.saveDay = function (tasks, callbackProgress, callbackReady, callbackError) {
//we should have this.cachedTasks to check old ids
    var numTasks=tasks.length;
    var numTasksDone=0;

    var that=this;


    var errorfn=function() {
        //Stop saving, there was an error!
        callbackError();
    }

    var done=function() {
        numTasksDone++;
        //console.log('Done: '+numTasksDone);
        //console.log('NumTasks total: '+numTasks);
        if (numTasksDone>=numTasks) {
            callbackReady();
        } else {
            callbackProgress(numTasksDone,numTasks);
            that.saveTask(tasks[numTasksDone],done, errorfn);
        }
    };


    if (tasks.length>0) {
        that.saveTask(tasks[0], done, errorfn);
    } else {
        done();
    }

};

TitiService.prototype.saveTask = function(task, done, errorfn) {
    if (task.id!=null) {
        //update
        if ((task.task=='')&&(task.description=='')&&(task.hours==0)) {
            this.googleSpreadsheetService.deleteTask(GlobalConfiguration.CMOFile, task, done, errorfn);
        } else {
            this.googleSpreadsheetService.updateTask(GlobalConfiguration.CMOFile, task, done, errorfn);
        }
    } else {
        //insert
        this.googleSpreadsheetService.addTask(GlobalConfiguration.CMOFile, task, done, errorfn);

    }

}



