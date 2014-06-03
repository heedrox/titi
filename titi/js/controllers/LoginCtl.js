function LoginCtl() {
    this.googlePlusService = new GooglePlusService();
}

LoginCtl.prototype.execute = function() {
    //if im coming from oauthflow in the popup window
    if (window.location.href.indexOf('code=')>0) {
        window.opener.currentController.recogerDato($.urlParam("code"));
        window.close();
        return;
    } else if (window.location.href.indexOf('?error=access_')>0) {
        alert('No se ha podido confirmar el proceso. Reintentalo');
        window.opener.location.reload();
        window.close();
        return;
    }

    //prepare page to login
    $('#logincontainer').show();
    $('#validatingcontainer').hide();
    $('#hourscontainer').hide();



    //check if i'm logged in and start flow
    if (GlobalConfiguration.isLoggedIn()) {
        this.verifyLoggedProcess();
    }




    $('#gplusform').unbind('submit');

    var that=this;
    $('#gplusform').bind("submit",function() {
        that.recogerDato();
        return false;
    });

    //LOGIN BUTTON
    var $loginButton = $('#login a');

    var that=this;
    $loginButton.on('click', function() {

        $('#logincontainer').hide();
        $('#validatingcontainer').show();
        $('#hourscontainer').hide();

        that.googlePlusService.startOAuthFlow();

        return false;

    });
}


/**
 * Once I'm logged in, then I check if i have a good token.
 * if not, start again.
 * if ok, then we are able to proceed
 */
LoginCtl.prototype.verifyLoggedProcess = function() {
    //I have an access_token, validate it
    $('#logincontainer').hide();
    $('#validatingcontainer').show();
    $('#hourscontainer').hide();
    this.googlePlusService.verifyToken(function(data, shouldUpdate) {
        $('#validatingcontainer').hide();
        $('#hourscontainer').show();
        TitiController.goto("HorasCtl");
        if (shouldUpdate) {
            GlobalConfiguration.setAccessToken(data);
        }
        GlobalConfiguration.createRecurrentLoginCheck();
    }, function(error) {
        GlobalConfiguration.clearAccessToken();
        window.location.reload();

    });
}

LoginCtl.prototype.recogerDato = function(valor) {
    /*if (valor==undefined || valor=='') {
     valor=$('#codeid').val();
     }*/
    //alert('yeah: '+valor);
    if (valor!='') {
        //$('#loginmodal').modal('hide');

        var that=this;
        this.googlePlusService.getTokenFromCode(valor,function(data) {
            GlobalConfiguration.setAccessToken(data);
            that.verifyLoggedProcess();
        });

    }
}
/*
 var googleapi = {
 authorize: function(options) {
 var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
 client_id: options.client_id,
 redirect_uri: options.redirect_uri,
 response_type: 'code',
 scope: options.scope
 });

 }
 };
 */


