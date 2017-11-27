"use strict";

describe('ModelsFactory',function(){
	var modelsFactory;
	beforeEach(function(){
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
			$provide.value('$state',{
			});
		});
		module('MidModelYearMappingModule');
		inject(function($injector){
			modelsFactory = $injector.get('ModelsFactory');
		});
	});
	it('should define the ModelsFactory',function(){
		expect(modelsFactory).toBeDefined();
	});
	describe('get Markets Models ModelYears',function(){
		var marketsList;
		beforeEach(function(){
			marketsList = [{
					"key": "CAN",
					"models": [{
						"key": "C-MAX","name": "C-MAX",
						"modelYears": [{"modelYear": "2017","businessKey": "140"},
						               {"modelYear": "2018","businessKey": "288"}]},
						{"key" : "Ecosport","name":"Ecosport",
						 "modelYears": [{"modelYear": "2017","businessKey": "140"},
						                {"modelYear": "2018","businessKey": "288"}]
						}]
			},{
						"key": "USA",
						"models": [{
							"key": "C-MAX",
							"name": "C-MAX"
						}]
				}];
		});
		it('should return all the markets',function(){
			var expected = marketsList;
			expect(modelsFactory.getMarkets(marketsList)).toEqual(expected);
		});
		it('should return all the models for the selected market',function(){
			var selectedMarket = "CAN";
			var expected = [{
				"key": "C-MAX","name": "C-MAX",
				"modelYears": [{"modelYear": "2017","businessKey": "140"},
				               {"modelYear": "2018","businessKey": "288"}]
			},{"key" : "Ecosport","name":"Ecosport",
				"modelYears": [{"modelYear": "2017","businessKey": "140"},
				                {"modelYear": "2018","businessKey": "288"}]}];
			expect(modelsFactory.getModels(marketsList,selectedMarket)).toEqual(expected);
			expect(modelsFactory.getModels([],"CAN")).toEqual([]);
			expect(modelsFactory.getModels([],"")).toEqual([]);
			expect(modelsFactory.getModels(marketsList,"")).toEqual([]);
		});
		it('should return all the modelYears for the selected model',function(){
			var modelsList = [{
				"key": "C-MAX","name": "C-MAX",
				"modelYears": [{"modelYear": "2017","businessKey": "140"},
				               {"modelYear": "2018","businessKey": "288"}]
			},{"key" : "Ecosport","name":"Ecosport",
				"modelYears": [{"modelYear": "2017","businessKey": "140"},
				                {"modelYear": "2018","businessKey": "288"}]}];
			var selectedModel = "C-MAX";
			var expected = [{"modelYear": "2017","businessKey": "140"},
				               {"modelYear": "2018","businessKey": "288"}];
			expect(modelsFactory.getModelYears(modelsList,selectedModel)).toEqual(expected);
			expect(modelsFactory.getModelYears([],"C-MAX")).toEqual([]);
			expect(modelsFactory.getModelYears([],"")).toEqual([]);
			expect(modelsFactory.getModelYears(modelsList,"")).toEqual([]);
		});
		it('should return the businessKey for the given modelYearList and selectedModelYear',function(){
			var modelYearList = [{"modelYear" : "2017","businessKey" : "1"},{"modelYear" : "2018","businessKey" : "2"}];
			var selectedModelYear = "2017";
			var expected = "1";
			expect(modelsFactory.getBusinessKey(modelYearList,selectedModelYear)).toEqual(expected);
			expect(modelsFactory.getBusinessKey(modelYearList)).toEqual("");
			expect(modelsFactory.getBusinessKey([],"")).toEqual("");
			expect(modelsFactory.getBusinessKey([],"2017")).toEqual("");
		});
	});
});