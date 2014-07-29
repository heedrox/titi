function ResumenCtl() {
    this.titiService = new TitiService();
    this.year=(1900+new Date().getYear());
    this.month=new Date().getMonth(); //starts from zero

    this.monthNames=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
}

/**
 * A controller should use execute to bind elemnts and preprare the view.
 * In this case: paint the calendar depending the day
 */
ResumenCtl.prototype.execute = function() {

    if (!GlobalConfiguration.isLoggedIn()) {
        window.location.reload();
        return;
    }

    var that=this;

    $('#ResumenMonthSubstract').off("click");
    $('#ResumenMonthSubstract').on("click", function(e) {
        that.month=that.month-1;
        if (that.month<=-1) { that.year=that.year-1; that.month=11; }
        currentController.paintCalendar();

    });

    $('#ResumenMonthAdd').off("click");
    $('#ResumenMonthAdd').on("click", function(e) {

        that.month=that.month+1;
        if (that.month>=12) { that.year=that.year+1; that.month=0; }
        currentController.paintCalendar();

    });

    currentController.paintCalendar();
};

/**
 * Paints the calendar
 * Makes the call to recover the hours
 * Paints the 1-31 cells
 */
ResumenCtl.prototype.paintCalendar = function() {
    $('#ResumenMonthName').text(currentController.monthNames[this.month-1+1]+" "+this.year);

    var celdaPrimerDia=this.obtenerCeldaPrimerDia();
    var numDiasMes=this.obtenerNumDiasDelMes();
    var contador=0;
    var numinarowblank=0;

    this.hoursLoadingPbStart();
    this.titiService.getHoursMapForMonth(this.year,this.month+1,GlobalConfiguration.getUser().id, function(mapaHoras) {

        currentController.hoursLoadingPbStop();
        $('#ResumenCalendar tr').show(); //show all rows of the table (up to 6)
        $('#ResumenCalendar td').each(function() {
            contador++;

            var cellclass="";

            var contenido=contador-celdaPrimerDia+1;
            var $tmpcontent="";
            if (contenido<=0) { contenido=''; }
            if (contenido>numDiasMes) { contenido=''; }
            if (contenido=='') { numinarowblank++; } else { numinarowblank=0; }



            //contenido is the number of the month
            if (contenido>0) {
                //if we have a day
                var tmpMonthYear=contenido+"/"+((currentController.month+1)<10?"0"+(currentController.month+1):currentController.month+1)+"/"+currentController.year;
                var tmpNumHoras=mapaHoras[tmpMonthYear];
                if (tmpNumHoras==undefined) {
                    tmpNumHoras=0;
                }

                var labelclass=(tmpNumHoras<6)?"text-danger":"text-success";
                cellclass=(tmpNumHoras<6)?"danger":"success";

                var divHoras="<div class='resumenNumHoras "+labelclass+"'>"+tmpNumHoras+"</div>";

                //if it is a weekend and we dont have hours, dont show the number
                if (tmpNumHoras==0) {
                    var diaSemana=new Date(currentController.year, currentController.month,contenido).getDay();
                    if ((diaSemana==0)||(diaSemana==6)) {
                        divHoras='';
                        cellclass='';
                    }
                }

                $tmpcontent=$("<div class='resumenDiaMes'>"+contenido+"</div>"+divHoras);
            }

            $(this).html($tmpcontent);
            $(this).removeClass("outofmonth danger success").addClass(cellclass);

            if (numinarowblank>=7) { $(this).closest('tr').hide(); numinarowblank=0; }

            $(this).off("click");
            if (contenido>0) {
                $(this).on("click", { day: contenido }, function(evn) {
                    //console.log('clickiting '+evn.data.day);
                    var selectedDate=new Date(currentController.year, currentController.month, evn.data.day );
                    $('a#iniciolink').tab('show'); //el .tab(show) va orientado al link (a)
                    TitiController.goto("HorasCtl", { date : selectedDate });
                });
            }

            //Add hover support for touch devices
            $(this).off("touchstart").off("touchend");

            $(this).on('touchstart', function() {
                $(this).addClass('hover');
            }).on('touchend', function() {
                $(this).removeClass('hover');
            });
        });

    }, function(error) {
        currentController.hoursLoadingPbStop();
    });
};

/**
 * Obtiene el numero de celda (del 1 al 7) en el que debe ir el primer dia
 * en base a las variables this.year and this.month
 * @returns {number}
 */
ResumenCtl.prototype.obtenerCeldaPrimerDia = function() {
    var fecha=new Date(this.year,this.month,1);
    var dsemana=fecha.getDay();
    return (dsemana==0)?7:dsemana;
}

/**
 * Obtiene el numero de dias del mes totales en base a las variables this.year and this.month
 * @returns {number}
 */
ResumenCtl.prototype.obtenerNumDiasDelMes = function() {
    var m=this.month; //month is from 0 to 11
    var y=this.year;
    return /8|3|5|10/.test(m)?30:m==1?(!(y%4)&&y%100)||!(y%400)?29:28:31;
}

ResumenCtl.prototype.hoursLoadingPbStart = function() {
    $('#tasksSelectLoading').show();
}

ResumenCtl.prototype.hoursLoadingPbStop = function() {
    $('#tasksSelectLoading').hide();
}
