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
    LOCALSTORAGE_GPLUSCODE_REFRESHTOKEN : "com.theinit.cmo.titi.localstorage.refreshtoken",
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

};


GlobalConfiguration.isLoggedIn = function() {
    if (GlobalConfiguration.getAccessToken()==undefined) {
        return false;
    } else {
        return true;
    }
};

GlobalConfiguration.getAccessToken = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN]);
    } else {
        return undefined;
    }
};

GlobalConfiguration.setAccessToken = function(gplusdata) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN]=JSON.stringify(gplusdata);
    if (gplusdata.refresh_token!=undefined) { //if a refresh token comes, then we set it outside
        GlobalConfiguration.setRefreshToken(gplusdata.refresh_token);
    }
};

GlobalConfiguration.getRefreshToken = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_REFRESHTOKEN]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_REFRESHTOKEN]);
    } else {
        return undefined;
    }
};

/**
 * The refresh token is the token you should use to get a new access token when it expires
 * (yes, access token DO expire!!!)
 * @param data
 */
GlobalConfiguration.setRefreshToken = function(data) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_REFRESHTOKEN]=JSON.stringify(data);
};

GlobalConfiguration.logout = function() {
    Object.keys(localStorage)
        .forEach(function(key){
            localStorage.removeItem(key);
        });
};

/**
 * Clears Access Token AND Refresh Token
 */
GlobalConfiguration.clearAccessToken = function() {
    localStorage.removeItem(GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_ACCESSTOKEN);
    localStorage.removeItem(GlobalConfiguration.LOCALSTORAGE_GPLUSCODE_REFRESHTOKEN);
};

GlobalConfiguration.showError = function(error) {
    alert('WOW GENERAL ERROR: '+error);
};

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

};

/**
 * Returns the logged in user (who am i) in object (chosen by the user in the select form)
 * @returns object user object, with id and name
 */
GlobalConfiguration.getUser = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_USER]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_USER]);
    } else {
        return undefined;
    }
};

/**
 * Sets user
 * @param user
 */
GlobalConfiguration.setUser = function(user) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_USER]=JSON.stringify(user);
};

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
};

GlobalConfiguration.getProjects = function() {
    if (localStorage[GlobalConfiguration.LOCALSTORAGE_PROJECTS]!=undefined) {
        return JSON.parse(localStorage[GlobalConfiguration.LOCALSTORAGE_PROJECTS]);
    } else {
        return undefined;
    }
};

GlobalConfiguration.addProject = function(project) {
    var tmp=GlobalConfiguration.getProjects();
    if (tmp==undefined) { tmp=[]; }
    if (tmp.indexOf(project)<=-1) {
        tmp.push(project);
    }
    GlobalConfiguration.setProjects(tmp);
};

GlobalConfiguration.removeProject = function(project) {
    var tmp=GlobalConfiguration.getProjects();
    if (tmp==undefined) { tmp=[]; }
    var index=tmp.indexOf(project);
    if (index>-1) {
        tmp.splice(index, 1);
    }
    GlobalConfiguration.setProjects(tmp);
};

GlobalConfiguration.getAjaxHeaders = function() {
    return { 'Authorization' : 'Bearer '+GlobalConfiguration.getAccessToken().access_token };
};


GlobalConfiguration.parseFloat = function(number) {
    number=number.replace(",",".");
    return parseFloat(number);
};

/**
 * Sets projects into localstorage
 * @param projects json array of projects
 */
GlobalConfiguration.setProjects = function(projects) {
    localStorage[GlobalConfiguration.LOCALSTORAGE_PROJECTS]=JSON.stringify(projects);
};

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
};

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
};



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
};

/**
 * Returns if we are in a small screen based on the size of the browser
 * (window.width<=992?)
 * @returns {boolean}
 */
GlobalConfiguration.isSmallScreen = function() {
    return ($(window).width()<=992);
};

/** EXTENDING JQUERY **/

/**
 * Function to get a parameter from the url (location.search)
 * @param name
 * @returns {string}
 */
$.urlParam = function(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
};

/** EXTENDING JQUERY **/
/**
 * Function to get a parameter from the url, when sending the url as "pajar"
 * @param name
 * @param pajar
 * @returns {string}
 */
$.valueFromStringParam = function(name,pajar){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(pajar))
        return decodeURIComponent(name[1]);
};

/** DATE FORMATINNG **/
/**
 * Function to format in DD/MM/YYYY
 * @param d
 * @returns {string}
 */
$.dateFormat = function(d) {
    var m_names = new Array("01", "02", "03",
        "04", "05", "06", "07", "08", "09",
        "10", "11", "12");

    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    return(curr_date + "/" + m_names[curr_month]+ "/" + curr_year);

};


/**
 * The global function when called ondeviceready from phonegap or $().ready in ordinary web
 */
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

    /**
     * Sliding menu in apps; overwrites AdminLTE/app.js:18
     */
    $("[data-toggle='offcanvas']").off("click").on("click",function(e) {
        e.preventDefault();

        //If window is small enough, enable sidebar push menu
        if (GlobalConfiguration.isSmallScreen()) {

            //when menu is shown: .row-offcanvas hasclass active and relative. And removeClass collapse-left and strech
            //whem nenu is hidden: the other way around
            $('.row-offcanvas').removeClass('active'); //left:220px;
            $('.row-offcanvas').removeClass("relative"); //position:relative
            $('.left-side').css("z-index",10);
            $('.left-side').css("top","99px");

            //menu is hidden => show menu
            if ($('.left-side').hasClass("collapse-left")) {

                $('.left-side').animate({left:0}, "fast",function() {
                    $('.left-side').removeClass("collapse-left");
                    $('#menuOverlayScreenDeactivater').show();
                });

            } else {
                //menu is shown => hide menu
                $('.left-side').animate({left:-220}, "fast",function() {
                    $('.left-side').addClass("collapse-left");
                    $('#menuOverlayScreenDeactivater').hide();
                });

            }

        } else {
            //BIG SCREENS : enable content streching normal
            $('.left-side').toggleClass("collapse-left");
            $(".right-side").toggleClass("strech");
            $('.left-side').css("top",""); //default to normal
        }
    });

    //We "overlap" the menu better than being in the left, when in small screens. In big screens, we leave it as it is
    var recalculateMenus=function() {
        if (GlobalConfiguration.isSmallScreen()) {
            //in small screens, we make it overlap => we always take off the menu
            $('.left-side').removeClass('collapse-left').addClass('collapse-left');
            $('.right-side').removeClass('strech').addClass('strech');

            $('.row-offcanvas').removeClass('active');
            $('.row-offcanvas').removeClass("relative");
        } else {
            //in big screens, we leave it is it is by default
            //if menu is not shown

            $('.left-side').css("left","");
            if (parseInt($('.left-side').css("left").replace("px","")) < 0 ) {
                //$('.left-side').css("left","-220px");
                $('.left-side').removeClass('collapse-left').addClass('collapse-left');
                $('.right-side').removeClass('strech').addClass('strech');
            } else {
                //$('.left-side').css("left","0px");
                $('.left-side').removeClass("collapse-left");
                $(".right-side").removeClass("strech");
            }
        }
    };
    recalculateMenus(); //we invoke it the first time app is loaded

    //If resizing, recalculate again
    $(window).on("resize", function() {
        recalculateMenus();
    });

    //When clicking the menu links, the menu has to disappear
    $('ul.sidebar-menu li a').on("click", function(e) {
        //only in small screens and if the menu is shown
        if (GlobalConfiguration.isSmallScreen()) {
            $("[data-toggle='offcanvas']").trigger("click");
        }
    });



};

/********* STARTING POINT ***************/
var currentController;

if (GlobalConfiguration.isPhoneGap()) {
    document.addEventListener("deviceready", GlobalConfiguration.onDeviceReady, false);
} else {
    $(window).load(function() {
        GlobalConfiguration.onDeviceReady();
    });
};

function TitiController() {

};

TitiController.goto = function(ctl, args) {
    var ctls=["HorasCtl","LoginCtl","SettingsCtl", "ResumenCtl"];

    if (!(ctls.indexOf(ctl)>-1)) {
        alert('Controller '+ctl+ ' not in valid controllers!');
        return false;
    }
    currentController = eval("new "+ctl+"()");
    if (args!=undefined) {
        currentController.setArgs(args);
    }
    currentController.execute();
};