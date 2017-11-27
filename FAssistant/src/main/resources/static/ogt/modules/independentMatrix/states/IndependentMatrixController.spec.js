'use script';

describe('IndependentMatrixController',function(){
	var independentMatrixController,$q,
	 scope,independentMatrixService,volumesDropdownService;
	beforeEach(function(){
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
			$provide.value('$state',{
			});
		});
		module('IndependentMatrixModule');
		inject(function($injector){
			$q = $injector.get('$q');
			independentMatrixService = $injector.get('IndependentMatrixService');
			var $controller = $injector.get('$controller');
			var $rootscope = $injector.get('$rootScope');
			scope = $rootscope.$new();
			independentMatrixController = $controller('IndependentMatrixController',{$scope:scope});
			volumesDropdownService = $injector.get('VolumesDropdownService');
		});
	});
	
	describe('triggerDropdownPopulation', function(){
		it('should call associated functions for populating dropdown values',function(){
			volumesDropdownService.market = "USA";
			volumesDropdownService.channel = "Fleet";
			volumesDropdownService.startMonthDate = new Date(2017,06);
			volumesDropdownService.endMonthDate = new Date(2017,06);
			independentMatrixController.startMonthRange = {startDate:''};
			independentMatrixController.endMonthRange = {startDate:''};
			spyOn(independentMatrixController,'getModels');
			spyOn(independentMatrixController,'getModelName').and.returnValue('Ecopsort');
			spyOn(independentMatrixController,'getMarkets');
			spyOn(independentMatrixController,'getChannels');
			spyOn(independentMatrixController,'getStartMonth');
			spyOn(independentMatrixController,'getEndMonth');
			independentMatrixController.triggerDropdownPopulation();
			expect(independentMatrixController.getModels).toHaveBeenCalled();
			expect(independentMatrixController.selectedModel).toEqual('Ecopsort');			
			expect(independentMatrixController.getMarkets).toHaveBeenCalled();
			expect(independentMatrixController.selectedMarket).toEqual('USA');			
			expect(independentMatrixController.getChannels).toHaveBeenCalled();
			expect(independentMatrixController.selectedChannel).toEqual('Fleet');			
			expect(independentMatrixController.getStartMonth).toHaveBeenCalled();
			expect(independentMatrixController.startMonthRange.startDate).toEqual(new Date(2017,06));			
			expect(independentMatrixController.getEndMonth).toHaveBeenCalled();
			expect(independentMatrixController.endMonthRange.endDate).toEqual(new Date(2017,06));
			
		});
	});
	
	describe('getModelName ',function(){
		it('should return modelName',function(){
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX"}];
			expect(independentMatrixController.getModelName("319")).toEqual("C-MAX");
		});
		
	});
	
	describe('emptyMonthsFamilies',function(){
		it('should empty startMonthRange',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.startMonthRange).toEqual({});
		});
		it('should empty endMonthRange',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.endMonthRange).toEqual({});
		});
		it('should empty families',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.families).toEqual([]);
		});
		it('should empty selectedFamilies',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.selectedFamilies).toEqual([]);
		});
		it('should empty buttonName',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.buttonName).toEqual('');
		});
		it('should false enableCancelButton',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.enableCancelButton).toEqual(false);
		});
		it('should false displayTable',function(){
			independentMatrixController.emptyMonthsFamilies();
			expect(independentMatrixController.displayTable).toEqual(false);
		});
	});
	
	describe('getDropDownValues',function(){
		var deferred;
		
		beforeEach(function(){
			deferred = $q.defer();
			spyOn(independentMatrixService,'getModels').and.returnValue(deferred.promise);
			spyOn(independentMatrixController,'triggerDropdownPopulation');
		})
		it('should call Independent Matrix get service for populating dropdown values',function(){
			independentMatrixController.getDropDownValues();
			expect(independentMatrixService.getModels).toHaveBeenCalled();
		});
		it('should get modelYears from json returned from service',function(){
			independentMatrixController.selectedModelYear = "2017";
			independentMatrixController.getDropDownValues();
			deferred.resolve({"modelYears":[{"marketingModelYear" : "2017"},{"marketingModelYear" : "2018"},
			{"marketingModelYear" : "2017"},{"marketingModelYear" : "2018"}]});
			scope.$apply();
			expect(independentMatrixController.my).toEqual(["2017","2018","2017","2018"]);
			expect(independentMatrixController.modelYears).toEqual(["2017","2018"]);
			expect(independentMatrixController.triggerDropdownPopulation).toHaveBeenCalled();
		});
	});
	
	describe('cancel',function(){
		it('should false displayTable ',function(){
			independentMatrixController.cancel();
			expect(independentMatrixController.displayTable).toEqual(false);
		});
		it('should retrieve buttonName',function(){
			independentMatrixController.cancel();
			expect(independentMatrixController.buttonName).toEqual("retrieve");
		});
		it('should false enableCancelButton',function(){
			independentMatrixController.cancel();
			expect(independentMatrixController.enableCancelButton).toEqual(false);
		});
		
	});
	
	describe('getModels',function(){
		it('should return models for the given modelyear',function(){
			independentMatrixController.selectedModelYear = "2016";
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
			      "vehicleKey": "319",
			      "catExtension": "C-MAX"},
	                                          {"marketingModelYear": "2016",
			          "vehicleKey": "319",
			          "catExtension": "C-MAX"}];
			independentMatrixController.getModels();
			expect(independentMatrixController.models).toEqual(["C-MAX"]);
		});
	});
	
	describe('getMarkets',function(){
		it('should return markets for the given model',function(){
			independentMatrixController.selectedModelYear = "2016";
			independentMatrixController.selectedModel = "C-MAX";
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
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
			independentMatrixController.getMarkets();
			expect(independentMatrixController.markets).toEqual(['USA','Canada']);
			
		})
	})
	
	describe('getChannels',function(){
		it('should return channels for the given market',function(){
			independentMatrixController.selectedModelYear = "2016";
			independentMatrixController.selectedModel = "C-MAX";
			independentMatrixController.selectedMarket = "USA";
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
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
			independentMatrixController.getChannels();
			expect(independentMatrixController.channels).toEqual(["Fleet"]);
		});
	});
	
	describe('getFamilies',function(){
		it('should return list of families for the given market',function(){
			independentMatrixController.selectedModelYear = "2016";
			independentMatrixController.selectedModel = "C-MAX";
			independentMatrixController.selectedMarket = "USA";
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
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
			independentMatrixController.getFamilies();
			var expected = [ { "key":"606989", "name":"PPV" }, { "key":"606930", "name":"CAB STYLE-LT TRK (CA#)" } ] ;
			expect(independentMatrixController.families.length).toEqual(expected.length);
			expect(independentMatrixController.families).toEqual(expected);
		});
		it('should return list of unique families for the given market',function(){
			independentMatrixController.selectedModelYear = "2016";
			independentMatrixController.selectedModel = "C-MAX";
			independentMatrixController.selectedMarket = "USA";
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
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
			independentMatrixController.getFamilies();
			var expected = [ { "key":"606989", "name":"PPV" }, { "key":"606930", "name":"CAB STYLE-LT TRK (CA#)" } ] ;
			expect(independentMatrixController.families.length).toEqual(expected.length);
			expect(independentMatrixController.families).toEqual(expected);
		});
	});
	
	describe('getStartMonth',function(){
		it('should set the startMonthRange by filtering for the model',function(){
			independentMatrixController.selectedModelYear = "2016";
			independentMatrixController.selectedModel = "C-MAX";
			independentMatrixController.ogmDropDown = [{"marketingModelYear": "2016",
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
			spyOn(independentMatrixController,'getEndMonth');
			independentMatrixController.getStartMonth();
			var output = independentMatrixController.startMonthRange;
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
			independentMatrixController.startMonthRange = {
				startDate: new Date(2017,06),
				endDate: new Date(2017,10),
				minDate: new Date(2017,04),
				maxDate: new Date(2017,10)
			}
			spyOn(independentMatrixController,'getFamilies');
			independentMatrixController.getEndMonth();
			var output = independentMatrixController.endMonthRange;
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
	
});