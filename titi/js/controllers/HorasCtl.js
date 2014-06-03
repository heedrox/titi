function HorasCtl() {
    this.titiService = new TitiService();
}

/**
 * A controller should use execute to bind elemnts and preprare the view.
 * In this case: shows the hours controller, makes a datepicker, and reloads the hours
 * and reloads the knob
 */
HorasCtl.prototype.execute = function() {

    $('#logincontainer').hide();
    $('#validatingcontainer').hide();
    $('#hourscontainer').show();

    if (!GlobalConfiguration.isLoggedIn()) {
        TitiController.goto("LoginCtl");
        return;
    }
    if (!GlobalConfiguration.hasProjectsDefined()) {
        $('#settingslink').click();
        return;
    }


    $('#horasFechaSelectorDp').datetimepicker({
        pickTime: false,
         defaultDate: new Date(),
        //defaultDate: '05/29/2014',
        dateFormat: 'DD/MM/YYYY'
    });

    this.loadDay($('#horasFechaSelectorDp').data("DateTimePicker").getDate().toDate());

    $("#horasFechaSelectorDp").unbind("dp.change");
    $("#horasFechaSelectorDp").on("dp.change",function (e) {
        currentController.loadDay($('#horasFechaSelectorDp').data("DateTimePicker").getDate().toDate());
    });

    $('#horasLeftSelector').unbind("click");
    $('#horasRightSelector').unbind("click");
    $('#horasLeftSelector').on("click", function(e) {
        currentController.addDay(-1);
    });
    $('#horasRightSelector').on("click",function(e) {
        currentController.addDay(1);
    });

    $('#horasSaveBtn').unbind("click");
    $('#horasSaveBtn').click(function() {
        currentController.save();
    });
}

/**
 * Reloads the horas table, talking to the database
 * and reloads the knob
 * @param date the date in js date object format
 */
HorasCtl.prototype.loadDay = function(date) {

    this.setHoursLoading();
    this.titiService.getProjects(function(totalProjects) {
        currentController.titiService.getDay(date, GlobalConfiguration.getUser().id, function(horas) {
            //console.log()
            var numhoras=0;
            var clientProjects=[];
            var clientProjectsData=[];
            var clientProjectsHours=[];
            $('#horasListBody').html('');

            //SETUP THE ARRAYS

            horas.forEach(function(it) {
                numhoras+=it.hours;
                var clientProject={ client: it.client, project: it.project };
                if (clientProjectsData[JSON.stringify(clientProject).toLowerCase()]==undefined) {
                    clientProjects.push(clientProject);
                    clientProjectsData[JSON.stringify(clientProject).toLowerCase()]=[];
                    clientProjectsHours[JSON.stringify(clientProject).toLowerCase()]=0;
                }
                clientProjectsData[JSON.stringify(clientProject).toLowerCase()].push(it);
                clientProjectsHours[JSON.stringify(clientProject).toLowerCase()]+=it.hours;
            });

            currentController.refreshKnob(numhoras);

            var favProjects=GlobalConfiguration.getProjects();

            //ADD KNOWN BOXES
            clientProjects.forEach(function(it) {
                var clientProject={ client: it.client, project: it.project };
                console.log(clientProject);
                currentController.addBox(clientProject, clientProjectsData[JSON.stringify(clientProject).toLowerCase()], clientProjectsHours[JSON.stringify(clientProject).toLowerCase()]);
            });

            //ADD FAVORITE PROJECT BOXES
            totalProjects.forEach(function(project) {
                if (favProjects.indexOf(project.id)>-1) {
                    //project is there!
                    //chequeo que no lo he puesto ya
                    var clientProject={ client: project.client, project: project.name };
                    //console.log(clientProjectsData[JSON.stringify(clientProject).toLowerCase()]);
                    if (clientProjectsData[JSON.stringify(clientProject).toLowerCase()]==undefined) {
                        currentController.addBox(clientProject, [], 0);
                    }
                }

            });

        }, function(error) {
            //$('#horasLoadingList').hide();
        });
    });
}

/**
 * Adds a box of client-project into the hoursList
 * @param clientProject the client project object
 * @param projectData list of tasks
 * @param totalHours total hours
 */
HorasCtl.prototype.addBox = function(clientProject, projectData, totalHours) {

    var clientProjectStr=JSON.stringify(clientProject);


    var htmlBox=$('#hoursClientProjectTemplate').html();
    htmlBox=htmlBox.replace('#CLIENTE#',clientProject.client).replace('#PROYECTO#', clientProject.project)
        .replace("#HOURS#",totalHours);
    var $htmlBox=$(htmlBox).attr('id', 'BOX#'+clientProjectStr);
    $htmlBox.data("clientproject", clientProject);
    var numtask=0;

    projectData.forEach(function(task) {
        var $hcptt=$('#hoursClientProjectTaskTemplate',$htmlBox).clone(); //es un rowTask
        $('input[name=task]',$hcptt).val(task.task);
        $('input[name=description]',$hcptt).val(task.description);
        $('input[name=hours]',$hcptt).val(task.hours);
        $('input[name=facturablesn]',$hcptt).prop('checked',(task.facturable=='S'));
        $hcptt.attr('id','TASK#'+task.id); //task has client and project in it, so it is unique
        $hcptt.data("originalTask",task); //cada rowTask le metemos el originalTask
        $('.hoursClientProjectTaskBody',$htmlBox).prepend($hcptt);
        numtask++;
    });

    for (numtask;numtask<4; numtask++) {
        var $hcptt=$('#hoursClientProjectTaskTemplate',$htmlBox).clone();
        $hcptt.removeAttr('id');
        $hcptt.data("originalTask",null);
        $hcptt.insertBefore($('.hoursClientProjectTaskBody .hoursMorebutton',$htmlBox));
    }
    $('#hoursClientProjectTaskTemplate',$htmlBox).remove();


    $('.hoursMorebutton .btn',$htmlBox).click(function() {
        var $row=$('#hoursClientProjectTaskTemplate').clone();
        var $hoursbody=$(this).closest('.hoursClientProjectTaskBody');
        $row.insertBefore($('.hoursMorebutton',$hoursbody));
        $('input[type="checkbox"].checkable', $row).each(function() {
            currentController.makeCoolCheckbox($(this));

        });
        return false;
    });

    $('#horasListBody').append($htmlBox);

    $('input[type="checkbox"].checkable', $htmlBox).each(function() {
        currentController.makeCoolCheckbox($(this));
    });
}

/**
 * Makes the checkboxes of the boxes super cool
 * @param $checkbox
 */
HorasCtl.prototype.makeCoolCheckbox = function($checkbox) {

    $lbltrue=$checkbox.next();
    $lblfalse=$lbltrue.next();

    $lbltrue.unbind("click");
    $lbltrue.on("click", function() {
        $checkbox=$(this).prev();
        $(this).next().show();
        $(this).hide();
        console.log($checkbox.prop('checked'));
        $checkbox.prop('checked',false);
        //$(this).closest('.row').addClass("bg-red");
    });

    $lblfalse.unbind("click");
    $lblfalse.on("click", function() {
        $checkbox=$(this).prev().prev();

        $(this).prev().show();
        $(this).hide();
        //$(this).closest('.row').removeClass("bg-red");
        console.log($checkbox.prop('checked'));
        $checkbox.prop('checked',true);
    });


    $checkbox.hide();
    if ($checkbox.prop('checked')) {
        $lbltrue.show();

        $lblfalse.hide();
        //$checkbox.closest('.row').removeClass("bg-red");
    } else {
        $lbltrue.hide();
        $lblfalse.show();
        //$checkbox.closest('.row').addClass("bg-red");

    }

}
/**
 * Refreshes the knob. Called by loadDay
 *
 * @param numhoras hours to be shown
 */
HorasCtl.prototype.refreshKnob = function(numhoras) {

    $('#horasKnob').val(numhoras);

    //if more than 8, knob shows 0. So we can overwrite it if we set it back again (chapuzation it's said)
    /*
     if (numhoras<6) {
     //change color
     $('#horasKnob').fgColor="#000000";
     } else {
     $('#horasKnob').fgColor="#00a65a";
     }*/


    $('#horasKnob').trigger('change');

    if (numhoras>8) {
        $('#horasKnob').val(numhoras);
    }

}

/**
 * Adds a day to the calendar, and triggers the change
 * @param date the date in js date object format
 */
HorasCtl.prototype.addDay = function(nrDays) {

    var curDay=$('#horasFechaSelectorDp').data("DateTimePicker").getDate().toDate();
    curDay.setDate(curDay.getDate() + nrDays);

    $('#horasFechaSelectorDp').data("DateTimePicker").setDate(curDay);
    $('#horasFechaSelectorDp').trigger('dp.change');

}

/**
 * Prints the progressbar when changing the days
 */
HorasCtl.prototype.setHoursLoading = function() {
    $('#horasListBody').html('<div class="row text-center"><div class="progress sm progress-striped active" ' +
        'style="width:30%; margin-left: auto; margin-right:auto;"><div class="progress-bar progress-bar-success" role="progressbar" ' +
        'aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%"><span class="sr-only">Cargando</span></div></div></div>');
}

/**
 * Saves the information on the screen, calling TitiService
 */
HorasCtl.prototype.save = function() {

    this.getScreenTasks(function (tasks) {
        //console.log(tasks);
        $('#hoursSaveLoading').show();
        $('#hoursDoneKnob').val(0);
        $('#hoursDoneKnob').trigger('change');

        currentController.titiService.saveDay(tasks, function(num, total) {
            //paint progress
            $('#hoursDoneKnob').val(Math.round(num*100/total));
            $('#hoursDoneKnob').trigger('change');
        }, function() {
            //done
            $('#hoursSaveLoading').hide();
        });
    });


}

/**
 * Gets the tasks from the Hours Screen.
 * Calls callback with the tasks
 * @param callback function calling with tasks
 */
HorasCtl.prototype.getScreenTasks=function(callback) {
    //TODO se puede mejorar haciendo que esto solo recupere lo nuevo o lo que ha cambiado
    //se puede ver lo que ha cambiado mirando el rowTask.data("originalTask") y contrastandolo con la info

    var tasks=[];
    var date= $.dateFormat($('#horasFechaSelectorDp').data("DateTimePicker").getDate().toDate());

    $('div[id^=BOX\\#]').each(function($box) { //foreach client-project
        var cp=$(this).data("clientproject");
        $('.hoursClientProjectTaskBody .rowTask',$(this)).each(function() { //foreach task
            var hours=GlobalConfiguration.parseFloat($('input[name=hours]', $(this)).val());
            var task=$('input[name=task]', $(this)).val();
            //TODO watch out, maybe here i want to delete some info and put it to ZERO! PENDING!
            if ((hours>0)&&(task!='')) { //if data is filled
                var originalTask=$(this).data("originalTask");
                tasks.push({
                    id: (originalTask!=null)?originalTask.id:null,
                    date: date,
                    client: cp.client,
                    project: cp.project,
                    task: task,
                    description: $('input[name=description]', $(this)).val(),
                    hours: hours,
                    facturable: $('.checkable', $(this)).prop('checked')?'S':'N',
                    motivo: ''
                });
            }
        });
    });

    callback(tasks);
}


