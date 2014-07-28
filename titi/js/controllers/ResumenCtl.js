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

    var that=this;
    $('#ResumenMonthSubstract').on("click", function() {
        that.month=that.month-1;
        if (that.month<=-1) { that.year=that.year-1; that.month=11; }
        currentController.paintCalendar();
    });

    $('#ResumenMonthAdd').on("click", function() {
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

    $('#ResumenCalendar tr').show();
    $('#ResumenCalendar td').each(function() {
        contador++;

        var contenido=contador-celdaPrimerDia+1;
        if (contenido<=0) { contenido=''; }
        if (contenido>numDiasMes) { contenido=''; }
        if (contenido=='') { numinarowblank++; } else { numinarowblank=0; }
        $(this).html(contenido);

        if (numinarowblank>=7) { $(this).closest('tr').hide(); numinarowblank=0; }

    })
}

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
