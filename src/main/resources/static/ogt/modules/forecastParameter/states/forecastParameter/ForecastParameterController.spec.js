'use strict';

describe('ForecastParameterController',function(){
	var  forecastParameterService,
		 forecastParameterController,
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
		module('ForecastParameterModule');
		inject(function($injector){
			$q = $injector.get('$q');
			deferred = $q.defer();
			var userService = $injector.get('UserService');
			forecastParameterService = $injector.get('ForecastParameterService');
			var $controller = $injector.get('$controller');
			var $rootScope = $injector.get('$rootScope');
			scope = $rootScope.$new();
			spyOn(userService,'getUserInformation').and.returnValue($q.defer().promise);
			forecastParameterController = $controller('ForecastParameterController',{$scope:scope});
			spyOn(forecastParameterService,'getModelYears').and.returnValue(deferred.promise);
			
		})
		
	})
	
	describe('LoadDropDownValues',function(){
		it('should call the ForecastParameterService for getting dropdowns',function(){
			forecastParameterController.getDropdownValues();
			expect(forecastParameterService.getModelYears).toHaveBeenCalled();
		});
		
		it('should set modelYears from ForecastParameterService',function(){
			forecastParameterController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(forecastParameterController.modelYears).toEqual([10,20]);
		});
		
		it('should stop loading indicator',function(){
			forecastParameterController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(scope.isLoadingIndicator).toBe(false);
		});
		
		it('should set the dataReceivedFromOgm to true',function(){
			forecastParameterController.getDropdownValues();
			deferred.resolve({"modelYears":[10,20]});
			scope.$apply();
			expect(scope.isDataReceivedFromOgm).toBe(true);
		});
	});
	
	describe('loadButtons',function(){
		it('should display save button ',function(){
			forecastParameterController.loadButtons();
			expect(forecastParameterController.buttonName).toEqual('save');
		});
	});
	
	describe('updateModifiedForecastParameters',function(){
		beforeEach(function(){
			var forecast = {
				  "modelKey":"319",
				  "monthsSpan":[ 
				         {  
				            "monthKey":"201805",
				            "monthName":"May-2018",
				            "lockedIn":true
				         }
				      ],
				      "lockedInMonths":[  
				         "201805"
				      ],
				};
			forecastParameterController.updateModifiedForecastParameters(forecast);
		})
		it('should push forecast object into modifiedForecastParameters array',function(){
			var expected = [{
				  "modelKey":"319",
				  "monthsSpan":[ 
				         {  
				            "monthKey":"201805",
				            "monthName":"May-2018",
				            "lockedIn":true
				         }
				      ],
				      "lockedInMonths":[  
				         "201805"
				      ],
				}];
			expect(forecastParameterController.modifiedForecastParameters).toEqual(expected);
		});
	});
	
	describe('loadParameters',function(){
		beforeEach(function(){
			spyOn(forecastParameterService,'getParameters').and.returnValue(deferred.promise);
			forecastParameterController.loadParameters();
		})
		it('should hide buttons and table',function(){
			expect(scope.isLoadingIndicator).toBe(true);
			expect(forecastParameterController.displayTable).toBe(false);
			expect(forecastParameterService.getParameters).toHaveBeenCalled();
		});
		it('forecastParameterService call should happen',function(){
			expect(forecastParameterService.getParameters).toHaveBeenCalled();
		});
	});
	
	describe('cancel',function(){
		it('should display only model year dropdown',function(){
			forecastParameterController.cancel();
			expect(forecastParameterController.displayTable).toBe(false);
			expect(forecastParameterController.showSaveCancel).toBe(false);
		});
		
		it('should empty modifiedForecastParameters',function(){
			var expected = [];
			forecastParameterController.cancel();
			expect(forecastParameterController.modifiedForecastParameters).toEqual(expected);
			expect(forecastParameterController.forecastParameters).toEqual(expected);
			expect(forecastParameterController.forecastSettings).toEqual(expected);
			expect(forecastParameterController.months).toEqual(expected);
			expect(forecastParameterController.modelsForecast).toEqual(expected);
		});
	});
	
})