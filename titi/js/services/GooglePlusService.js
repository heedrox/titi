function GooglePlusService() {

}

/**
 * Gets the URL to redirect in google plus.
 * If it is a phonegap app, then return the urn:ietf string.
 * If it is a browser app, then return the current url (without #)
 * @returns {string}
 */
GooglePlusService.prototype.getRedirectUri = function() {
    if (GlobalConfiguration.isPhoneGap()) {
      //return 'urn:ietf:wg:oauth:2.0:oob';
        return 'http://localhost/'
    }
    return window.location.href.replace('/#','');
}

GooglePlusService.prototype.startOAuthFlow = function() {

    //http://phonegap-tips.com/articles/google-api-oauth-with-phonegaps-inappbrowser.html
    //if (confirm('COMO FUNCIONA: Ahora se abrirá una pagina para loguearte en google plus. Una vez termines, te dará un código. Copia ese código y pastealo en la ventana que se mostrará a continuación')) {

    if (GlobalConfiguration.isPhoneGap()) {

        var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
            client_id: GlobalConfiguration.getClientID(),
            redirect_uri: this.getRedirectUri(),
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/plus.login https://spreadsheets.google.com/feeds',
            approval_prompt : 'force',
            access_type:'offline'
        });

        var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

        $(authWindow).on('loadstart', function(e) {
            var url = e.originalEvent.url;

            var code = /\?code=(.+)$/.exec(url);
            var error = /\?error=(.+)$/.exec(url);


            if (code) {
                var realcode=$.valueFromStringParam("code",code);
                currentController.recogerDato(realcode);
                authWindow.close();
            }

            if (error) {
                alert("Error autenticando!: "+error);
                authWindow.close();
                window.location.reload();
            }
        });
        //ref.addEventListener('loadstart', function() { alert('start: ' + event.url); });
        //    $('#loginmodal').modal('show');
        //}

    } else {
        //Si es web, se hace un gapi normal, que controla la llamada.
        //Se sabe que ha terminado porque se refresca la pagina con code=? Se procesa en LoginCtl::execute
        gapi.auth.authorize({
            client_id: GlobalConfiguration.getClientID(),
            //redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
            redirect_uri: this.getRedirectUri(),
            response_type: 'code',
            scope: 'https://www.googleapis.com/auth/plus.login https://spreadsheets.google.com/feeds',
            immediate: false,
            approval_prompt : 'force',
            access_type:'offline'
        });
    }




}


// chrome.exe --allow-file-access-from-files
/**
 * Cuando nos devuelven un codigo, hay que exchangearlo por el access token
 * @param code
 * @param callback
 */
GooglePlusService.prototype.getTokenFromCode = function(code, callbackFn) {
    //alert(GlobalConfiguration.getUrlAuthToken());
    $.ajax({
        url: GlobalConfiguration.getUrlAuthToken(),
        crossDomain: true,
        type:'POST',
        data: { 'code': code , 'client_id' : GlobalConfiguration.getClientID(),
            'client_secret' : GlobalConfiguration.getClientSecret(),
            'redirect_uri' : this.getRedirectUri(),
            'grant_type' : 'authorization_code'
        },
        dataType:'json',
        success : function(data) {
            console.log("Got access token from code!");
            console.log(data);
            callbackFn(data);
        },
        error : function(error) {
            //GlobalConfiguration.showError(error);
            alert('buuuu buuu');
            alert(JSON.stringify(error));
            alert('La clave introducida no es válida, prueba otra vez.');
        }
    });

};
/*
GooglePlusService.prototype.getUserFromApi = function(api, callback) {
    var url="https://www.googleapis.com/plus/v1/people/me";
    $.ajax({
        url: url,
        crossDomain: true,

        //NO FUNCIONAN LOS HEADERS IN JSONP!!!! entiendo que google te permite como api key
        //data: { 'access_token': api },
        headers: { 'Authorization' : 'Bearer '+api},
        //dataType : 'jsonp',
        success : function(data) {
            callback(data);
        },
        error : function(error) {
            //GlobalConfiguration.showError(error);
            alert(error);
            alert('La clave introducida no es válida, prueba otra vez.');
        }
    });

}*/

/**
 * This function should be called repeatedly when having a token, so the token is checked.
 * It validates the current token, and if not, then tries to refresh it.
 * If refreshes it, then callbackOk is called
 * If it doesnt refresh it, then callbackError is called
 * @param callbackOk se llama si todo ok, o  si lo renueva ok => With parameters: data and shouldUpdate
 * @param callbackError  si no hay forma de actualizar el token => with parameters: error
 */
GooglePlusService.prototype.verifyToken = function(callbackOk, callbackError) {
    //alert(GlobalConfiguration.getAccessToken());
    //alert(GlobalConfiguration.getAccessToken().access_token);
    var that=this;
    var url2="https://www.googleapis.com/oauth2/v1/tokeninfo";
    $.ajax({
        url: url2,
        crossDomain: true,
        method: 'GET',
        data: {
            access_token : GlobalConfiguration.getAccessToken().access_token
        },
        dataType : 'json',
        success : function(data) {
            if (data.audience!=GlobalConfiguration.getClientID()) {
                callbackError(data);
            } else {
                callbackOk(data, 0);
            }
        },
        error : function(error) {
            //refresh Token
            that.refreshToken(callbackOk, callbackError);
        }
    });


}

GooglePlusService.prototype.refreshToken = function(callbackOk, callbackError) {
/* POST /o/oauth2/token HTTP/1.1
    Host: accounts.google.com
    Content-Type: application/x-www-form-urlencoded

    client_id=8819981768.apps.googleusercontent.com&
        client_secret=your_client_secret&
        refresh_token=1/6BMfW9j53gdGImsiyUH5kU5RsR4zwI9lUVX-tqf8JXQ&
        grant_type=refresh_token*/

    console.log('trying to refresh...');
    $.ajax({
        url: GlobalConfiguration.getUrlAuthToken(),
        crossDomain: true,
        type:'POST',
        data: { 'client_id' : GlobalConfiguration.getClientID(),
            'client_secret' : GlobalConfiguration.getClientSecret(),
            'refresh_token' : GlobalConfiguration.getRefreshToken(),
            'grant_type' : 'refresh_token'
        },
        dataType:'json',
        success : function(data) {
            //we set back the refresh_token so we dont loose it
            data.refresh_token=GlobalConfiguration.getRefreshToken();
            callbackOk(data, 1);
        },
        error : function(error) {
            console.log(error);
            callbackError(error);
        }
    });
}



