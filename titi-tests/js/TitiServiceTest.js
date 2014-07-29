describe("TitiService is the service for connection TITI stuff", function() {

    beforeEach(function(done) {
    this.titiService=new TitiService();
    });

    it("should be able to check correctly if the Proxy for connections in CLOUD is ok", function(done) {

        this.titiService.checkInternetRequirements
        this.googleSpreadsheetService.getWorksheets(function(entries) {
            //console.log(entries);
            expect(entries.length).toBeGreaterThan(1,"there should be lots of worksheets");


            var proy='';
            entries.forEach(function(it) { if (it.title.$t == 'PROYECTOS') { proy=it.title.$t}; });

            expect(proy).toBe('PROYECTOS',"there should be a worksheet called PROYECTOS");

            done();
        }, function(error) {
            expect(1).toBe(0,"ERRROR ! getting worksheets!: "+JSON.stringify(error));
            done();
        });
    });



    it("should be able to list google spreadsheet projects, and there should be sigue and eroski.es projects, for example", function(done) {

        this.googleSpreadsheetService.getProjects(function(projects) {
            console.log(projects);
            expect(projects.length).toBeGreaterThan(30, "there should be more than 30 projects");
            var existeSIGUE=false;
            var existeEroski=false;
            var existeUnoQueMeInvento=false;
            projects.forEach(function(it) {
                if (it.gsx$proyecto.$t=='SIGUE') { existeSIGUE=true; }
                if (it.gsx$proyecto.$t=='Eroski.es') { existeEroski=true;; }
                if (it.gsx$proyecto.$t=='UnoquemeinventoYOLE.com') { existeUnoQueMeInvento=true;; }
               //console.log(it.gsx$proyecto.$t);
            });

            expect(existeSIGUE).toBeTruthy();
            expect(existeEroski).toBeTruthy();
            expect(existeUnoQueMeInvento).toBeFalsy();
            done();
        }, function(error) {

            done();
        });
    });
});