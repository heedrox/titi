function GooglePlusService() {

}

GooglePlusService.prototype.getRedirectUri = function() {
    return window.location.href.replace('/#','');
}

GooglePlusService.prototype.startOAuthFlow = function() {

    //if (confirm('COMO FUNCIONA: Ahora se abrirá una pagina para loguearte en google plus. Una vez termines, te dará un código. Copia ese código y pastealo en la ventana que se mostrará a continuación')) {
    gapi.auth.authorize({
        client_id: GlobalConfiguration.CLIENT_ID,
        //redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
        redirect_uri: this.getRedirectUri(),
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/plus.login https://spreadsheets.google.com/feeds',
        immediate: false
    });

    //    $('#loginmodal').modal('show');
    //}
}


// chrome.exe --allow-file-access-from-files
/**
 * Cuando nos devuelven un codigo, hay que exchangearlo por el access token
 * @param code
 * @param callback
 */
GooglePlusService.prototype.getTokenFromCode = function(code, callbackFn) {
    $.ajax({
        url: GlobalConfiguration.URL_OAUTH_TOKEN,
        crossDomain: true,
        type:'POST',
        data: { 'code': code , 'client_id' : GlobalConfiguration.CLIENT_ID,
            'client_secret' : GlobalConfiguration.CLIENT_SECRET,
            'redirect_uri' : this.getRedirectUri(),
            'grant_type' : 'authorization_code'
        },
        dataType:'json',
        success : function(data) {
            callbackFn(data);
        },
        error : function(error) {
            //GlobalConfiguration.showError(error);
            alert('La clave introducida no es válida, prueba otra vez.');
        }
    });

};

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
            alert('La clave introducida no es válida, prueba otra vez.');
        }
    });

}

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
            if (data.audience!=GlobalConfiguration.CLIENT_ID) {
                callbackError(error);
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
        url: GlobalConfiguration.URL_OAUTH_TOKEN,
        crossDomain: true,
        type:'POST',
        data: { 'client_id' : GlobalConfiguration.CLIENT_ID,
            'client_secret' : GlobalConfiguration.CLIENT_SECRET,
            'refresh_token' : GlobalConfiguration.getAccessToken().refresh_token,
            'grant_type' : 'refresh_token'
        },
        dataType:'json',
        success : function(data) {
            //we set back the refresh_token so we dont loose it
            data.refresh_token=GlobalConfiguration.getAccessToken().refresh_token;
            callbackOk(data, 1)
        },
        error : function(error) {
            console.log(error);
            callbackError(error);
        }
    });
}

