'use script';

describe('EntityMixController',function(){
	var entityMixController,$q,
	 scope,entityMixService;
	beforeEach(function(){
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
			$provide.value('$state',{
			});
		});
		module('EntityMixModule');
		inject(function($injector){
			$q = $injector.get('$q');
			entityMixService = $injector.get('EntityMixService');
			var $controller = $injector.get('$controller');
			var $rootscope = $injector.get('$rootScope');
			scope = $rootscope.$new();
			entityMixController = $controller('EntityMixController',{$scope:scope});
		});
	});
	
	describe('getDropDownValues',function(){
		var deferred;
		beforeEach(function(){
			deferred = $q.defer();
			spyOn(entityMixService,'getModels').and.returnValue(deferred.promise);
		})
		it('should call Entity Mix get service for populating dropdown values',function(){
			entityMixController.getDropDownValues();
			expect(entityMixService.getModels).toHaveBeenCalled();
		});
		it('should get modelYears from json returned from service',function(){
			entityMixController.getDropDownValues();
			deferred.resolve({"modelYears":[{"marketingModelYear" : "2017"},{"marketingModelYear" : "2018"},
			{"marketingModelYear" : "2017"},{"marketingModelYear" : "2018"}]});
			scope.$apply();
			expect(entityMixController.my).toEqual(["2017","2018","2017","2018"]);
			expect(entityMixController.modelYears).toEqual(["2017","2018"]);
		});
	});
	
	describe('getModels',function(){
		it('should return models for the given modelyear',function(){
			entityMixController.selectedModelYear = "2016";
			entityMixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX"},
	                                          {"marketingModelYear": "2016",
			          "vehicleKey": "319",
			          "catExtension": "C-MAX"}];
			entityMixController.getModels();
			expect(entityMixController.models).toEqual(["C-MAX"]);
		});
	});
	
	describe('getMarkets',function(){
		it('should return markets for the given model',function(){
			entityMixController.selectedModelYear = "2016";
			entityMixController.selectedModel = "C-MAX";
			entityMixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX",
			      "iso3code" : "USA",
			      "marketName" : "USA"},
	                                          {"marketingModelYear": "2016",
			          "vehicleKey": "319",
			          "catExtension": "C-MAX",
			          "iso3code" : "CAN",
			          "marketName" : "Canada"},
			          {"marketingModelYear": "2016",
				          "vehicleKey": "319",
				          "catExtension": "C-MAX",
				          "iso3code" : "USA",
				          "marketName" : "USA"}];
			entityMixController.getMarkets();
			expect(entityMixController.markets).toEqual(['USA','Canada']);
			
		})
	})
	
	describe('getChannels',function(){
		it('should return channels for the given market',function(){
			entityMixController.selectedModelYear = "2016";
			entityMixController.selectedModel = "C-MAX";
			entityMixController.selectedMarket = "USA";
			entityMixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX",
			      "iso3code" : "USA",
			      "marketName" : "USA",
			      "channelName" : "Fleet"},
	                                          {"marketingModelYear": "2016",
			          "vehicleKey": "319",
			          "catExtension": "C-MAX",
			          "iso3code" : "CAN",
			          "marketName" : "Canada",
			          "channelName" : "Fleet"}];
			entityMixController.getChannels();
			expect(entityMixController.channels).toEqual(["Fleet"]);
		});
	});
	
	describe('getFamilies',function(){
		it('should return list of families for the given market',function(){
			entityMixController.selectedModelYear = "2016";
			entityMixController.selectedModel = "C-MAX";
			entityMixController.selectedMarket = "USA";
			entityMixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX",
			      "iso3code" : "USA",
			      "marketName" : "USA",
			      "channelName" : "Fleet",
			      "families":[{"key":"606989", "name":"PPV"},{"key":"606930", "name":"CAB STYLE-LT TRK (CA#)"}]},
			      
			      {"marketingModelYear": "2016",
		          "vehicleKey": "319",
		          "catExtension": "C-MAX",
		          "iso3code" : "CAN",
		          "marketName" : "Canada",
		          "channelName" : "Fleet",
		          "families":[{"key":"606900", "name":"PPV"},{"key":"606931", "name":"ENGINE EN-"}]}];
			entityMixController.getFamilies();
			var expected = [ { "key":"606989", "name":"PPV" }, { "key":"606930", "name":"CAB STYLE-LT TRK (CA#)" } ] ;
			expect(entityMixController.families.length).toEqual(expected.length);
			expect(entityMixController.families).toEqual(expected);
		});
		it('should return list of unique families for the given market',function(){
			entityMixController.selectedModelYear = "2016";
			entityMixController.selectedModel = "C-MAX";
			entityMixController.selectedMarket = "USA";
			entityMixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX",
			      "iso3code" : "USA",
			      "marketName" : "USA",
			      "channelName" : "Fleet",
			      "families":[{"key":"606989", "name":"PPV"},{"key":"606930", "name":"CAB STYLE-LT TRK (CA#)"}]},
			      
			      {"marketingModelYear": "2016",
		          "vehicleKey": "319",
		          "catExtension": "C-MAX",
		          "iso3code" : "USA",
		          "marketName" : "USA",
		          "channelName" : "Retail",
		          "families":[{"key":"606989", "name":"PPV"},{"key":"606930", "name":"CAB STYLE-LT TRK (CA#)"}]}];
			entityMixController.getFamilies();
			var expected = [ { "key":"606989", "name":"PPV" }, { "key":"606930", "name":"CAB STYLE-LT TRK (CA#)" } ] ;
			expect(entityMixController.families.length).toEqual(expected.length);
			expect(entityMixController.families).toEqual(expected);
		});
	});
	
	describe('getStartMonth',function(){
		it('should set the startMonthRange by filtering for the model',function(){
			entityMixController.selectedModelYear = "2016";
			entityMixController.selectedModel = "C-MAX";
			entityMixController.ogmDropDown = [{"marketingModelYear": "2016",
				      "vehicleKey": "319",
				      "catExtension": "C-MAX",
				      "iso3code" : "USA",
				      "horizonStartMonth" : "201707",
				      "horizonEndMonth" : "201708"},
                  {
			    	  "marketingModelYear": "2016",
			          "vehicleKey": "319",
			          "catExtension": "C-MAX",
			          "iso3code" : "CAN",
			          "horizonStartMonth" : "201707",
				      "horizonEndMonth" : "201708"},
		          {
			          "marketingModelYear": "2016",
			          "vehicleKey": "319",
			          "catExtension": "C-MAX",
			          "iso3code" : "USA",
			          "horizonStartMonth" : "201707",
				      "horizonEndMonth" : "201708"}];
			spyOn(entityMixController,'getEndMonth');
			entityMixController.getStartMonth();
			var output = entityMixController.startMonthRange;
			var expected = {
					startDate: new Date(2017,06),
					endDate: new Date(2017,07),
					minDate: new Date(2017,06),
					maxDate: new Date(2017,07)
			}
			expect(output.startDate.getTime()).toEqual(expected.startDate.getTime());
			expect(output.endDate.getTime()).toEqual(expected.endDate.getTime());
			expect(output.minDate.getTime()).toEqual(expected.minDate.getTime());
			expect(output.maxDate.getTime()).toEqual(expected.maxDate.getTime());
		});
	});
	
	describe('getEndMonth',function(){
		it('should set the end month range for the given start date',function(){
			entityMixController.startMonthRange = {
				startDate: new Date(2017,06),
				endDate: new Date(2017,10),
				minDate: new Date(2017,04),
				maxDate: new Date(2017,10)
			}
			spyOn(entityMixController,'getFamilies');
			entityMixController.getEndMonth();
			var output = entityMixController.endMonthRange;
			var expected = {
					startDate: new Date(2017,06),
					endDate: new Date(2017,10),
					minDate: new Date(2017,06),
					maxDate: new Date(2017,10)
			}
			expect(output.startDate.getTime()).toEqual(expected.startDate.getTime());
			expect(output.endDate.getTime()).toEqual(expected.endDate.getTime());
			expect(output.minDate.getTime()).toEqual(expected.minDate.getTime());
			expect(output.maxDate.getTime()).toEqual(expected.maxDate.getTime());
		});
	});
	
	describe('getEntityMixData',function(){
		var deferred;
		beforeEach(function(){
			deferred = $q.defer();
			spyOn(entityMixController,'getRequestParameters');
			spyOn(entityMixController,'setDropdownsInService');
			spyOn(entityMixService,'getEntityMixData').and.returnValue(deferred.promise);
		});
		it('should return entity mix data for the given model year, model, market,  channel, start and end month', function(){
			entityMixController.getEntityMixData();
			expect(entityMixService.getEntityMixData).toHaveBeenCalled();
		});
		it('should process the response data', function(){
			spyOn(entityMixController,'setEntityMixTableData');
			entityMixController.getEntityMixData();
			deferred.resolve({});
			scope.$apply();
			expect(entityMixController.setEntityMixTableData).toHaveBeenCalled();
		});
		it('should stop the loading indicator on failure', function(){
			scope.isLoadingIndicator = true;
			spyOn(entityMixController,'setEntityMixTableData');
			entityMixController.getEntityMixData();
			deferred.reject("ERROR");
			scope.$apply();
			expect(scope.isLoadingIndicator).toBe(false);
		});
	});
	
	describe("getMonths", function() {
		it("should return a list of months from the week list", function() {
		    var weeks = [{week: new Date(2017, 8, 4), month: new Date(2017, 8)}];
		    var expected = [new Date(2017, 8)];
		    var months = entityMixController.getMonths(weeks);
		    expect(months.length).toEqual(expected.length);
		    for (var i=0; i<expected.length; i++) {
		        expect(months[i].getTime()).toEqual(expected[i].getTime());
		    };
		});
		it("should span across multiple months", function() {
		    var weeks = [{week: new Date(2017, 8, 4), month: new Date(2017, 8)},
		                 {week: new Date(2017, 9, 2), month: new Date(2017, 9)}];
		    var expected = [new Date(2017, 8), new Date(2017, 9)];
		    var months = entityMixController.getMonths(weeks);
		    expect(months.length).toEqual(expected.length);
		    for (var i=0; i<expected.length; i++) {
		        expect(months[i].getTime()).toEqual(expected[i].getTime());
		    };
		});
		it("should return each month only once", function() {
		    var weeks = [{week: new Date(2017, 8, 4), month: new Date(2017, 8)},
		                 {week: new Date(2017, 8, 11), month: new Date(2017, 8)}];
		    var expected = [new Date(2017, 8)];
		    var months = entityMixController.getMonths(weeks);
		    expect(months.length).toEqual(expected.length);
		    for (var i=0; i < expected.length; i++) {
		        expect(months[i].getTime()).toEqual(expected[i].getTime());
		    };
		});
	});
	
	describe("getNumWeeksForMonth", function() {
		it("should return the number of weeks in a month", function() {
        	entityMixController.weeks = [{week: new Date(2017, 8, 4), month: new Date(2017, 8)},
                                      {week: new Date(2017, 8, 11), month: new Date(2017, 8)},
                                      {week: new Date(2017, 9, 2), month: new Date(2017, 9)}];
            expect(entityMixController.getNumWeeksForMonth(new Date(2017, 8))).toEqual(2);
        });
	});
	
	describe('isNextMonth',function(){
		it('should return true if new month started',function(){
			entityMixController.currentMonth = new Date(2017,7);
			var month = new Date(2017,8);
			expect(entityMixController.isNextMonth(month)).toBe(true);
		});
		it('should return false if it is the same month',function(){
			entityMixController.currentMonth = new Date(2017,8);
			var month = new Date(2017,8);
			expect(entityMixController.isNextMonth(month)).toBe(false);
		});
		it('should return true or false for the given month',function(){
			entityMixController.currentMonth = new Date(2017,6);
			var months = [new Date(2017,6), new Date(2017,6), new Date(2017,7), new Date(2017,8), new Date(2017,8)];
			var expected = [false,false,true,true,false];
			for (var i=0; i<months.length; i++)
				expect(entityMixController.isNextMonth(months[i])).toBe(expected[i]);
		});
	});
   
	describe("getWeeks",function(){
		it('should return weeks in date format',function(){
			var input = [ { "week":"20170804", "month":"201708" }, { "week":"20170811", "month":"201708" }, { "week":"20170902", "month":"201709" } ];
			var expected =  [{week: new Date(2017, 7, 4), month: new Date(2017, 7)},
                            {week: new Date(2017, 7, 11), month: new Date(2017, 7)},
                            {type:'Total',month: new Date(2017,7)},
                            {type: 'SPCPS',month: new Date(2017,7)},
                            {week: new Date(2017, 8, 2), month: new Date(2017, 8)},
                            {type: 'Total', month: new Date(2017,8)},
                            {type: 'SPCPS',month: new Date(2017,8)}];
			entityMixController.currentMonth = new Date(2017,7);
			var weeks = entityMixController.getWeeks(input);
            expect(weeks.length).toEqual(expected.length);
            for (var i=0; i < expected.length; i++) {
            	if(!weeks[i].type)
            		expect(weeks[i].week.getTime()).toEqual(expected[i].week.getTime());
            }
	   });
	});
   
	describe("getVolumes", function(){
		it("should convert the date object in the volumes json received",function(){
			entityMixController.weeks = [{week: new Date(2017, 7, 4), month: new Date(2017, 7)},
			                             {week: new Date(2017, 7, 11), month: new Date(2017, 7)},
			                             {type:'Total',month: new Date(2017,7)},
			                             {week: new Date(2017, 8, 2), month: new Date(2017, 8)},
			                             {type: 'Total', month: new Date(2017,8)}];
			entityMixController.volumes = [ { "volumekey":"0", "entityKey":"0", "week":"20170804", "volume":"100", "mix":"4.55" }, { "volumekey":"1", "entityKey":"0", "week":"20170811", "volume":"200", "mix":"4.55" } ];
			var volumes = entityMixController.getVolumes(entityMixController.volumes);
			var expected = [ { "volumekey":"0", "entityKey":"0", "week":new Date(2017, 7, 4), "month": new Date(2017,7), "volume":"100", "mix":"4.55" },
			                 { "volumekey":"1", "entityKey":"0", "week":new Date(2017, 7, 11), "month": new Date(2017,7), "volume":"200", "mix":"4.55" } ];
			expect(volumes).toEqual(expected);
	   });
	});
   
	describe("getWeekVolumes", function() {
		it("should return the volume objects that belong to the given week", function() {
			entityMixController.volumes = [
			                               {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
			                               {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"},
			                               {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
			                               ];
			var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
			var volumes = entityMixController.getWeekVolumes(weekObj);
			var expected = [
                            {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
                            {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
			                ];
			expect(volumes).toEqual(expected);
		});

		it("should return the volume objects when the cache is used", function() {
			entityMixController.volumes = [
			                               {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
			                               {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"},
			                               {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
			                               ];
			var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
			entityMixController.weekVolumesCache = {"Mon Sep 04 2017 00:00:00 GMT+0530 (India Standard Time)": [entityMixController.volumes[0]]};
			var volumes = entityMixController.getWeekVolumes(weekObj);
			var expected = [{volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"}];
			expect(volumes).toEqual(expected);
		});
});
	
	describe('getEntityVolumes',function(){
		it('should return the volume objects that belong to the given entity',function(){
			entityMixController.volumes = [
			                               {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
			                               {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"},
			                               {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
			                               ];
			var entity = {key: "0", name: "Ecosport 1", body: "BM-A", drive: "Drive 1",
					engine: "Engine 1", transmission: "Trans 1", wheel: "Wheel 1"};
			var volumes = entityMixController.getEntityVolumes(entity);
			var expected = [
                            {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
                            {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"}
			                ];
			expect(volumes).toEqual(expected);
		});
		
		it("should return the entity volume objects when the cache is used", function() {
			entityMixController.volumes = [
			                               {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
			                               {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"},
			                               {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
			                               ];
			var entity = {key: "0", name: "Ecosport 1", body: "BM-A", drive: "Drive 1",
					engine: "Engine 1", transmission: "Trans 1", wheel: "Wheel 1"};
			entityMixController.entityVolumesCache = {"0": [entityMixController.volumes[0],entityMixController.volumes[1]]};
			var volumes = entityMixController.getEntityVolumes(entity);
			var expected = [{volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
                            {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"}];
			expect(volumes).toEqual(expected);
		});
	});
	
	describe("getVolumeForWeek", function() {
		it("should return the volume object for the given entity and week", function() {
			entityMixController.volumes = [
			                               {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
			                               {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"},
			                               {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
			                               ];
			var entity = {key: "0", name: "Ecosport 1", body: "BM-A", drive: "Drive 1",
					engine: "Engine 1", transmission: "Trans 1", wheel: "Wheel 1"};
			var weekObj = {week: new Date(2017, 8, 11), month: new Date(2017, 8)};
			var volumeObj = entityMixController.getVolumeForWeek(entity, weekObj);
			expect(volumeObj).toEqual(entityMixController.volumes[1]);
		});
	});
	   

	describe("getTotalVolumeForWeek", function() {
		it("should return the total volume for the given week", function() {
			entityMixController.volumes = [
	                {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
	                {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), volume: "200"},
	                {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
	            ];
			var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
			var total = entityMixController.getTotalVolumeForWeek(weekObj);
			expect(total).toEqual(400);  
		});
	});
	
    describe("calculateMixPercentForWeek", function() {
        it("should return 100 percent if there is only one volume value", function() {
            entityMixController.volumes = [
                {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"}
            ];
            var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
            entityMixController.calculateMixPercentForWeek(weekObj);
            expect(entityMixController.volumes[0].mixPercent).toEqual(100);
        });
        it("should return the percent as per the volume distribution", function() {
            entityMixController.volumes = [
                {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
                {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
            ];
            var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
            entityMixController.calculateMixPercentForWeek(weekObj);
            expect(entityMixController.volumes[0].mixPercent).toEqual(25);
            expect(entityMixController.volumes[1].mixPercent).toEqual(75);
        });
    });
	
    describe("getFeaturesForFamilyKey", function() {
        it("should return the feature value for the given family key", function() {
        	entityMixController.entities = [{ "key":0, "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FG", "519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FG" }, 
                                         { "key":1, "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FH", "519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FH" }];
            var values = entityMixController.getFeaturesForFamilyKey({key:"519100",name:"FAMILY1"});
            var expected = [{family:"FAMILY1",feature:"BS-DB",familyKey:"519100"}];
            expect(values.length).toEqual(1);
            expect(values).toEqual(expected);
        });
       
    }); 
    
    describe('removeDuplicateFeatures',function(){
    	it('should remove duplicates from the given array',function(){
    		var input = ["BS-AB","AB-BC","AB-BC"];
    		var expected = ["BS-AB","AB-BC"];
    		expect(entityMixController.removeDuplicateFeatures(input)).toEqual(expected);
    	});
    });
    
    describe('getFeatureVolume',function(){
    	it('should return the sum of volumes for the given feature, familyKey and week',function(){
    		 entityMixController.volumes = [
    		                                {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100"},
    		                                {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300"}
    		                            ];
    		 entityMixController.entities = [{ "key":"0", "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FG",
    			 "519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FG" }, 
                                             { "key":"1", "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FH",
    			 "519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FH" }];
    		 var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
    		 var feature = "BS-DB";
    		 var familyKey = "519100";
    		 expect(entityMixController.getFeatureVolume(familyKey,feature,weekObj)).toEqual(400);
    	});
    });
    
    describe('getFeatureMixes',function(){
    	it('should return the sum of percentages for the given feature, familyKey, week',function(){
    		entityMixController.volumes = [
   		                                {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), volume: "100",mixPercent: "10"},
   		                                {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), volume: "300",mixPercent: "20"}
   		                            ];
    		 entityMixController.entities = [{ "key":"0", "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FG",
    			 "519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FG" }, 
                                             { "key":"1", "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FH",
    			 "519100":"BS-DA", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FH" }];
    		 var weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
    		 var feature = "BS-DB";
    		 var familyKey = "519100";
    		 expect(entityMixController.getFeatureMixes(familyKey,feature,weekObj)).toEqual(25);
    	});
    });
    
    describe('getSelectedFamiliesArray',function(){
    	it('should return an array of individual families selected in the dropdown',function(){
    		entityMixController.selectedFamilies = ["1","2"];
    		entityMixController.families = [{ "key":"0", "name":"PPV", code:"" },
    		                                { "key":"1", "name":"FAMILY1", code:"A" },
    		                                { "key":"2", "name":"FAMILY2",code:"B" }]
    		var expected = [ { "key":"1", "name":"FAMILY1", code:"A" }, { "key":"2", "name":"FAMILY2", code:"B"} ];
    		expect(entityMixController.getSelectedFamiliesArray()).toEqual(expected);
    	});
    	it('should not return superfamily if PPV is selected',function(){
    		entityMixController.selectedFamilies = ["0","2"];
    		entityMixController.families = [{ "key":"0", "name":"PPV", code:"" },
    		                                { "key":"1", "name":"FAMILY1", code:"A" },
    		                                { "key":"2", "name":"FAMILY2", code:"B" }];
    		var expected = [ { "key":"2", "name":"FAMILY2", code:"B" } ];
    		expect(entityMixController.getSelectedFamiliesArray()).toEqual(expected);
    	});
    	it('should not return superfamily if ALL is selected',function(){
    		entityMixController.selectedFamilies = ["ALL"];
    		entityMixController.families = [{ "key":"0", "name":"PPV", code:"" },
    		                                { "key":"1", "name":"FAMILY1", code:"A" },
    		                                { "key":"2", "name":"FAMILY2", code:"B" }];
    		var expected = [ { "key":"1", "name":"FAMILY1", code:"A" }, { "key":"2", "name":"FAMILY2", code:"B" } ];
    		expect(entityMixController.getSelectedFamiliesArray()).toEqual(expected);
    	});
    });
    
    describe('get TotalVolume and TotalMix For EntityAndMonth together, FeatureAndMonth together,get totalMonthVolume for all entities and totalMonthVolume for all features',function(){
    	var weekObj,entity,feature,familyKey;
    	beforeEach(function(){
    		entityMixController.volumes = [
       		           	                {volumeKey: "0", entityKey:"0", week: new Date(2017, 8, 4), month: new Date(2017,8), volume: "100", mixPercent: "10"},
       		           	                {volumeKey: "1", entityKey:"0", week: new Date(2017, 8, 11), month: new Date(2017,8), volume: "200", mixPercent: "20"},
       		           	                {volumeKey: "2", entityKey:"1", week: new Date(2017, 8, 4), month: new Date(2017,8), volume: "300", mixPercent: "30"}
       		           	                ];
  			weekObj = {week: new Date(2017, 8, 4), month: new Date(2017, 8)};
  			entity = {key: "0", name: "Ecosport 1", body: "BM-A", drive: "Drive 1",
				engine: "Engine 1", transmission: "Trans 1", wheel: "Wheel 1"};
  			entityMixController.entities = [{ "key":"0", "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FG",
  				"519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FG" }, 
  				{ "key":"1", "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FH",
   				"519100":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FH" }];
  			
  			feature = "BS-DB";
  			familyKey = "519100";
    	})
    	it('should return the total entity volume for the given entity and month',function(){
   			var total = entityMixController.getTotalVolumeForEntityAndMonth(entity,weekObj);
   			expect(total).toEqual(300);  
    	});
    	it('should return the total entity mix percent for the given entity and month',function(){
    		var total = entityMixController.getTotalMixForEntityAndMonth(entity,weekObj);
    		expect(total).toEqual(50);
    	});
    	it('should return the total entity volume for the given month',function(){
    		var total = entityMixController.getTotalVolumeForMonth(weekObj);
   			expect(total).toEqual(600);
    	});
    	it('should return the total feature volume for the given feature and month',function(){
    		var total = entityMixController.getTotalVolumeForFeatureAndMonth(familyKey,feature,weekObj);
   			expect(total).toEqual(600);
    	});
    	it('should return the total feature volume for the given feature and month',function(){
    		var total = entityMixController.getTotalMixForFeatureAndMonth(familyKey,feature,weekObj);
   			expect(total).toEqual(100);
    	});
    });
    
    describe('getFamilyTableRecords',function(){
    	it('should return family table records for the given family',function(){
    		entityMixController.selectedFamilies = ["1"];
    		entityMixController.families = [{ "key":"0", "name":"PPV" },
    		                                { "key":"1", "name":"FAMILY1" }
    		                                ];
    		entityMixController.entities = [{ "key":0, "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FG", "1":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FG" }, 
                                            { "key":1, "PPV":"BS-DB.DR-AB.VS-PC.DGAKM.TR-EF.EN-FH", "1":"BS-DB", "519116":"DR-AB", "519165":"VS-PC", "519222":"DGAKM", "519229":"TR-EF", "519234":"EN-FH" }];
    		var expected = [{family:'FAMILY1', feature:'BS-DB', familyKey:"1"},{type:'Total', family:'FAMILY1', familyKey:"1"}];
    		expect(entityMixController.getFamilyTableRecords()).toEqual(expected);
    	});
    });
    
    describe('isMonthLockedIn',function(){
    	it('should return true if the month is in locakedInMonth',function(){
    		entityMixController.uniqueModelObject = {
    				"lockedinMonth": "201709,201710"
    		};
    		var month = new Date(2017,8);
    		expect(entityMixController.isMonthLockedIn(month)).toBe(true);
    	});
    	it('should return false if the month is not in locakedInMonth',function(){
    		entityMixController.uniqueModelObject = {
    				"lockedinMonth": "201709,201710"
    		};
    		var month = new Date(2017,7);
    		expect(entityMixController.isMonthLockedIn(month)).toBe(false);
    	});
    });
});