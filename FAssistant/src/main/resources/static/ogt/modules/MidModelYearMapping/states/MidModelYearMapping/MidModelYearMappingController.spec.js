'use strict';

describe('MidModelYearMappingController',function(){
	 var ctrl,editCtrl,
	 MidModelYearMappingService,
	 ModelsFactory,
	 scope,state,
	 $q;
	
	beforeEach(function(){
		module('ui.router');
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
		});
		module('MidModelYearMappingModule');
		inject(function($injector){
			MidModelYearMappingService = $injector.get('MidModelYearMappingService');
			ModelsFactory = $injector.get('ModelsFactory');
			var $controller = $injector.get('$controller');
			var $rootscope = $injector.get('$rootScope');
			$q = $injector.get('$q');
			scope = $rootscope.$new();
			//state = $injector.get('$state');
			ctrl = $controller('MidModelYearMappingController',{$scope:scope});
			MidModelYearMappingService.familiesData = {families : [],unmappedFeatures: [],mappedFeatures:[]};
			editCtrl = $controller('MidModelYearMappingCreateEditController',{$scope:scope, $state:state});
		});
	});

	it('should define the parent controller and edit controller',function(){
		expect(ctrl).toBeDefined();
		expect(editCtrl).toBeDefined();
	});
	
	describe('getModels',function(){
		beforeEach(function(){
			spyOn(ModelsFactory,'getModels').and.returnValue([]);
			ctrl.getModels();
		});
		it('should set the models from returned from the getModels of ModelsFactory',function(){
			expect(ctrl.models).toEqual([]);
		});
		it('should set the ctrl models to service models',function(){
			expect(MidModelYearMappingService.models).toEqual(ctrl.models);
		});
		it('should set ModelYears, selectedModel, selectedModelYear to empty',function(){
			expect(ctrl.modelYears).toEqual([]);
			expect(ctrl.selectedModel).toEqual("");
			expect(ctrl.selectedModelYear).toEqual("");
		});
	});
	
	describe('getModelYears',function(){
		beforeEach(function(){
			spyOn(ModelsFactory,'getModelYears').and.returnValue([]);
			ctrl.getModelYears();
		});
		it('should set the models from returned from the getModels of ModelsFactory',function(){
			expect(ctrl.modelYears).toEqual([]);
		});
		it('should set the ctrl models to service models',function(){
			expect(MidModelYearMappingService.modelYears).toEqual(ctrl.modelYears);
		});
		it('should set ModelYears, selectedModel, selectedModelYear to empty',function(){
			expect(ctrl.selectedModelYear).toEqual("");
		});
	});
	
	describe('getTripletDetailsFromService',function(){
		it('should call getFamilyFetauresData in controller',function(){
			spyOn(ctrl,'getFamilyFetauresData');
			ctrl.getTripletDetailsFromService();
			expect(ctrl.getFamilyFetauresData).toHaveBeenCalled();
		});
		it('should set the dropdown data from service',function(){
			spyOn(ctrl,'getFamilyFetauresData');
			MidModelYearMappingService.markets = ["USA"];
			MidModelYearMappingService.models = [];
			MidModelYearMappingService.modelYears = [];
			MidModelYearMappingService.selectedMarket = "USA";
			MidModelYearMappingService.selectedModel = "Ecosport";
			MidModelYearMappingService.selectedModelYear = "2018";
			ctrl.getTripletDetailsFromService();
			expect(ctrl.markets).toEqual(MidModelYearMappingService.markets);
			expect(ctrl.models).toEqual(MidModelYearMappingService.models);
			expect(ctrl.modelYears).toEqual(MidModelYearMappingService.modelYears);
			expect(ctrl.selectedMarket).toEqual(MidModelYearMappingService.selectedMarket);
			expect(ctrl.selectedModel).toEqual(MidModelYearMappingService.selectedModel);
			expect(ctrl.selectedModelYear).toEqual(MidModelYearMappingService.selectedModelYear);
		});
	});
	
	describe('getFamilyFetauresData',function(){
		it('should call the service to get families and features data',function(){
			ctrl.selectedModelYear = "2018";
			var deferred = $q.defer();
			spyOn(MidModelYearMappingService,'getFamilyFetauresData').and.returnValue(deferred.promise);
			spyOn(ModelsFactory,'getBusinessKey');
			ctrl.getFamilyFetauresData();
			expect(MidModelYearMappingService.getFamilyFetauresData).toHaveBeenCalled();
		});
		it('should set loadingIndicator to false and displayTable to false on falsy ModelYear',function(){
			ctrl.selectedModelYear = "";
			ctrl.getFamilyFetauresData();
			expect(scope.isLoadingIndicator).toBe(false);
			expect(ctrl.isDisplayTable).toBe(false);
		});
	});
	
	describe('getMycoKeys',function(){
		it('should return the myco key for the given family key',function(){
			var familyKey = "1";
			ctrl.mappedFeaturesKeys = [{"familyKey" : "1" , "mycoKey" : "10"},{"familyKey" : "1" , "mycoKey" : "11"},{"familyKey" : "2" , "mycoKey" : "12"}];
			var expected = [{"familyKey" : "1" , "mycoKey" : "10"},{"familyKey" : "1" , "mycoKey" : "11"}];
			expect(ctrl.getMycoKeys(familyKey)).toEqual(expected);
		});
	});
	
	describe('getMappedFeaturesByMycoKey',function(){
		it('Should return the mapped features for the given myco key', function(){
			var mycoKey ="1";
			ctrl.mappedFeatures =[  
		         {  
		            "name":"ESPRESSO/COCOA(000SF)",
		            "code":"000SF",
		            "key":"165286",
		            "mycoKey":"1",
		            "ftrToprocess":"y"
		         },
		         {  
		            "name":"ESPRESSO/COCOA(000SF)",
		            "code":"000SF",
		            "key":"163653",
		            "mycoKey":"1",
		            "ftrToprocess":"y"
		         },
		         {  
		            "name":"HAZELNUT(000QX)",
		            "code":"000QX",
		            "key":"165331",
		            "mycoKey":"2689",
		            "ftrToprocess":"y"
		         },
		         {  
		            "name":"HAZELNUT(000QX)",
		            "code":"000QX",
		            "key":"163516",
		            "mycoKey":"2689",
		            "ftrToprocess":"y"
		         }
		      ];
			var expected =[  
					         {  
						            "name":"ESPRESSO/COCOA(000SF)",
						            "code":"000SF",
						            "key":"165286",
						            "mycoKey":"1",
						            "ftrToprocess":"y"
						         },
						         {  
						            "name":"ESPRESSO/COCOA(000SF)",
						            "code":"000SF",
						            "key":"163653",
						            "mycoKey":"1",
						            "ftrToprocess":"y"
						         }];
		expect(ctrl.getMappedFeaturesByMycoKey(mycoKey)).toEqual(expected);
		});
	});
		
		describe('transformMappedFeatures',function(){
			beforeEach(function(){
				ctrl.mappedFeatures =[  
					     		         {  
					     		            "name":"ESPRESSO/COCOA(000SF)",
					     		            "code":"000SF",
					     		            "key":"165286",
					     		            "mycoKey":"10",
					     		            "ftrToprocess":"y"
					     		         },{  
						     		            "name":"ENGINE",
						     		            "code":"000SF",
						     		            "key":"163653",
						     		            "mycoKey":"10",
						     		            "ftrToprocess":"y"
						     		         },
					     		        {  
						     		            "name":"ESPRESSO/COCOA(000SF)",
						     		            "code":"000SF",
						     		            "key":"165286",
						     		            "mycoKey":"100",
						     		            "ftrToprocess":"y"
						     		         },
						     		         {  
						     		            "name":"ENGINE",
						     		            "code":"000SF",
						     		            "key":"163653",
						     		            "mycoKey":"100",
						     		            "ftrToprocess":"y"
						     		         },
						     		        {  
							     		            "name":"ESPRESSO/COCOA(000SF)",
							     		            "code":"000SF",
							     		            "key":"165286",
							     		            "mycoKey":"200",
							     		            "ftrToprocess":"y"
							     		         },
							     		         {  
							     		            "name":"ENGINE",
							     		            "code":"000SF",
							     		            "key":"163653",
							     		            "mycoKey":"200",
							     		            "ftrToprocess":"y"
							     		         }
					     		      ];
				ctrl.mappedFeaturesKeys = [{"familyKey" : "1" , "mycoKey" : "10"},{"familyKey" : "2" , "mycoKey" : "100"},{"familyKey" : "2" , "mycoKey" : "200"}];
			});
			it('should return the mapped features for one familyKey one mycoKey',function(){
				var expected = [{
					"mycoKey" : "10",
					"ftr1Name": "ESPRESSO/COCOA(000SF)",
					"ftr1Code" : "000SF",
					"ftr1key":"165286",
 		            "ftr1ftrToprocess":"y",
 		           "ftr2Name": "ENGINE",
					"ftr2Code" : "000SF",
					"ftr2key":"163653",
		            "ftr2ftrToprocess":"y"
				}];
				var familyKey = "1";
				expect(ctrl.transformMappedFeatures(familyKey)).toEqual(expected);
			});
			it('should return the mapped features for one familyKey having two mycoKey',function(){
				var expected = [{
					"mycoKey" : "100",
					"ftr1Name": "ESPRESSO/COCOA(000SF)",
					"ftr1Code" : "000SF",
					"ftr1key":"165286",
 		            "ftr1ftrToprocess":"y",
 		           "ftr2Name": "ENGINE",
					"ftr2Code" : "000SF",
					"ftr2key":"163653",
		            "ftr2ftrToprocess":"y"
				},{
					"mycoKey" : "200",
					"ftr1Name": "ESPRESSO/COCOA(000SF)",
					"ftr1Code" : "000SF",
					"ftr1key":"165286",
 		            "ftr1ftrToprocess":"y",
 		           "ftr2Name": "ENGINE",
					"ftr2Code" : "000SF",
					"ftr2key":"163653",
		            "ftr2ftrToprocess":"y"
				}];
				var familyKey = "2";
				expect(ctrl.transformMappedFeatures(familyKey)).toEqual(expected);
		});
			describe('transformFamilies',function(){
				it('should return the mapped features of all families',function(){
					ctrl.families = [ {  
			            "name":"ALL INT TRIM COLORS-(000)",
			            "code":"0001",
			            "key":"1"
			         },
			         {  
			            "name":"ENGINE-(001)",
			            "code":"0002",
			            "key":"2"
			         }];
					var expected = [{
						familyName: "ALL INT TRIM COLORS-(000)",
			            familyCode:"0001",
			            familyKey:"1",
			            mappingCount:"1 mappings",
						mapping : [{
							"mycoKey" : "10",
							"ftr1Name": "ESPRESSO/COCOA(000SF)",
							"ftr1Code" : "000SF",
							"ftr1key":"165286",
		 		            "ftr1ftrToprocess":"y",
		 		           "ftr2Name": "ENGINE",
							"ftr2Code" : "000SF",
							"ftr2key":"163653",
				            "ftr2ftrToprocess":"y"
						}]
					},{
						familyName: "ENGINE-(001)",
			            familyCode:"0002",
			            familyKey:"2",
			            mappingCount:"2 mappings",
			            mapping : [{
			            "mycoKey" : "100",
						"ftr1Name": "ESPRESSO/COCOA(000SF)",
						"ftr1Code" : "000SF",
						"ftr1key":"165286",
	 		            "ftr1ftrToprocess":"y",
	 		           "ftr2Name": "ENGINE",
						"ftr2Code" : "000SF",
						"ftr2key":"163653",
			            "ftr2ftrToprocess":"y"
					},{
						"mycoKey" : "200",
						"ftr1Name": "ESPRESSO/COCOA(000SF)",
						"ftr1Code" : "000SF",
						"ftr1key":"165286",
	 		            "ftr1ftrToprocess":"y",
	 		           "ftr2Name": "ENGINE",
						"ftr2Code" : "000SF",
						"ftr2key":"163653",
			            "ftr2ftrToprocess":"y"
					}]
					}];
					expect(ctrl.transformFamilies().length).toEqual(expected.length);
					expect(ctrl.transformFamilies()).toEqual(expected);
				});
			});
	});
		
		describe('editMappings',function(){
			it('should call getSelectedTriplet of service with the necessary params',function(){
				var selectedFamilyObj = {familyKey : "10"};
				ctrl.selectedMarket = "USA";
				ctrl.selectedModel = "Ecosport";
				ctrl.selectedModelYear = "2018";
				ctrl.markets = ["USA","CAN"];
				ctrl.models = ["Ecosport","Edge"];
				ctrl.modelYears = ["2018","2017"];
				ctrl.familiesData = {};
				spyOn(MidModelYearMappingService,'getSelectedTriplet');
				MidModelYearMappingService.getSelectedTriplet("USA","Ecosport","2018",["USA","CAN"],["Ecosport","Edge"],["2018","2017"],
						selectedFamilyObj.familyKey,{});
				ctrl.editMappings(selectedFamilyObj);
				expect(MidModelYearMappingService.getSelectedTriplet).toHaveBeenCalledWith(ctrl.selectedMarket,ctrl.selectedModel,ctrl.selectedModelYear,
				ctrl.markets,ctrl.models,ctrl.modelYears,selectedFamilyObj.familyKey,ctrl.familiesData);
			});
		});
		
		describe('toggle',function(){
			beforeEach(function(){
				ctrl.transformedFamiliesToDisplay = [{
					familyName: "ALL INT TRIM COLORS-(000)",
		            familyCode:"0001",
		            familyKey:"1",
		            mappingCount:"1 mappings",
					mapping : [{a : 'a'}]
				}];
			});
			it('should add a property called open and set to true of the transformedFamiliesToDisplay',function(){
				var expected =  [{
					familyName: "ALL INT TRIM COLORS-(000)",
		            familyCode:"0001",
		            familyKey:"1",
		            mappingCount:"1 mappings",
					mapping : [{a : 'a'}],
					open :true}];
				scope.toggle(true)
				expect(ctrl.transformedFamiliesToDisplay).toEqual(expected);
			});
			it('should add a property called open and set to false of the transformedFamiliesToDisplay',function(){
				var expected =  [{
					familyName: "ALL INT TRIM COLORS-(000)",
		            familyCode:"0001",
		            familyKey:"1",
		            mappingCount:"1 mappings",
					mapping : [{a : 'a'}],
					open :false}];
				scope.toggle(false)
				expect(ctrl.transformedFamiliesToDisplay).toEqual(expected);
			});
		});
		xdescribe('setFamiliesDataFromParentScreen',function(){
			it('should set the families data from the MidModelYearMappingController',function(){
				var mapping = [{
		            "mycoKey" : "100",
					"ftr1Name": "ENGINE-IJK",
					"ftr1Code" : "EN-IJK",
					"ftr1key":"1236",
 		            "ftr1ftrToprocess":"y",
 		           "ftr2Name": "ENGINE-XYZ",
					"ftr2Code" : "EN-XYZ",
					"ftr2key":"1637",
		            "ftr2ftrToprocess":"y"
				}];
				var unmappedFeatures = [{  "name":"ENGINE-ABC","code":"EN-ABC","key":"1234","familyKey":"123","ftp":"y"},
				                        {  "name":"ENGINE-DEF","code":"EN-DEF","key":"1235","familyKey":"123","ftp":"y"}];
				MidModelYearMappingService.selectedMarket = "USA";
				MidModelYearMappingService.selectedModel = "C-MAX";
				MidModelYearMappingService.selectedModelYear = "2018";
				MidModelYearMappingService.familiesData = {families : [], mappedFeaturesKeys:[], mappedFeatures:[], unmappedFeatures:[]};
				MidModelYearMappingService.selectedFamilyObj = {
						familyName: "ENGINE",
			            familyCode: "EN-",
			            familyKey: "123",
			            mappingCount:1,
						mapping : mapping,
						unmappedFeatures : unmappedFeatures
				};
				editCtrl.setFamiliesDataFromParentScreen();
				expect(editCtrl.familiesData).toEqual(MidModelYearMappingService.familiesData);
				expect(editCtrl.selectedFamilyObj).toEqual(MidModelYearMappingService.selectedFamilyObj);
				expect(editCtrl.selectedMarket).toEqual(MidModelYearMappingService.selectedMarket);
				expect(editCtrl.selectedModel).toEqual(MidModelYearMappingService.selectedModel);
				expect(editCtrl.selectedModelYear).toEqual(MidModelYearMappingService.selectedModelYear);
				expect(editCtrl.families).toEqual(MidModelYearMappingService.familiesData.families);
				expect(editCtrl.selectedFamily).toEqual(MidModelYearMappingService.selectedFamilyObj.familyKey);
			});
		});
		xdescribe('getUnmappedFeatures',function(){
			it('should return the unmapped features for the selectedFamily',function(){
				editCtrl.selectedFamily = "123";
				editCtrl.features = [
					 					{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n"},
										{name:"ENGINE-DEF",code:"EN-DEF",key:"2",familyKey:"123",ftp:"n",mycoKey:"",mapped:"n"},
										{name:"ENGINE-IJK",code:"EN-IJK",key:"3",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y"},
										{name:"ENGINE-LMN",code:"EN-LMN",key:"4",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y"}];
				var expected = [{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n"},
								{name:"ENGINE-DEF",code:"EN-DEF",key:"2",familyKey:"123",ftp:"n",mycoKey:"",mapped:"n"}];
				expect(editCtrl.getUnmappedFeatures()).toEqual(expected);
			});
		});
		xdescribe('getUnmappedFtpFtrs',function(){
			it('should return the unmapped features which has FTP flag Y ',function(){
				editCtrl.selectedFamily = "123";
				editCtrl.features = [
				 					{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n"},
									{name:"ENGINE-DEF",code:"EN-DEF",key:"2",familyKey:"123",ftp:"n",mycoKey:"",mapped:"n"},
									{name:"ENGINE-IJK",code:"EN-IJK",key:"3",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y"},
									{name:"ENGINE-LMN",code:"EN-LMN",key:"4",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y"}];
				var expected = [{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n"}];
				expect(editCtrl.getUnmappedFtpFtrs()).toEqual(expected);
			});
		});
		xdescribe('getFeatures',function(){
			it('should return unique list of features',function(){
				editCtrl.selectedFamily = "123";
				editCtrl.familiesData = {
						mappedFeaturesKeys:[{familyKey:"123",mycoKey:"10"}],
						mappedFeatures:[{name:"ENGINE-IJK",code:"EN-IJK",key:"3",ftrToprocess:"y",mycoKey:"10"},
						                {name:"ENGINE-LMN",code:"EN-LMN",key:"4",ftrToprocess:"y",mycoKey:"10"}],
						unmappedFeatures: [{  "name":"ENGINE-ABC","code":"EN-ABC","key":"1","familyKey":"123","ftp":"y"},
				    				       {  "name":"ENGINE-DEF","code":"EN-DEF","key":"2","familyKey":"123","ftp":"y"}]
				};
				editCtrl.mappedFeatureKeys = [{familyKey:"123",mycoKey:"10",mappingKey:["3","4"]}];
				var expected = [
					{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n",mappingKey:[]},
					{name:"ENGINE-DEF",code:"EN-DEF",key:"2",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n",mappingKey:[]},
					{name:"ENGINE-IJK",code:"EN-IJK",key:"3",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]},
					{name:"ENGINE-LMN",code:"EN-LMN",key:"4",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]}];
				expect(editCtrl.getFeatures()).toEqual(expected);
			});
		});
		xdescribe('getFeaturesKeysByMycoKey',function(){
			it('should return the list of exactly two feature keys for the given mycoKey',function(){
				editCtrl.features = [
					 					{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n",mappingKey:[]},
										{name:"ENGINE-DEF",code:"EN-DEF",key:"2",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n",mappingKey:[]},
										{name:"ENGINE-IJK",code:"EN-IJK",key:"3",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]},
										{name:"ENGINE-LMN",code:"EN-LMN",key:"4",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]}];
				var expected = ["3","4"];
				expect(editCtrl.getFeaturesKeysByMycoKey("10")).toEqual(expected);
			});
		});
		
		xdescribe('getMappedFeatures',function(){
			it('should return the mapped features',function(){
				editCtrl.features = [
				 					{name:"ENGINE-ABC",code:"EN-ABC",key:"1",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n",mappingKey:[]},
									{name:"ENGINE-DEF",code:"EN-DEF",key:"2",familyKey:"123",ftp:"y",mycoKey:"",mapped:"n",mappingKey:[]},
									{name:"ENGINE-IJK",code:"EN-IJK",key:"3",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]},
									{name:"ENGINE-LMN",code:"EN-LMN",key:"4",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]}];
				var expected = [
				                [{name:"ENGINE-IJK",code:"EN-IJK",key:"3",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]},
								{name:"ENGINE-LMN",code:"EN-LMN",key:"4",familyKey:"123",ftp:"y",mycoKey:"10",mapped:"y",mappingKey:["3","4"]}]
				                ];
				expect(editCtrl.getMappedFeatures()).toEqual(expected);
			});
		});
});