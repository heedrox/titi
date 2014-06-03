function SettingsCtl() {
    this.titiService=new TitiService();


}

/**
 * A controller should use execute to bind elemnts and preprare the view
 */
SettingsCtl.prototype.execute = function() {

    if (!GlobalConfiguration.isLoggedIn()) {

        window.location.reload();

    }

    $('#settingsUsersList').unbind('change');
    $('#settingsUsersList').bind('change', function() {

        GlobalConfiguration.setUser({ id: $('#settingsUsersList').val(), name: $("#settingsUsersList option:selected").text() } );
    });

    //Get users from titiService
    this.titiService.getUsers(function (users) {

        $('#settingsUsersList').html('');
        var txt='';
        var myUser=GlobalConfiguration.getUser();
        if (myUser==undefined) { myUser={id:0,name:''}; }
        users.forEach(function(it) {
            txt+='<option value="'+(it.id)+'" '+((it.id==myUser.id)?'selected':'')+'>'+it.name+'</option>';
        });
        $("#settingsUsersList").append(txt);
    });

    //Get projects from titiService
    var that=this;
    this.titiService.getProjects(function(projects) {

        var txt='';

        var chosenProjects=GlobalConfiguration.getProjects();
        if (chosenProjects==undefined) { chosenProjects=[]; }

        projects.forEach(function(it) {
            //console.log(it);
            txt+='<div class="col-md-4" style="cursor:pointer" id="proyect'+it.id+'"><i id="starproyect'+it.id+'" class="fa '+((chosenProjects.indexOf(it.id)>-1)?'fa-star':'fa-star-o')+'"></i> '+it.name+' ('+it.id+')</div>';
        }) ;

        $('#settingsProjectsList').html(txt);

        projects.forEach(function(it) {
            var tmpid=it.id;
            $('#proyect'+tmpid).click(function() {
                var $starproyect=$("#starproyect"+tmpid);
                if ($starproyect.hasClass('fa-star-o')) {
                    GlobalConfiguration.addProject(tmpid);
                    $starproyect.removeClass('fa-star-o').addClass('fa-star');
                } else {
                    GlobalConfiguration.removeProject(tmpid);
                    $starproyect.removeClass('fa-star').addClass('fa-star-o');

                }
            });
        });


    });

}


