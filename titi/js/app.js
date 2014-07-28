var GlobalConfiguration = {

    //VARIABLES - to be configured
    CMOFile : "0Aqtho4hHV1PZdEs1cGRJY3hpa2Q5Uk8xMnEtcVBHSnc",
    CMOFile_TAB_PROYECTOS : "PROYECTOS",
    //CLIENT_ID : '674484425334-2ataiidaqs3mvj2aiarqjbhqe2k1evkq.apps.googleusercontent.com',
    //CLIENT_SECRET: 'gLotxL2xJU-JqkV1m2SAOjzf',
    //BROWSER
    CLIENT_SECRET: '7q_a-OPifwQxb4OMPBpT14Ue',
    CLIENT_ID : '674484425334-uldqmbmjr5p1me20vl6ctlhgqmp555j9.apps.googleusercontent.com',
    //APP
    APP_CLIENT_ID: '674484425334-2ataiidaqs3mvj2aiarqjbhqe2k1evkq.apps.googleusercontent.com',
    APP_CLIENT_SECRET: 'gLotxL2xJU-JqkV1m2SAOjzf',

    //CONSTANTS
    LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN : "com.theinit.cmo.titi.localstorage.accesstoken",
    LOCALSTORAGE_PROJECTS : "com.theinit.cmo.titi.localstorage.projects",
    LOCALSTORAGE_USER: "com.theinit.cmo.titi.localstorage.user",

    //GOOGLE APIS (with a cors proxy!)
    URL_OAUTH_TOKEN : 'proxy/oauth2-token.php',
    TIME_OAUTH_REVERIFY : 100000,  //time in msecs which we check recurrently

    getUrlAuthToken : function() {
        //if we are in an app, we go to the dev.theinit.com server
        if (GlobalConfiguration.isPhoneGap()) {
            return "http://dev.theinit.com:8000/titi/"+GlobalConfiguration.URL_OAUTH_TOKEN;
            //dev.theinit.com:8000 //192.168.0.194:8080
        } else {
            return GlobalConfiguration.URL_OAUTH_TOKEN
        }
    },


    getEditRowUrl : function() {
        if (GlobalConfiguration.isPhoneGap()) {
            return "http://dev.theinit.com:8000/titi/proxy/edit-row.php";
            //dev.theinit.com:8000 //192.168.0.194:8080
        } else {
            return 'proxy/edit-row.php';
        }

    },
    getAddRowUrl : function() {
        if (GlobalConfiguration.isPhoneGap()) {
            return "http://dev.theinit.com:8000/titi/proxy/add-row.php";
            //dev.theinit.com:8000 //192.168.0.194:8080
        } else {
            return 'proxy/add-row.php';
        }
    },
    getDeleteRowUrl : function() {
        if (GlobalConfiguration.isPhoneGap()) {
            return "http://dev.theinit.com:8000/titi/proxy/delete-row.php";
            //dev.theinit.com:8000 //192.168.0.194:8080
        } else {
            return 'proxy/delete-row.php';
        }
    },

    DUMMY : 1

}


GlobalConfiguration.isLoggedIn = function() {
    if (GlobalConfiguration.getAccessToken()==undefined) {
        return false;
    } else {
        return true;
    }
}

GlobalConfiguration.getAccessToken = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN]);
    } else {
        return undefined;
    }
}

GlobalConfiguration.setAccessToken = function(gplusdata) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN]=JSON.stringify(gplusdata);
}

GlobalConfiguration.logout = function() {
    Object.keys(localStorage)
        .forEach(function(key){
            localStorage.removeItem(key);
        });
}

GlobalConfiguration.clearAccessToken = function() {
    localStorage.removeItem(GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN);
}

GlobalConfiguration.showError = function(error) {
    alert('WOW GENERAL ERROR: '+error);
}

GlobalConfiguration.createRecurrentLoginCheck = function() {
    var gps=new GooglePlusService();
    gps.verifyToken(function (data, shouldUpdate) {
        if (shouldUpdate) {
            GlobalConfiguration.setAccessToken(data);
        }
        setTimeout(function() {
            GlobalConfiguration.createRecurrentLoginCheck();
        },GlobalConfiguration.TIME_OAUTH_REVERIFY);

    }, function(error) {
        alert('Error con el usuario. Deslogeate y vuelve a logearte. Lo sentimos!');
        alert(JSON.stringify(error));
    });

}

/**
 * Returns the logged in user (who am i) in object (chosen by the user in the select form)
 * @returns user object, with id and name
 */
GlobalConfiguration.getUser = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_USER]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_USER]);
    } else {
        return undefined;
    }
}

GlobalConfiguration.setUser = function(user) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_USER]=JSON.stringify(user);
}
/************************ PROJECTS *****************************/
GlobalConfiguration.hasProjectsDefined = function() {
    var projects = GlobalConfiguration.getProjects();
    if (GlobalConfiguration.getProjects()==undefined) {
        return false;
    }
    if (!(projects instanceof Array)) {
        return false;
    }
    if (projects.length == 0) {
        return false;
    }
    return true;
}

GlobalConfiguration.getProjects = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_PROJECTS]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_PROJECTS]);
    } else {
        return undefined;
    }
}

GlobalConfiguration.addProject = function(project) {
    var tmp=GlobalConfiguration.getProjects();
    if (tmp==undefined) { tmp=[]; }
    if (tmp.indexOf(project)<=-1) {
        tmp.push(project);
    }
    GlobalConfiguration.setProjects(tmp);
}

GlobalConfiguration.removeProject = function(project) {
    var tmp=GlobalConfiguration.getProjects();
    if (tmp==undefined) { tmp=[]; }
    var index=tmp.indexOf(project);
    if (index>-1) {
        tmp.splice(index, 1);
    }
    GlobalConfiguration.setProjects(tmp);
}

GlobalConfiguration.getAjaxHeaders = function() {
    return { 'Authorization' : 'Bearer '+GlobalConfiguration.getAccessToken().access_token };
}


GlobalConfiguration.parseFloat = function(number) {
    number=number.replace(",",".");
    return parseFloat(number);
}

/**
 * Sets projects into localstorage
 * @param projects json array of projects
 */
GlobalConfiguration.setProjects = function(projects) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_PROJECTS]=JSON.stringify(projects);
}

/**
 * Gets CLIENT_ID from configuration.
 * Depending on the isPhonegap function, returns CLIENT_ID or APP_CLIENT_ID.
 *
 */
GlobalConfiguration.getClientID = function() {
    //console.log("is phonegap? "+GlobalConfiguration.isPhoneGap());
    //alert(GlobalConfiguration.isPhoneGap());
    //if (GlobalConfiguration.isPhoneGap()) {
    //    return GlobalConfiguration.APP_CLIENT_ID;
    //} else {
    return GlobalConfiguration.CLIENT_ID;
    //}
}

/**
 * Gets CLIENT_SECRET from configuration.
 * Depending on the isPhonegap function, returns CLIENT_ID or APP_CLIENT_ID.
 *
 */
GlobalConfiguration.getClientSecret = function() {
    //console.log("is phonegap? "+GlobalConfiguration.isPhoneGap());
    //if (GlobalConfiguration.isPhoneGap()) {
//        return GlobalConfiguration.APP_CLIENT_SECRET;
//    } else {
    return GlobalConfiguration.CLIENT_SECRET;
//    }
}



/** IS CORDOVA ******/
/**
 * Funcion que te dice si esta ejecutando como app dentro de phonegap. Debería cumplir lo siguiente:
 * - Si la app se ejecuta desde desktop dentro de un navegador => devuelve false
 * - Si la app se ejecuta desde movil dentro del navegador => devuelve false
 * - Si la app se ejecuta desde movil como APP => devuelve true
 * @returns boolean
 */
GlobalConfiguration.isPhoneGap = function() {
    //alert(typeof cordova);
    if ( (typeof cordova !== "undefined") || (typeof PhoneGap !== "undefined") || (typeof phonegap !== "undefined")
        && /^file:\/{3}[^\/]/i.test(window.location.href)
        && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}

/** EXTENDING JQUERY **/
$.urlParam = function(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

/** EXTENDING JQUERY **/
$.valueFromStringParam = function(name,pajar){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(pajar))
        return decodeURIComponent(name[1]);
}

/** DATE FORMATINNG **/
$.dateFormat = function(d) {
    var m_names = new Array("01", "02", "03",
        "04", "05", "06", "07", "08", "09",
        "10", "11", "12");

    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    return(curr_date + "/" + m_names[curr_month]+ "/" + curr_year);

}



GlobalConfiguration.onDeviceReady = function() {

    $('#logout').click(function() {
        if (confirm('Confirma que deseas borrar todos los datos asociados a este ordenador')) {
            GlobalConfiguration.logout();
            window.location.reload();
        }
        return false;
    });

    $('#settingslink').click(function() {
        TitiController.goto("SettingsCtl");
    });

    $('#iniciolink').click(function() {
        TitiController.goto("HorasCtl");
    });

    $('#resumenlink').click(function() {
        TitiController.goto("ResumenCtl");
    });

    $('#cmoLink').attr("href",'https://docs.google.com/spreadsheet/ccc?key='+GlobalConfiguration.CMOFile);


    //loginctl is our starting point
    TitiController.goto('LoginCtl');

    /* jQueryKnob */

    if ($(".knob")!=undefined) {
        if ($(".knob").knob != undefined) { //checks to avoid errors in karma js
            $(".knob").knob({
            });
        }
    }
    setTimeout(function() {
        $('#initialLoading').hide();
    },1000);

    /* END JQUERY KNOB */
}

/********* STARTING POINT ***************/
var currentController;

if (GlobalConfiguration.isPhoneGap()) {
    document.addEventListener("deviceready", GlobalConfiguration.onDeviceReady, false);
} else {
    $(window).load(function() {
        GlobalConfiguration.onDeviceReady();
    });
}

function TitiController() {

}

TitiController.goto = function(ctl) {
    var ctls=["HorasCtl","LoginCtl","SettingsCtl", "ResumenCtl"];

    if (!(ctls.indexOf(ctl)>-1)) {
        alert('Controller '+ctl+ ' not in valid controllers!');
        return false;
    }
    currentController = eval("new "+ctl+"()");
    currentController.execute();
}