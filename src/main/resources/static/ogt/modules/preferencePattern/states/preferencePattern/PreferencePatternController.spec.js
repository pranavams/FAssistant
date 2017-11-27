'use strict';

describe('PreferencePatternController',function(){
	var  preferencePatternService,
		 preferencePatternController,
		 $q,
		 deferred,
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
		module('PreferencePatternModule');
		inject(function($injector){
			$q = $injector.get('$q');
			deferred = $q.defer();
			var userService = $injector.get('UserService');
			preferencePatternService = $injector.get('PreferencePatternService');
			var $controller = $injector.get('$controller');
			var $rootScope = $injector.get('$rootScope');
			scope = $rootScope.$new();
			spyOn(userService,'getUserInformation').and.returnValue($q.defer().promise);
			preferencePatternController = $controller('PreferencePatternController',{$scope:scope});
			spyOn(preferencePatternService,'getModelMonths').and.returnValue(deferred.promise);
		})
		
	})
	
	describe('LoadDropDownValues',function(){
		it('should call the PrefPatternService for getting dropdowns',function(){
			preferencePatternController.getDropdownValues();
			expect(preferencePatternService.getModelMonths).toHaveBeenCalled();
		});
		
		it('should set modelYears from PrefPatternservice',function(){
			preferencePatternController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(preferencePatternController.modelYears).toEqual([10,20]);
		});
		
		it('should stop loading indicator',function(){
			preferencePatternController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(scope.isLoadingIndicator).toBe(false);
		});
		
		it('should set the dataReceivedFromOgm to true',function(){
			preferencePatternController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(scope.isDataReceivedFromOgm).toBe(true);
		});
	});
	
	describe('LoadModels',function(){
		beforeEach(function(){
			preferencePatternController.modelYears = [{"modelYear": "2016","models" : ['MKZ','MKC']},
			                                          {"modelYear": "2017","models" : ['MKX','Edge']}];
			preferencePatternController.selectedModelYear = '2016';
			preferencePatternController.loadModels();
		})
		it('should load models',function(){
			expect(preferencePatternController.models).toEqual(['MKZ','MKC']);
		});
		it('should hide buttons and table',function(){
			expect(preferencePatternController.enableCancelButton).toBe(false);
			expect(preferencePatternController.isDisplayPattern).toBe(false);
			expect(preferencePatternController.buttonName).toEqual('');
		});
	});
	
	describe('LoadStartAndEndMonths',function(){
		beforeEach(function(){
			preferencePatternController.modelYears = [{
				"modelYear": "2016",
				"models" : [{"key":"2","name":"MKZ",
					"months":[{"key":"1","name":"01"},{"key":"2","name":"02"},{"key":"3","name":"03"}]},
					{"key":"4","name":"MKC",
					"months":[{"key":"4","name":"04"},{"key":"5","name":"05"},{"key":"6","name":"06"}]}]
			}]
			preferencePatternController.selectedModelYear = '2016';
			preferencePatternController.models = ['MKZ','MKC'];
			preferencePatternController.selectedModel = '2';
			preferencePatternController.loadStartMonths();
		});
		it('should load start months',function(){
			expect(preferencePatternController.startMonths).toEqual([{"key":"1","name":"01"},{"key":"2","name":"02"},{"key":"3","name":"03"}]);
		});
		it('should hide buttons and table',function(){
			expect(preferencePatternController.enableCancelButton).toBe(false);
			expect(preferencePatternController.isDisplayPattern).toBe(false);
			expect(preferencePatternController.buttonName).toEqual('');
		});
		it('should load end months',function(){
			spyOn(preferencePatternController,'mergeStartDate');
			preferencePatternController.selectedStartMonth = "2";
			preferencePatternController.loadEndMonths();
			expect(preferencePatternController.endMonths).toEqual([{"key":"2","name":"02"},{"key":"3","name":"03"}]);
		});
	});
})