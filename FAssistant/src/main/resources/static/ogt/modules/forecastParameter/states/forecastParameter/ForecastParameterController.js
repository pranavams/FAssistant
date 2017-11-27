'use strict';

angular.module('ForecastParameterModule').controller('ForecastParameterController',['$scope','ForecastParameterService','UserService','$filter',
                                                                                    'ForecastParameterPrototype','WcDateRangePickerPrototype','$q','MarketGroupSelectModalService',
               	function($scope,ForecastParameterService, UserService, $filter,ForecastParameterPrototype,WcDateRangePickerPrototype,$q,MarketGroupSelectModalService) {

	var vm = this;
	vm.modelYears = [];
	vm.selectedModelYear = '';
	vm.selectedStartMonth = '';
	vm.selectedEndMonth = '';
	vm.dataTableMappings = [];
	vm.forecastToUpdate = [];
	vm.forecastSettings = [];
	vm.months = [];
	vm.modelsForecast = [];
	vm.checkBoxes = [];
	vm.selectedBusinessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.errorStack = [];
	vm.forecastParameters = [];
	vm.isDisplayPattern = false;
	vm.enableCancelButton = false;
	vm.buttonName = '';
	vm.loggedInUserId = '';
	vm.displayTable = false;
	vm.modifiedForecastParameters=[];
	vm.showSaveCancel =false;

	
	$scope.isDataReceivedFromOgm = false;
	$scope.isLoadingIndicator = true;
		
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		vm.loggedInUserId = userObj.userId;
	}));
	
	vm.getDropdownValues = function(){
		ForecastParameterService.getModelYears().then(function(result){
			console.log(result);
			$scope.isDataReceivedFromOgm = true;
			$scope.isLoadingIndicator = false;
			vm.modelYears = result.modelYears;
		},function(error){
			console.log(error);
			$scope.isLoadingIndicator = false;
		});
	}
	
	
	vm.loadButtons = function(){
		vm.buttonName = 'save';
		vm.enableCancelButton = true;
		vm.isDisplayPattern = false;
	}
	
	vm.cancel = function(){
		vm.isDisplayPattern = false;
		vm.buttonName = 'retrieve';
	}
	
	function assignLockedInPeriods(spanMonths, lockedInMonths){
		var spanMonths = spanMonths.map(function(month){
			if(lockedInMonths !== undefined && lockedInMonths !==null){
				if(lockedInMonths.indexOf(month.monthKey) !== -1)
					 month.lockedIn = true;
			}
			else
				 month.lockedIn = false;
			return month;
		});
		return spanMonths;
	}
	
	
	 function filterMonths(startMonth,endMonth,lockedInMonths){
		var copyMonths = vm.months.map(function(month){
			return angular.copy(month);
		}); 
		var spanMonths = copyMonths.filter(function(month){
			return (parseInt(month.monthKey) >= startMonth && parseInt(month.monthKey) <= endMonth);
		});
		spanMonths = assignLockedInPeriods(spanMonths,lockedInMonths);
		return spanMonths;
	}
	 
	 function calculateMonthKey(zero,startKey){
			 var startMonth = startKey.getMonth()+1;
			 if(startMonth<10){
			 	startMonth = zero.toString()+startMonth.toString();
			 }		 
			 var startMonthYear = startKey.getFullYear();
			 var startMonthKey = startMonthYear.toString()+startMonth.toString();
			return startMonthKey;
		}

	 vm.updateModifiedForecastParameters = function(forecast){
		 forecast.lockedInMonths = forecast.monthsSpan.filter(function(month){
			 return month.lockedIn === true;
		 }).map(function(month){
			 return month.monthKey;
		 });
		 var arrElement = $filter('filter')( vm.modifiedForecastParameters, { modelKey: forecast.modelKey  }, true)[0];
		 if(arrElement){
			 var index = vm.modifiedForecastParameters.indexOf(arrElement);
				 vm.modifiedForecastParameters[index] = forecast;
		 }
		 else{
			 vm.modifiedForecastParameters.push(forecast);
		 }
		 console.log( vm.modifiedForecastParameters.length);
	 }
	 vm.updateEndMonths = function(startMonthKey){
		 var arrElement = $filter('filter')( vm.months, { monthKey: startMonthKey  }, true)[0];
		 var startMonthIndex =  vm.months.indexOf(arrElement);
		 var endMonthIndex = startMonthIndex+11;
		 endMonthIndex = endMonthIndex < (vm.months.length-1) ?  endMonthIndex: (vm.months.length-1);
		 var endMonthElement =  vm.months[endMonthIndex];
		 var endMonths = vm.months.filter(function(month){
				return (parseInt(month.monthKey) >= parseInt(startMonthKey)  && parseInt(month.monthKey) <= parseInt(endMonthElement.monthKey));
			});
		 return endMonths;
	 }
	 vm.updateMonthSpan = function(rowIndex,startKey,endKey){
		 var zero = 0;
		 var startMonthKey = calculateMonthKey(zero,startKey);
		 var endMonthKey = calculateMonthKey(zero,endKey);
		 vm.forecastParameters[rowIndex].endMonths =  vm.updateEndMonths(startMonthKey);
		 var isEndMonthPresent = $filter('filter')( vm.forecastParameters[rowIndex].endMonths, { monthKey: endMonthKey  }, true)[0];
		 if(!isEndMonthPresent){
			 vm.forecastParameters[rowIndex].endMonthKey = vm.forecastParameters[rowIndex].endMonths[vm.forecastParameters[rowIndex].endMonths.length-1].monthKey;
			 endMonthKey =  vm.forecastParameters[rowIndex].endMonthKey;
		 }
		 vm.forecastParameters[rowIndex].monthsSpan = filterMonths(parseInt(startMonthKey),parseInt(endMonthKey),vm.forecastParameters[rowIndex].lockedInMonths);
		 vm.forecastParameters[rowIndex].monthRange = new WcDateRangePickerPrototype({ 
			    minDate: new Date(today.getFullYear(), today.getMonth(), 1), 
			    maxDate: new Date(today.getFullYear(), today.getMonth()+12, 1)
			});
		 
	 }
	function constructForecastParameterPrototype(){
		var today = new Date();
		$.each(vm.modelsForecast,function(index,modelForecastObj){
			var forecastProto = new ForecastParameterPrototype();
			forecastProto.modelKey = modelForecastObj.modelKey;
			forecastProto.modelName = modelForecastObj.modelName;
			forecastProto.startMonthKey = modelForecastObj.startMonthKey;
			forecastProto.forecastParametersKey = modelForecastObj.forecastParametersKey;
			forecastProto.startMonthDesc = new Date(modelForecastObj.startMonthKey.substring(0,4), parseInt(modelForecastObj.startMonthKey.substring(4,6))-1);
			forecastProto.endMonthKey = modelForecastObj.endMonthKey;
			forecastProto.endMonthDesc = new Date(modelForecastObj.endMonthKey.substring(0,4),parseInt(modelForecastObj.endMonthKey.substring(4,6))-1);
			forecastProto.lockedInMonths = modelForecastObj.lockedInMonths;
			forecastProto.monthsSpan = filterMonths(parseInt(modelForecastObj.startMonthKey),parseInt(modelForecastObj.endMonthKey),modelForecastObj.lockedInMonths);
			forecastProto.endMonths =  vm.updateEndMonths(modelForecastObj.startMonthKey);
			
			forecastProto.monthRange = new WcDateRangePickerPrototype({ 
                startDate: forecastProto.startMonthDesc, 
			    endDate: forecastProto.endMonthDesc, 
			    minDate: new Date(today.getFullYear(), today.getMonth(), 1), 
			    maxDate: new Date(today.getFullYear(), today.getMonth()+12, 1)
			});
			
			$scope.$watch(function(){
				return forecastProto.monthRange.endDate
			}, function(newValue){
				forecastProto.monthRange.maxStartDate = new Date(today.getFullYear(), today.getMonth()+14, 1);
			});
		
			$scope.$watch(function() {
				return forecastProto.monthRange.startDate;
			}, function() {
				var maxMonth = new Date(today.getFullYear(), today.getMonth()+14, 1);
				var startDate = new Date(forecastProto.monthRange.startDate.getFullYear(), forecastProto.monthRange.startDate.getMonth()+12, 1);
				if(startDate>=maxMonth) {
					forecastProto.monthRange.maxEndDate = new Date(today.getFullYear(), today.getMonth()+14, 1);
				} else {
					forecastProto.monthRange.maxEndDate = new Date(forecastProto.monthRange.startDate.getFullYear(), forecastProto.monthRange.startDate.getMonth()+11, 1);
				}
				if (forecastProto.monthRange.startDate > forecastProto.monthRange.endDate) {
					forecastProto.monthRange.endDate = forecastProto.monthRange.startDate;
				}
			});
			
			vm.forecastParameters.push(forecastProto);
		});
		console.log('vm.forecastParameters -- ' + JSON.stringify(vm.forecastParameters,null,4));
	}
	
	vm.loadParameters = function() {
		$scope.isLoadingIndicator = true;
		vm.displayTable = false;
		vm.forecastParameters = [];
		vm.setDropdownValuesInService();
		ForecastParameterService.getParameters().then(function(result){
			console.log('result -- ' + JSON.stringify(result,null,4));
			vm.forecastSettings = result;
			vm.months = result.months;
			vm.modelsForecast =  result.models;
			constructForecastParameterPrototype();
			vm.displayTable = true;
			vm.showSaveCancel = true;
			$scope.isLoadingIndicator = false;
			
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	};
	
	vm.setDropdownValuesInService = function(){
		ForecastParameterService.selectedModelYear = vm.selectedModelYear;
		ForecastParameterService.loggedInUserId = vm.loggedInUserId;
	}
	
	$scope.$watch('isLoadingIndicator',function(){
		if($scope.isLoadingIndicator == true){
			$("#loading-cover").show().animate({
                opacity: 1
            }, 300), $("#loading-indicator").show().animate({
                opacity: 1
            }, 300)
		}
		else{
			 $("#loading-indicator").hide().animate({
                 opacity: 0
             }, 10), $("#loading-cover").hide().animate({
                 opacity: 0
             }, 10)
		}
	});
	
	vm.save = function(){
		$scope.isLoadingIndicator = true;
		
		var saveModels = vm.forecastParameters.map(function(forecast){
			var zero = 0;
			var startMonthKey = calculateMonthKey(zero,forecast.monthRange.startDate);
			var endMonthKey = calculateMonthKey(zero,forecast.monthRange.endDate);
			var modelObj = {
					"modelKey": parseInt(forecast.modelKey),
					"modelName": forecast.modelName,
					"startMonthKey": parseInt(startMonthKey),
					"endMonthKey": parseInt(endMonthKey),
					"forecastParametersKey": parseInt(forecast.forecastParametersKey),
					"lockedInMonths": forecast.lockedInMonths
			};
			return modelObj;	
		});
		var saveForecastParameters = {
				"loggedInUser":  vm.loggedInUserId,
				"modelYear":  vm.forecastSettings.modelYear,
				"marketGroupKey": vm.forecastSettings.marketGroupKey,
				"months": [],
				"models": saveModels
		};
		console.log('saveForecastParameters -- ' + JSON.stringify(saveForecastParameters,null,4));


		ForecastParameterService.save(saveForecastParameters).then(function(response){
			$scope.isLoadingIndicator =false;
			vm.isDisplayPattern = false;
			vm.displayTable = false;
			vm.loadParameters();
		}, function(error) {
			$scope.isLoadingIndicator =false;
		});
	}
	vm.cancel = function(){
		vm.displayTable = false;
		vm.modifiedForecastParameters=[];
		vm.showSaveCancel =false;
		vm.forecastParameters = [];
		vm.forecastSettings = [];
		vm.months = [];
		vm.modelsForecast = [];
		vm.selectedModelYear = '';
	}

}]);
