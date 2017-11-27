'use script';
//var ctrl = require("../ogt/modules/plannedVolumes/states/plannedVolumes/PlannedVolumesController")

describe('PlannedVolumesController',function(){
	var  plannedVolumesService,
	 plannedVolumesController,
	 $q,
	 scope;
	
	beforeEach(function(){
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
			$provide.value('$state',{
			});
		});
		module('PlannedVolumesModule');
		inject(function($injector){
			$q = $injector.get('$q');
			plannedVolumesService = $injector.get('PlannedVolumesService');
			var $controller = $injector.get('$controller');
			var $rootscope = $injector.get('$rootScope');
			scope = $rootscope.$new();
			plannedVolumesController = $controller('PlannedVolumesController',{$scope:scope});
		});
	});
	
	describe('getDropdownValues',function(){
		var deferred;
		beforeEach(function(){
			deferred = $q.defer();
			spyOn(plannedVolumesService,'getModelMonths').and.returnValue(deferred.promise);
		});
		it('should call the plannedVolumesService for getting dropdowns',function(){
			plannedVolumesController.getDropdownValues();
			expect(plannedVolumesService.getModelMonths).toHaveBeenCalled();
		});
		
		it('should set modelYears from PrefPatternservice',function(){
			plannedVolumesController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(plannedVolumesController.modelYears).toEqual([10,20]);
		});
		
		it('should stop loading indicator',function(){
			plannedVolumesController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(scope.isLoadingIndicator).toBe(false);
		});
		
		it('should set the dropdownValuesReceived to true',function(){
			plannedVolumesController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(plannedVolumesController.dropdownValuesReceived).toBe(true);
		});
	});
	
	describe('loadModels',function(){
		beforeEach(function(){
			plannedVolumesController.modelYears = [{"modelYear": "2016","models" : ['MKZ','MKC']},
			                                          {"modelYear": "2017","models" : ['MKX','Edge']}];
			plannedVolumesController.selectedModelYear = '2016';
			plannedVolumesController.loadModels();
		})
		it('should load models',function(){
			expect(plannedVolumesController.models).toEqual(['MKZ','MKC']);
		});
		it('should hide buttons and table',function(){
			expect(plannedVolumesController.enableCancelButton).toBe(false);
			expect(plannedVolumesController.isDisplayPlannedVolumes).toBe(false);
			expect(plannedVolumesController.buttonName).toEqual('');
		});
	});
	
	describe('loadStartMonths',function(){
		beforeEach(function(){
			plannedVolumesController.models = [
   			    {"key":"2","name":"MKZ",
   			    	"months":[{"key":"201706","name":"01"},{"key":"201707","name":"02"},{"key":"201708","name":"03"}]
   			    },
   				{"key":"4","name":"MKC",
   			    	"months":[{"key":"4","name":"04"},{"key":"5","name":"05"},{"key":"6","name":"06"}]
   			    }];
   			plannedVolumesController.selectedModel = '2';
   			plannedVolumesController.loadStartMonths();
		})
		it('should load start months',function(){
			expect(plannedVolumesController.startMonths).toEqual([{"key":"201706","name":"01"},{"key":"201707","name":"02"},{"key":"201708","name":"03"}]);
		});
		it('should display retrieve button and hide table',function(){
			expect(plannedVolumesController.enableCancelButton).toBe(false);
			expect(plannedVolumesController.isDisplayPlannedVolumes).toBe(false);
			expect(plannedVolumesController.buttonName).toEqual('retrieve');
		});
	});
	
	describe('loadEndMonths',function(){
		beforeEach(function(){
			plannedVolumesController.startMonthRange = {
					startDate: new Date(2017,05),
					endDate: new Date(2017,07),
					minDate: new Date(2017,05),
					maxDate: new Date(2017,07)
			}
			plannedVolumesController.totalMonths = [{"key":"201705","name":"00"},{"key":"201706","name":"01"},{"key":"201707","name":"02"},{"key":"201708","name":"03"}];
			plannedVolumesController.loadEndMonths();
		})
		it('should load end months',function(){
			expect(plannedVolumesController.endMonths).toEqual([{"key":"201706","name":"01"},{"key":"201707","name":"02"},{"key":"201708","name":"03"}]);
		});
		it('should display retrieve button and hide table',function(){
			expect(plannedVolumesController.enableCancelButton).toBe(false);
			expect(plannedVolumesController.isDisplayPlannedVolumes).toBe(false);
			expect(plannedVolumesController.buttonName).toEqual('retrieve');
		});
	})
	
	describe('loadButtons',function(){
		it('should display retrieve button alone',function(){
			plannedVolumesController.loadButtons();
			expect(plannedVolumesController.buttonName).toEqual('retrieve');
		});
	});
	
	describe('loadPlannedVolumes',function(){
		var deferred;
		beforeEach(function(){
			deferred = $q.defer();
			spyOn(plannedVolumesService,'getPlannedVolumes').and.returnValue(deferred.promise);
			plannedVolumesController.endMonthRange = {
					startDate: new Date(2017,05),
					endDate: new Date(2017,07),
					minDate: new Date(2017,05),
					maxDate: new Date(2017,07)
			}
		});
		it('should display save button after retrieving the planned volumes',function(){
			spyOn(plannedVolumesController, 'getPlantNames');
			spyOn(plannedVolumesController,'getPlantVolumes');
			plannedVolumesController.loadPlannedVolumes();
			deferred.resolve({ operatingPlan: [], marketVolumes: [] });
			scope.$apply();
			expect(plannedVolumesController.buttonName).toEqual('save');
		});
	});
	
	describe('getMonths',function(){
		it('should return one month',function(){
			var input = [{ month: "201707"}];
			var expected = [{ monthKey: "201707", month: new Date(2017, 06) }];
			expect(plannedVolumesController.getMonths(input)).toEqual(expected);
		});
		it('should process multiple months',function(){
			var input = [{ month: "201707"},{month: "201708"}];
			var expected = [{ monthKey: "201707", month: new Date(2017, 06) },
			                { monthKey: "201708", month: new Date(2017, 07) }];
			expect(plannedVolumesController.getMonths(input)).toEqual(expected);
		});
	});
	
	describe('getWeeks',function(){
		it('should return one month and one week',function(){
			var input = [{ month: "201707",weeks:[{weekKey:"20170703"}]}];
			var expected = {month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)};
			var weeks = plannedVolumesController.getWeeks(input);
			expect(weeks).toContain(expected);
		});
		it('should process all weeks in a month',function(){
			var input = [{ month: "201707",weeks:[{weekKey:"20170703"},
			                                      {weekKey:"20170710"}
			]}];
			var expected = [{month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)},
			                {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)}];
			var weeks = plannedVolumesController.getWeeks(input);
			expected.forEach(function(expectedObj) {
				expect(weeks).toContain(expectedObj);
			});
		});
		it('should process all weeks of all months',function(){
			var input = [{ month: "201707",weeks:[{weekKey:"20170703"},
			                                      {weekKey:"20170710"}
			]},
			{ month: "201708",weeks:[{weekKey:"20170731"}] }
			];
			var expected = [{month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)},
			                {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)},
			                {month : new Date(2017, 07), weekKey:"20170731", week: new Date(2017,06,31)}];
			var weeks = plannedVolumesController.getWeeks(input);
			expected.forEach(function(expectedObj) {
				expect(weeks).toContain(expectedObj);
			});
		});
		it('should have Total and Overrides columns at the end of a month', function() {
			var input = [{ month: "201707",weeks:[{weekKey:"20170703"}]}];			
			var expected = {type: 'Total', month: new Date(2017, 06)};
			var weeks = plannedVolumesController.getWeeks(input);
			expect(weeks[1].type).toEqual('Total');
			expect(weeks[2].type).toEqual('Overrides');
		});
	});
	
	describe('getNumberOfWeeks',function(){
		it('should return the number of weeks in that month',function(){
			plannedVolumesController.weeks = [{month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)},
			      			                {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)},
			    			                {month : new Date(2017, 07), weekKey:"20170731", week: new Date(2017,06,31)}];
			expect(plannedVolumesController.getNumberOfWeeks(new Date(2017, 06))).toEqual(2);
		});
	});
	
	describe('getOperatingPlan',function(){
		it('should return operating plan volumes across weeks for one month',function(){
			var input = [{
				month: "201707",
				weeks: [
				    { weekKey: "20170703", opPlanKey: "1", opPlanVolume: "100", spcpsKey: "10", spcpsOriginalVolume : "150" },
				    { weekKey: "20170710", opPlanKey: "2", opPlanVolume: "150", spcpsKey: "20", spcpsOriginalVolume : "250" },
				]
			}];
			var expected = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 100,
				spcpsKey: "10",
				spcpsOriginalVolume : 150
			},
			{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 10),
				opPlanKey: "2",
				opPlanVolume: 150,
				spcpsKey: "20",
				spcpsOriginalVolume : 250
			}];
			var operatingPlan = plannedVolumesController.getOperatingPlan(input);
			expected.forEach(function(expectedObj) {
				expect(operatingPlan).toContain(expectedObj);
			});
		})
		it('should process operating plan across months', function() {
			var input = [{
				month: "201707",
				weeks: [{ weekKey: "20170703", opPlanKey: "1", opPlanVolume: "100",spcpsKey: "10", spcpsOriginalVolume : "150" }]
			}, {
				month: "201708",
				weeks: [{ weekKey: "20170731", opPlanKey: "2", opPlanVolume: "150",spcpsKey: "20", spcpsOriginalVolume : "250" }]
			}];
			var expected = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 100,
				spcpsKey: "10",
				spcpsOriginalVolume : 150
			}, {
				month: new Date(2017, 07),
				week: new Date(2017, 06, 31),
				opPlanKey: "2",
				opPlanVolume: 150,
				spcpsKey: "20",
				spcpsOriginalVolume : 250
			}];
			var operatingPlan = plannedVolumesController.getOperatingPlan(input);
			expect(operatingPlan).toEqual(expected);			
		});
		it('should set zero for empty operating and spcps volumes', function() {
			var input = [{
				month: "201707",
				weeks: [{ weekKey: "20170703", opPlanKey: "1", opPlanVolume: "",spcpsKey: "10", spcpsOriginalVolume : "" }]
			}];
			var operatingPlan = plannedVolumesController.getOperatingPlan(input);
			expect(operatingPlan[0].opPlanVolume).toEqual(0);
			expect(operatingPlan[0].spcpsOriginalVolume).toEqual(0);
		});
	});
	
	describe('getOpPlanVolumeForWeek',function(){
		it('should return the opPlan volume for that week',function(){
			var input = {month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)};
			plannedVolumesController.operatingPlan = [{
				week: new Date(2017, 06, 03),
				opPlanVolume: 100
			}, {
				week: new Date(2017, 06, 10),
				opPlanVolume: 150
			}];
			expect(plannedVolumesController.getOpPlanVolumeForWeek(input)).toEqual({
				week: new Date(2017, 06, 03),
				opPlanVolume: 100
			});
		})
	});
	
	describe('getOpPlanTotalForMonth',function(){
		it('should return opPlanTotal for a month',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				opPlanVolume: 100
			}, {
				month: new Date(2017, 06),
				opPlanVolume: 150
			}, {
				month: new Date(2017, 07),
				opPlanVolume: 250
			}];
			expect(plannedVolumesController.getOpPlanTotalForMonth(new Date(2017, 06))).toEqual(250);
		})
	});
	
	describe('getSPCPSOriginalTotalForMonth',function(){
		it('should return SPCPSOriginalTotal for a month',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				spcpsOriginalVolume: 100,
				
			}, {
				month: new Date(2017, 06),
				spcpsOriginalVolume: 150
			}, {
				month: new Date(2017, 07),
				spcpsOriginalVolume: 250
			}];
			expect(plannedVolumesController.getSPCPSOriginalTotalForMonth(new Date(2017, 06))).toEqual(250);
		})
	});
	
	describe('getChannels', function() {
		it('should process a single channel', function() {
			var input = [{ market: "USA", channels: [{name:'Fleet',key:'1'}] }];
			var expected = [{type: 'Market', market:"USA"},
			                {type: 'MarketScheduleCounts',market:"USA"},
			                {market: "USA",channelName : 'Fleet', channelKey : '1'},
			                {market: "USA",channelName : 'Fleet',type:"ScheduleCounts"}]
			expect(plannedVolumesController.getChannels(input)).toEqual(expected);
		});
		
		it('should process multiple markets', function() {
			var input = [{ market: "USA", channels: [{name:'Fleet',key:'1'}, {name:'Retail',key:'2'}] },
			             { market: "Canada", channels: [{name:'Fleet',key:'3'}]}];
			var expected = [{type: 'Market', market:"USA"},
			                {type: 'MarketScheduleCounts',market:"USA"},
			                {market: "USA", channelName: 'Fleet', channelKey: '1'},
			                {market: "USA",channelName : 'Fleet',type:"ScheduleCounts"},
			                {market: "USA", channelName: 'Retail', channelKey: '2'},
			                {market: "USA",channelName : 'Retail',type:"ScheduleCounts"},
			                {type: 'Market', market:"Canada"},
			                {type: 'MarketScheduleCounts',market:"Canada"},
			                {market: "Canada", channelName: 'Fleet', channelKey: '3'},
			                {market: "Canada",channelName : 'Fleet',type:"ScheduleCounts"}];
			expect(plannedVolumesController.getChannels(input)).toEqual(expected);
		});
	});
	
	describe('getChannelVolumes', function() {
		it('should convert all channel data in a market to a linear list', function() {
			var input = [{ market: "USA", 
						   channels: [{
							   name:'Fleet',key:'1',
							   channelVolumes: [{
								   month: "201707",
						    	   "weeks": [{
						    		   "weekKey": "20170703",
	    	                            "value": "100",
	    	                            "key": "1",
	    	                            "scheduleCounts":"10"
						    	   }]
							   }]
						   }, {
							   name:'Retail',key:'2',
							   channelVolumes: [{
								   month: "201707",
						    	   "weeks": [{
						    		   "weekKey": "20170703",
	    	                            "value": "50",
	    	                            "key":"2",
	    	                            "scheduleCounts":""
						    	   }]
							   }]							   
						   }]
			}];
			var expected = [
			    {market: "USA", channelName: "Fleet", channelKey: "1", plannedVolumeKey:"1", 
			    	week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100, counts: 10, changed:false, originalVolume: 100},
			    {market: "USA", channelName: "Retail", channelKey: "2", plannedVolumeKey:"2", 
			    	week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50, counts: 0, changed:false, originalVolume: 50}
			];
			expect(plannedVolumesController.getChannelVolumes(input)).toEqual(expected);
		});
		it('should set the type for SPCPS Total cells for the channel', function() {
			var input = [{ market: "USA", 
						   channels: [{
							   name:'Fleet',key:'1',
							   channelVolumes: [{
								   month: "201707",
						    	   "weeks": [{
						    		   "weekKey": "Total",
	    	                            "value": "100",
	    	                            "scheduleCounts":""
						    	   }]
							   }]
						   }]
			}];
			var expected = [
			    {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100, counts: 0}
			];
			expect(plannedVolumesController.getChannelVolumes(input)).toEqual(expected);
		});
		it('should flatten channel objects across multiple markets', function() {
			var input = [{ market: "USA", 
				   channels: [{
					   name:'Fleet',key:'1',
					   channelVolumes: [{
						   month: "201707",
				    	   "weeks": [{
				    		   "weekKey": "20170703",
	                            "value": "100",
	                            "key":"1",
	                            "scheduleCounts":"10"
				    	   }]
					   }]
				   }, {
					   name:'Retail',key:'2',
					   channelVolumes: [{
						   month: "201707",
				    	   "weeks": [{
				    		   "weekKey": "20170703",
	                            "value": "50",
	                            "key" : "2",
	                            "scheduleCounts":"20"
				    	   }]
					   }]							   
				   }]
			}, {
				market: "Canada",
				   channels: [{
					   name:'Fleet',key:'3',
					   channelVolumes: [{
						   month: "201707",
				    	   "weeks": [{
				    		   "weekKey": "20170703",
	                            "value": "150",
	                            "key": "3",
	                            "scheduleCounts":"30"
				    	   }]
					   }]
				   }]
			}];
			var expected = [
				{market: "USA", channelName: "Fleet", channelKey: "1", plannedVolumeKey:"1", week: new Date(2017, 06, 03), 
					month: new Date(2017,06), volume: 100, counts: 10, changed: false, originalVolume: 100},
				{market: "USA", channelName: "Retail", channelKey: "2", plannedVolumeKey:"2", week: new Date(2017, 06, 03), 
					month: new Date(2017,06), volume: 50, counts: 20, changed: false, originalVolume: 50},
				{market: "Canada", channelName: "Fleet", channelKey: "3", plannedVolumeKey:"3", week: new Date(2017, 06, 03), 
					month: new Date(2017,06), volume: 150, counts: 30, changed:false, originalVolume:150}
			];
			expect(plannedVolumesController.getChannelVolumes(input)).toEqual(expected);
		});
	});
	describe('getChannelVolumeForWeek', function() {
		it('should return the channel object to display volume of the given week and channel', function() {
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "Canada", channelName: "Fleet", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150}
			];
			var week = new Date(2017, 06, 03);
			var market = "USA";
			var channel = "Fleet";
			var expected = {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100};
			expect(plannedVolumesController.getChannelVolumeForWeek(market, channel, week)).toEqual(expected);
		});
		it('should return channel object to display volume of the given week and channel when the input contains SPCPSTotal also',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2",type:"Total",month: new Date(2017,06), volume: 50},
			   {market: "Canada", channelName: "Fleet", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150}
			];
			var week = new Date(2017, 06, 03);
			var market = "USA";
			var channel = "Fleet";
			var expected = {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100};
			expect(plannedVolumesController.getChannelVolumeForWeek(market, channel, week)).toEqual(expected);
		});
		it('should return channel object to display scheduledCounts of the given week and channel when the input contains SPCPSTotal also',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100, counts: 10},
			   {market: "USA", channelName: "Retail", channelKey: "2",type:"Total",month: new Date(2017,06), volume: 50},
			   {market: "Canada", channelName: "Fleet", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150, counts: 30}
			];
			var week = new Date(2017, 06, 03);
			var market = "USA";
			var channel = "Fleet";
			var expected = {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 100, counts:10};
			expect(plannedVolumesController.getChannelVolumeForWeek(market, channel, week)).toEqual(expected);
		});
	});
	describe('getSPCPSTotalChannelVolume',function(){
		it('should return the SPCPS total channel volume for the given channel and market for one month',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", type :"Total", month : new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "Canada", channelName: "Fleet", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150}
			];
			var type = "Total";
			var market = "USA";
			var channel = "Fleet";
			var month = new Date(2017,06);
			var expected = {market: "USA", channelName: "Fleet", channelKey: "1", type :"Total", month: new Date(2017,06), volume: 100};
			expect(plannedVolumesController.getSPCPSTotalChannelVolume(market, channel, type, month)).toEqual(expected);
		});
		it('should return the SPCPS total channel volume for the given channel and market for multiple months',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", type :"Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Fleet", channelKey: "3", type :"Total", month : new Date(2017,07),volume: 200},
			   {market: "USA", channelName: "Retail", channelKey: "4", week: new Date(2017, 06, 31), month: new Date(2017,07), volume: 50},
			   {market: "Canada", channelName: "Fleet", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150}
			];
			var type = "Total";
			var market = "USA";
			var channel = "Fleet";
			var month = new Date(2017,07);
			var expected = {market: "USA", channelName: "Fleet", channelKey: "3", type :"Total", month: new Date(2017,07), volume: 200};
			expect(plannedVolumesController.getSPCPSTotalChannelVolume(market, channel, type, month)).toEqual(expected);
		});
	});
	describe('getSPCPSOverrideSumForChannel',function(){
		it('should return the sum of channel volumes as SPCPS overriden volume for the given month and channel',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", type :"Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Fleet", channelKey: "3", type :"Total", month : new Date(2017,07),volume: 200},
			   {market: "USA", channelName: "Retail", channelKey: "4", week: new Date(2017, 06, 31), month: new Date(2017,07), volume: 50},
			   {market: "USA", channelName: "Retail", channelKey: "5", week: new Date(2017, 07, 07), month: new Date(2017,07), volume: 51},
			   {market: "Canada", channelName: "Fleet", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150}
			];
			var channel = "Retail";
			var month = new Date(2017,07);
			var market = "USA";
			var expected = 101;
			expect(plannedVolumesController.getSPCPSOverrideSumForChannel(market, channel, month)).toEqual(expected);
		});
	});
	describe('getMarketSumForWeek',function(){
		it('should return market sum for the given week and market',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type :"Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 52},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150}
			];
			var expected = 155;
			var week = new Date(2017,06,03);
			var market = "USA";
			expect(plannedVolumesController.getMarketSumForWeek(market, week)).toEqual(expected);
		});
	});
	describe('getMarketSumSPCPSTotal',function(){
		it('should return the market sum for the original SPCPS volumes for the given market and month',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", type: "Total", month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Commercial", channelKey: "3", type: "Total", month: new Date(2017,06), volume: 52},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150}
			];
			var market = "USA";
			var month = new Date(2017,06);
			var type = "Total";
			var expected = 202;
			expect(plannedVolumesController.getMarketSumSPCPSTotal(market, month, type)).toEqual(expected);
		});
	});
	describe('getMarketSumSPCPSOverrides',function(){
		it('should return the market sum for the overriden SPCPS volumes for the given market and month',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 52},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150}
			];
			var market = "USA";
			var month = new Date(2017,06);
			var expected = 155;
			expect(plannedVolumesController.getMarketSumSPCPSOverrides(market, month)).toEqual(expected);
		});
	});
	describe('getWeekLevelSPCPSOverrideSum',function(){
		beforeEach(function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 52},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150}
			];
		});
		it('should return the sum of volumes of all channels for the given week',function(){
			var week = new Date(2017,06,03);
			var expected = 305;
			expect(plannedVolumesController.getWeekLevelSPCPSOverrideSum(week)).toEqual(expected);
		});
		it('should return the difference of volumes between opPlan and SPCPS original volume for the given week',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 100,
				spcpsKey: "10",
				spcpsOriginalVolume : 150
			}, {
				month: new Date(2017, 07),
				week: new Date(2017, 06, 31),
				opPlanKey: "2",
				opPlanVolume: 150,
				spcpsKey: "20",
				spcpsOriginalVolume : 250
			}];
			var weekObj = {month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)};
			var week = new Date(2017,06,03);
			var expected = -155;
			expect(plannedVolumesController.getOpPlanVolumeForWeek(weekObj).spcpsOriginalVolume
					- plannedVolumesController.getWeekLevelSPCPSOverrideSum(week)).toEqual(expected);
		});
	});
	describe('getMonthLevelSPCPSOverrideSum',function(){
		var month;
		beforeEach(function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 10), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 17), month: new Date(2017,06), volume: 52},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150}
			];
			month = new Date(2017,06);
		});
		it('should return the sum of volumes of all channels for the given month',function(){
			var expected = 305;
			expect(plannedVolumesController.getMonthLevelSPCPSOverrideSum(month)).toEqual(expected);
		});
		it('should return the difference of volumes between opPlan and SPCPS original volume for the given month',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				spcpsOriginalVolume: 100,
				
			}, {
				month: new Date(2017, 06),
				spcpsOriginalVolume: 150
			}, {
				month: new Date(2017, 07),
				spcpsOriginalVolume: 250
			}];
			var expected = -55;
			expect(plannedVolumesController.getSPCPSOriginalTotalForMonth(month) 
					- plannedVolumesController.getMonthLevelSPCPSOverrideSum(month)).toEqual(expected);
		});
	});
	
	describe('getLockedInMonthsObject',function(){
		it('should return an object containing month as key and lockedIn as its value',function(){
			plannedVolumesController.startMonths = [{
	              "key": "201708",
	              "name": "AUG-17",
	              "lockedIn": "Y"
	            },
	            {
	              "key": "201709",
	              "name": "SEP-17",
	              "lockedIn": "N"
	            }];
			var expected = {
					"201708" : 'Y',
					"201709" : 'N'
			}
			expect(plannedVolumesController.getLockedInMonthsObject()).toEqual(expected);
		});
	});
	
	describe('isMonthLockedIn',function(){
		it('should return boolean for the given month',function(){
			plannedVolumesController.lockedInMonthsObject = {
					"201708" : 'Y',
					"201709" : 'N',
					"201710" : 'Y'
			}
			var month = new Date(2017,07);
			expect(plannedVolumesController.isMonthLockedIn(month)).toEqual(true);
		});
	});
	
	describe('freezeChannelCell',function(){
		var weekObj;
		
		beforeEach(function(){
			weekObj = {month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)};
		});
		it('should return true if OpPlan volume is zero',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 3),
				opPlanVolume: 0
			}];
			expect(plannedVolumesController.freezeChannelCell(weekObj)).toEqual(true);
		});
		it('should return false if month lies in locked-in period',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 3),
				opPlanVolume: 100
			}];
			plannedVolumesController.lockedInMonthsObject = {
					"201707" : 'Y',
			};
			expect(plannedVolumesController.freezeChannelCell(weekObj)).toEqual(false);
		});
		it('should return false when none of the above 2 conditions are met',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 3),
				opPlanVolume: 100
			}];
			plannedVolumesController.channelVolumes = [
  			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			];
			plannedVolumesController.lockedInMonthsObject = {
					"201707" : 'N',
			};
			expect(plannedVolumesController.freezeChannelCell(weekObj)).toEqual(false);
		});
	});
	describe('getPlantNames',function(){
		it('should return plant names',function(){
			var input = [
			              {
			                  "month": "201707",
			                  "weeks": [
			                    {
			                      "weekKey": "20170703",
			                      "opPlanKey": "",
			                      "opPlanVolume": "100",
			                      "spcpsKey": "",
			                      "spcpsOriginalVolume": "5",
			                      "plants": [
			                        {
			                          "name": "Ford Power Prod-CREW",
			                          "key": "",
			                          "value": "",
			                          "vehiclePlantKey": "238"
			                        },
			                        {
			                          "name": "Ford Power Prod Total",
			                          "key": "",
			                          "value": "20"
			                        }]
			                    }]
			              }];
			var expected = ["Ford Power Prod-CREW","Ford Power Prod Total"];
			expect(plannedVolumesController.getPlantNames(input)).toEqual(expected);
		});
	});
	describe('getPlantVolumes',function(){
		it('should return the plant volumes',function(){
			var input = [
			              {
			                  "month": "201707",
			                  "weeks": [
			                    {
			                      "weekKey": "20170703",
			                      "opPlanKey": "",
			                      "opPlanVolume": "100",
			                      "spcpsKey": "",
			                      "spcpsOriginalVolume": "5",
			                      "plants": [
			                        {
			                          "name": "Ford Power Prod-CREW",
			                          "key": "",
			                          "value": "",
			                          "vehiclePlantKey": "238"
			                        },
			                        {
			                          "name": "Ford Power Prod Total",
			                          "key": "",
			                          "value": "20"
			                        }]
			                    }]
			              }];
			var expected = [{
				month : new Date(2017,06),
				week : new Date(2017,6,3),
				plantName : "Ford Power Prod-CREW",
				plantVolume : 0
			},{
				month : new Date(2017,06),
				week : new Date(2017,6,3),
				plantName : "Ford Power Prod Total",
				plantVolume : 20
			}];
			expect(plannedVolumesController.getPlantVolumes(input)).toEqual(expected);
		});
	});
	describe('getPlantVolumeForWeek',function(){
		it('should return the plant volume for the given week',function(){
			plannedVolumesController.plantVolumes = [{
				month : new Date(2017,06),
				week : new Date(2017,6,3),
				plantName : "Ford Power Prod-CREW",
				plantVolume : 0
			},{
				month : new Date(2017,06),
				week : new Date(2017,6,3),
				plantName : "Ford Power Prod Total",
				plantVolume : 20
			}];
			var plantName = "Ford Power Prod-CREW";
			var weekObj = {month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)};
			var expected = {
					month : new Date(2017,06),
					week : new Date(2017,6,3),
					plantName : "Ford Power Prod-CREW",
					plantVolume : 0
				};
			expect(plannedVolumesController.getPlantVolumeForWeek(weekObj,plantName)).toEqual(expected);
		});
	});
	describe('getMonthLevelPlantTotal',function(){
		it('should return the plant volume for the month',function(){
			plannedVolumesController.plantVolumes = [{
				month : new Date(2017,06),
				week : new Date(2017,6,3),
				plantName : "Ford Power Prod-CREW",
				plantVolume : 30
			},{
				month : new Date(2017,06),
				week : new Date(2017,6,10),
				plantName : "Ford Power Prod-CREW",
				plantVolume : 20
			}];
			var plantName = "Ford Power Prod-CREW";
			var month = new Date(2017,06);
			expect(plannedVolumesController.getMonthLevelPlantTotal(month,plantName)).toEqual(50);
		});
	});
	describe('isOverridenVolumeValid',function(){
		beforeEach(function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 52},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 10), month: new Date(2017,06), volume: 150},
			   {market: "Mexico", channelName: "Fleet", channelKey: "5", week: new Date(2017, 06, 17), month: new Date(2017,06), volume: 200}
			];
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 3),
				opPlanVolume: 155
			},{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 10),
				opPlanVolume: 100
			},{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 17),
				opPlanVolume: 200
			}];
		})
		it('should return true if overriden volume is valid',function(){
			var weekObj = {month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)};
			expect(plannedVolumesController.isOverridenVolumeValid(weekObj)).toEqual(true);
		});
		it('should return false if overriden volume is invalid',function(){
			var weekObj = {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)};
			expect(plannedVolumesController.isOverridenVolumeValid(weekObj)).toEqual(false);
		})
		it('should push the error week into invalidOverridenVolumes',function(){
			var weekObj = {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)};
			var expected = [new Date(2017,06,10)];
			var output = plannedVolumesController.isOverridenVolumeValid(weekObj);
			expect(plannedVolumesController.errorStack).toEqual(expected);
			expect(output).toEqual(false);
		});
		it('should pop the week from the error stack if the week has valid overriden volume',function(){
			plannedVolumesController.errorStack = [new Date(2017,06,10), new Date(2017,6,3), new Date(2017,6,17)];
			var expectedErrorStack = [new Date(2017,06,10), new Date(2017,6,3)];
			var weekObj = {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,17)};
			expect(plannedVolumesController.isOverridenVolumeValid(weekObj)).toEqual(true);
			expect(plannedVolumesController.errorStack).toEqual(expectedErrorStack);
		});
		it('should not push a week which exists already in errorStack',function(){
			plannedVolumesController.errorStack = [new Date(2017,06,10), new Date(2017,6,3), new Date(2017,6,17)];
			var weekObj = {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)};
			var expectedErrorStack = [new Date(2017,06,10), new Date(2017,6,3), new Date(2017,6,17)];
			expect(plannedVolumesController.isOverridenVolumeValid(weekObj)).toEqual(false);
			expect(plannedVolumesController.errorStack).toEqual(expectedErrorStack);
		});
	});
	describe('captureEditedPlannedVolumes',function(){
		it('should return the edited planned volumes for one week',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", plannedVolumeKey:"1", week: new Date(2017, 06, 03), 
				   month: new Date(2017,06), volume: 53, changed: true, originalVolume: 53},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100},
			   {market: "USA", channelName: "Commercial", channelKey: "3", plannedVolumeKey:"3", week: new Date(2017, 06, 03), 
				   month: new Date(2017,06), volume: 52, changed: true, originalVolume: 42},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", plannedVolumeKey:"4", week: new Date(2017, 06, 03), 
				   month: new Date(2017,06), volume: 150, changed: true, originalVolume: 250}
			];
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 3),
				opPlanVolume: 305,
				spcpsKey : "1",
				spcpsOriginalVolume : 305
			}];
			plannedVolumesController.weeks = [{month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)}]
			var expected = [{
				key: "1", 
				value: 53,
				spcpsKey: "1",
				spcpsOrigValue: 305,
				channelKey: "1",
				weekKey: "20170703"
			},{
				key: "3", 
				value: 52,
				spcpsKey: "1",
				spcpsOrigValue: 305,
				channelKey: "3",
				weekKey: "20170703"
			},{
				key: "4", 
				value: 150,
				spcpsKey: "1",
				spcpsOrigValue: 305,
				channelKey: "4",
				weekKey: "20170703"
			}];
			expect(plannedVolumesController.captureEditedPlannedVolumes()).toEqual(expected);
		});
		it('should return the edited planned volumes across multiple weeks',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", plannedVolumeKey:"1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53, changed: true},
			   {market: "USA", channelName: "Commercial", channelKey: "3", plannedVolumeKey:"3", week: new Date(2017, 06, 10), month: new Date(2017,06), volume: 52, changed: true},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", plannedVolumeKey:"4", week: new Date(2017, 06, 17), month: new Date(2017,06), volume: 150, changed: true}
			];
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 3),
				opPlanVolume: 305,
				spcpsKey : "1",
				spcpsOriginalVolume : 305
			},{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 10),
				opPlanVolume: 150,
				spcpsKey : "2",
				spcpsOriginalVolume : 150
			},{
				month: new Date(2017, 6),
				week: new Date(2017, 6, 17),
				opPlanVolume: 250,
				spcpsKey : "3",
				spcpsOriginalVolume : 250
			}];
			plannedVolumesController.weeks = [{month : new Date(2017, 06), weekKey:"20170703", week: new Date(2017,06,03)},
			                                  {month : new Date(2017, 06), weekKey:"20170710", week: new Date(2017,06,10)},
			                                  {month : new Date(2017, 06), weekKey:"20170717", week: new Date(2017,06,17)}]
			var expected = [{
				key: "1", 
				value: 53,
				spcpsKey: "1",
				spcpsOrigValue: 305,
				channelKey: "1",
				weekKey: "20170703"
			},{
				key: "3", 
				value: 52,
				spcpsKey: "2",
				spcpsOrigValue: 150,
				channelKey: "3",
				weekKey: "20170710"
			},{
				key: "4", 
				value: 150,
				spcpsKey: "3",
				spcpsOrigValue: 250,
				channelKey: "4",
				weekKey: "20170717"
			}];
			expect(plannedVolumesController.captureEditedPlannedVolumes()).toEqual(expected);
		});
	});
	describe('constructSavePlannedVolumes',function(){
		it('should return a single object containing edited planned volumes with model details',function(){
			spyOn(plannedVolumesController,'captureEditedPlannedVolumes').and.returnValue([]);
			plannedVolumesController.selectedModel = "2";
			plannedVolumesController.selectedModelYear = "2017";
			var expected = {
				modelKey: "2",
				modelYear: "2017",
				volumes : []
			};
			expect(plannedVolumesController.constructSavePlannedVolumes()).toEqual(expected);
		});
	});
	describe('savePlannedVolumes',function(){
		var deferred;
		beforeEach(function(){
			deferred = $q.defer();
			spyOn(plannedVolumesService,'savePlannedVolumes').and.returnValue(deferred.promise);
		});
		it('should send the SAVE object of plannedVolumes to the service',function(){
			plannedVolumesController.savePlannedVolumes();
			expect(plannedVolumesService.savePlannedVolumes).toHaveBeenCalled();
		});
	});
	describe('getMarketSumCountsForWeek',function(){
		it('should return the sum of scheduled counts for the given week and market',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53, counts:10},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type :"Total", month: new Date(2017,06), volume: 100, counts:10},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50, counts:10},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 52, counts:10},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150, counts:10}
			];
			var expected = 30;
			var week = new Date(2017,06,03);
			var market = "USA";
			expect(plannedVolumesController.getMarketSumCountsForWeek(market, week)).toEqual(expected);
		});
	});
	describe('getMarketCountsForTotalcolumn',function(){
		it('should return the sum of scheduled counts for the given market and month',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53, counts:10},
			   {market: "USA", channelName: "Fleet", channelKey: "1", type: "Total", month: new Date(2017,06), volume: 100, counts:10},
			   {market: "USA", channelName: "Retail", channelKey: "2", type: "Total", month: new Date(2017,06), volume: 50, counts:10},
			   {market: "USA", channelName: "Commercial", channelKey: "3", type: "Total", month: new Date(2017,06), volume: 52, counts:10},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,07), volume: 150, counts:10}
			];
			var market = "USA";
			var month = new Date(2017,06);
			var type = "Total";
			var expected = 30;
			expect(plannedVolumesController.getMarketCountsForTotalcolumn(market, month, type)).toEqual(expected);
		});
	});
	describe('getWeekLevelScheduledCounts',function(){
		it('should return the sum of scheduled counts for the given week',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53, counts:10},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50, counts:10},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 52, counts:10},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 150, counts:10}
			];
			var week = new Date(2017,06,03);
			var expected = 40;
			expect(plannedVolumesController.getWeekLevelScheduledCounts(week)).toEqual(expected);
		});
	});
	describe('getMonthLevelScheduledCounts',function(){
		it('should return the sum of scheduled counts for the given month',function(){
			plannedVolumesController.channelVolumes = [
			   {market: "USA", channelName: "Fleet", channelKey: "1", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 53, counts:10},
			   {market: "USA", channelName: "Retail", channelKey: "2", week: new Date(2017, 06, 03), month: new Date(2017,06), volume: 50, counts:10},
			   {market: "USA", channelName: "Commercial", channelKey: "3", week: new Date(2017, 06, 10), month: new Date(2017,06), volume: 52, counts:10},
			   {market: "Canada", channelName: "Fleet", channelKey: "4", week: new Date(2017, 06, 17), month: new Date(2017,06), volume: 150, counts:10}
			];
			var month = new Date(2017,06);
			var expected = 40;
			expect(plannedVolumesController.getMonthLevelScheduledCounts(month)).toEqual(expected);
		});
	});
	describe('applyPreferencePattern',function(){
		it('should display save button after retrieving the planned volumes with preference patterns applied on it',function(){
			var  deferApplyPatterns = $q.defer();
			var deferAlert = $q.defer();
			spyOn(plannedVolumesService,'openModal').and.returnValue(deferAlert.promise);
			spyOn(plannedVolumesService,'getAppliedPatternsOnPlannedVolumes').and.returnValue( deferApplyPatterns.promise);
			spyOn(plannedVolumesController, 'getPlantNames');
			spyOn(plannedVolumesController,'getPlantVolumes');
			plannedVolumesController.applyPreferencePatterns();
			deferAlert.resolve("Ok");
			deferApplyPatterns.resolve({ operatingPlan: [], marketVolumes: [] });
			scope.$apply();
			expect(plannedVolumesController.buttonName).toEqual('save');
		});
	});
	describe('parseDate',function(){
		it('should split the given date into yyyymm in string format',function(){
			var month = new Date(2017,05);
			var expected = "201706";
			expect(plannedVolumesController.parseDate(month)).toEqual(expected);
		});
	});
	describe('getDateRangePickerObject',function(){
		it('should return a date range picker object for the given list of months',function(){
			var months = [{key:"201707"},{key:"201708"}];
			var expected = {
					startDate: new Date(2017,06),
					endDate: new Date(2017,07),
					minDate: new Date(2017,06),
					maxDate: new Date(2017,07)
			}
			var output = plannedVolumesController.getDateRangePickerObject(months);
			expect(output.startDate.getTime()).toEqual(expected.startDate.getTime());
			expect(output.endDate.getTime()).toEqual(expected.endDate.getTime());
			expect(output.minDate.getTime()).toEqual(expected.minDate.getTime());
			expect(output.maxDate.getTime()).toEqual(expected.maxDate.getTime());
		});
	});
	describe('canPatternsBeApplied',function(){
		it('should return true if spcps key is present for the weeks in horizon',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 100,
				spcpsKey: "10",
				spcpsOriginalVolume : 150
			},
			{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 10),
				opPlanKey: "2",
				opPlanVolume: 150,
				spcpsKey: "",
				spcpsOriginalVolume : 250
			}];
			expect(plannedVolumesController.canPatternsBeApplied()).toBe(true);
		});
		it('should return false if spcps key is empty for all the weeks of operating plan',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 100,
				spcpsKey: "",
				spcpsOriginalVolume : 150
			},
			{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 10),
				opPlanKey: "2",
				opPlanVolume: 150,
				spcpsKey: "",
				spcpsOriginalVolume : 250
			}];
			expect(plannedVolumesController.canPatternsBeApplied()).toBe(false);
		});
	});
	describe('isOperatingPlanExists',function(){
		it('should return true if operating plan exists for any one week',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 100,
				spcpsKey: "",
				spcpsOriginalVolume : 150
			}];
			expect(plannedVolumesController.isOperatingPlanExists()).toBe(true);
		});
		it('should return false if operating plan does not exist for any of the weeks',function(){
			plannedVolumesController.operatingPlan = [{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 03),
				opPlanKey: "1",
				opPlanVolume: 0,
				spcpsKey: "",
				spcpsOriginalVolume : 150
			},
			{
				month: new Date(2017, 06),
				week: new Date(2017, 06, 10),
				opPlanKey: "2",
				opPlanVolume: 0,
				spcpsKey: "",
				spcpsOriginalVolume : 250
			}];
			expect(plannedVolumesController.isOperatingPlanExists()).toBe(false);
		});
	});
});