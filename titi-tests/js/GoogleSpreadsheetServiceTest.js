describe("GoogleSpreadheetService should handle all the functions about connecting to Google SpreadsheetsApi", function() {

    beforeEach(function(done) {
        this.gps=new GooglePlusService();
        this.googleSpreadsheetService=new GoogleSpreadsheetService(GlobalConfiguration.CMOFile);

        //"{"access_token":"ya29.JwAg8RsoLOFVvRoAAAABOno-aHEODUMriORMMfWUF-MQaZp-cwH9GwN-snEY7A","token_type":"Bearer","expires_in":3600,"id_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6ImYyMWM4Yzk4N2M2ZDM1ODkwYTBhZjYzNjE0ZjU4MDU5YWU4N2RjNDkifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwic3ViIjoiMTA2NzQwNDc4MTYwMjAzMzc0Nzc5IiwiYXpwIjoiNjc0NDg0NDI1MzM0LTJhdGFpaWRhcXMzbXZqMmFpYXJxamJocWUyazFldmtxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXRfaGFzaCI6IkhybDgxR1lOa2xOUjhQUjZKUG84amciLCJhdWQiOiI2NzQ0ODQ0MjUzMzQtMmF0YWlpZGFxczNtdmoyYWlhcnFqYmhxZTJrMWV2a3EuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJpYXQiOjE0MDE1NTA0MTgsImV4cCI6MTQwMTU1NDMxOH0.DKmFnWCW9LPLDe6XiaHU8nzOT5QQQG1hX7FJaUYkLK21OGH3oqVfYV1HPWgrGsJDtBito6XOH9CqwHWwFHIySCQNyEfVg1CKlj8huNRwrVwtYgFlyZHQRJcRXrVJc2GxIekvZY9_Dv5f962iTC49CYJCUDZOQKh2QIEMAFmhcSU","refresh_token":"1/CzYEeKu7VyRruNvQ2B7bLdof-TN3Ky7PrZzYLshuql0"}"
        GlobalConfiguration.setAccessToken({ "access_token":"ya29.JwAg8RsoLOFVvRoAAAABOno-aHEODUMriORMMfWUF-MQaZp-cwH9GwN-snEY7A","token_type":"Bearer","expires_in":3600,
            "id_token":"eyJhbGciOiJSUzI1NiIsImtpZCI6ImYyMWM4Yzk4N2M2ZDM1ODkwYTBhZjYzNjE0ZjU4MDU5YWU4N2RjNDkifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwic3ViIjoiMTA2NzQwNDc4MTYwMjAzMzc0Nzc5IiwiYXpwIjoiNjc0NDg0NDI1MzM0LTJhdGFpaWRhcXMzbXZqMmFpYXJxamJocWUyazFldmtxLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXRfaGFzaCI6IkRDSWUyWWRFZEl4MzFJT2hOTHZ3emciLCJhdWQiOiI2NzQ0ODQ0MjUzMzQtMmF0YWlpZGFxczNtdmoyYWlhcnFqYmhxZTJrMWV2a3EuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJpYXQiOjE0MDE1NDMwODQsImV4cCI6MTQwMTU0Njk4NH0.ckvpU1aXKnB_tsVFl_TGFj-1_DFQ2t6FMpxFWygFwLyajBq2j1qGSZfK6ql3cJNY15T5kv4ochBbFv7722wcVX4xQTdkkZYLSGr9K5GKPkEivWbwc6yCfFYOyLLnlz61YmaiaC__yq6_kKqL8gqlx7Y5_01fxlGtEhHR8znW8Wc"
            ,"refresh_token":"1/CzYEeKu7VyRruNvQ2B7bLdof-TN3Ky7PrZzYLshuql0"});

        var that=this;
        this.gps.verifyToken(function(data, shouldUpdate) {
           //if ok, we dont do anything, but
            if (shouldUpdate) {
                GlobalConfiguration.setAccessToken(data);
            }
            done();
        }, function(error) {
            //if token is not ok, then refresh

               throw "Token not valid, we cant go on... Please, give permissions to the app";

        });

    });

    it("should be able to list the worksheets of the file, and find the PROYECTOS tab", function(done) {

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