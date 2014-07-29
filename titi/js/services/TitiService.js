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
        console.log('saving task... left ones are: ');
        console.log(JSON.stringify(tasks));
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


/**
 * Gets a lists of the distinct tasks for one project
 * @param client a string with the client name
 * @param project a string with the project name
 * @param idUser iduser
 * @param callback function to be called with tasks array
 */
TitiService.prototype.getTasksForProject = function (client, project, idUser, callback, callbackError) {

    filter="cliente=\""+client+"\" and proyecto=\""+project+"\"";

    this.googleSpreadsheetService.getHours(filter, idUser, function(hours) {
        var allTasks=[];
        hours.forEach(function(it) {
            //console.log(it);
            //distinct tasks: just put the ones that are not already in
            var tmptarea=it.gsx$tarea.$t.trim();
            if (tmptarea!="") {
                if (allTasks.indexOf(tmptarea)<0) {
                    allTasks.push(tmptarea);
                }
            }
        });
        callback(allTasks);
    }, function(error) {
        alert('Error recovering tasks... ');
        alert(JSON.stringify(error));
        callbackError(error);
    });

}


/**
 * Gets a Map of 1..31 for number of hours for each day
 * @param year a year like 2014
 * @param month a month from 1 to 12
 * @param idUser iduser
 * @param callback function to be called with the array. It calls with an array of date : numberofhours
 */
TitiService.prototype.getHoursMapForMonth = function (year, month, idUser, callback, callbackError) {

    var numDays=/9|4|6|11/.test(month)?30:month==2?(!(year%4)&&year%100)||!(year%400)?29:28:31;


    var startDate="1/"+((month<10)?("0"+month):month)+"/"+year;
    var endDate=((numDays<10)?("0"+numDays):numDays)+"/"+((month<10)?("0"+month):month)+"/"+year;
/*    var startDate=((month<10)?("0"+month):month)+"/01/"+year;
 var endDate=((month<10)?("0"+month):month)+"/"+((numDays<10)?("0"+numDays):numDays)+"/"+year;
*/
 var filter="fecha>="+startDate+" and fecha<="+endDate+"";

    console.log(filter);
    this.googleSpreadsheetService.getHours(filter, idUser, function(hours) {
        var resmap=[];
        console.log(hours.length);
        hours.forEach(function(it) {
            //console.log(it);
            //distinct tasks: just put the ones that are not already in
            var tmphour=GlobalConfiguration.parseFloat(it.gsx$horas.$t);

            var fecha=it.gsx$fecha.$t;
            //console.log(fecha);
            if (resmap[fecha]==undefined) {
                resmap[fecha]=tmphour;
            } else {
                resmap[fecha]=resmap[fecha]+tmphour;
            }


        });
        console.log(resmap);
        callback(resmap);
    }, function(error) {
        alert('Error recovering hours map... ');
        alert(JSON.stringify(error));
        callbackError(error);
    });

}




