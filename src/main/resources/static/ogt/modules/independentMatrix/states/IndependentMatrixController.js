'use strict()';

angular.module('IndependentMatrixModule')
		.controller('IndependentMatrixController',['$scope','$timeout','IndependentMatrixService','WcDateRangePickerPrototype','VolumesDropdownService',IndependentMatrixController]);

function  IndependentMatrixController($scope,$timeout,IndependentMatrixService,WcDateRangePickerPrototype,VolumesDropdownService) {
	var vm = this;
	vm.dropdownValuesReceived = false;
	vm.modelYears =[];
	vm.models=[];
	vm.selectedModelYear = VolumesDropdownService.selectedModelYear;
	vm.selectedModel="";
	vm.selectedMarket="";
	vm.selectedChannel;
	vm.channels;
	vm.startMonthRange;
	vm.endMonthRange;
	vm.selectedFamilies;
	vm.families;
	vm.buttonName;
	vm.modelObj;
	vm.displayTable = false;
	vm.enableCancelButton = false;
		
	
	var removeDuplicates = function(findFunction, list) {
		return list.reduce(function(partialList, item) {
			if (findFunction(partialList, item)) {
				return partialList;
			} else {
				partialList.push(item);
				return partialList;
			}
		}, []);
	};
	var filterModelYear = function(){
		vm.my = vm.ogmDropDown.map(function(obj){
			return obj.marketingModelYear; 
		});
		return vm.my.reduce(function(list,modelyear){
			if(list.indexOf(modelyear) == -1) 
				list = list.concat(modelyear);
			return list;
		},[]);
	}

	var filterModel = function(){
		return vm.ogmDropDown.filter(function(obj){
			return obj.marketingModelYear === vm.selectedModelYear;
		}).map(function(modelObj){
			return modelObj.catExtension;
		}).reduce(function(list,model){
			if(list.indexOf(model) == -1)
				list = list.concat(model);
			return list;
		},[]);
	}
	
	var filterMarket = function(){
		return vm.ogmDropDown.filter(function(obj){
			return obj.marketingModelYear === vm.selectedModelYear && obj.catExtension === vm.selectedModel;
		}).map(function(modelObj){
			return modelObj.marketName;
		}).reduce(function(list,market){
			if(list.indexOf(market) == -1)
				list = list.concat(market);
			return list;
		},[]);
	}
	
	var filterChannel = function(){
		return vm.ogmDropDown.filter(function(obj){
			return obj.marketingModelYear === vm.selectedModelYear && obj.catExtension === vm.selectedModel
				&& obj.marketName === vm.selectedMarket;
		}).map(function(channelObj){
			return channelObj.channelName;
		}).reduce(function(list,channel){
			if(list.indexOf(channel) == -1)
				list = list.concat(channel);
			return list;
		},[]);
	}
	
	var filterForMonthHorizon = function(){
		return vm.ogmDropDown.filter(function(obj){
			return obj.marketingModelYear === vm.selectedModelYear && obj.catExtension === vm.selectedModel;
		})[0];
	}
	
	var filterFamilies = function(){
		var duplicateFamilies = vm.ogmDropDown.filter(function(obj){
			return obj.marketingModelYear === vm.selectedModelYear && obj.catExtension === vm.selectedModel
			&& obj.marketName === vm.selectedMarket;
		}).map(function(obj){
			return obj.families;
		}).reduce(function(flatList,list){
			return flatList.concat(list);
		},[]);
		
		var hasFamilyKey = function(familyList, familyObj){
			return familyList.find(function(item){
				return familyObj.key === item.key;
			});
		};
		return removeDuplicates(hasFamilyKey, duplicateFamilies);
	}

	vm.getModelName = function(modelKey){
		return vm.ogmDropDown.filter(function(modelObj){
			return modelObj.vehicleKey === modelKey;
		})[0].catExtension;
	}
	
	vm.getDropDownValues = function(){
		$scope.isLoadingIndicator = true;
		IndependentMatrixService.getModels().then(function(result){
			$scope.isLoadingIndicator = false;
			vm.dropdownValuesReceived = true;
			vm.ogmDropDown = result.modelYears;
			vm.modelYears = filterModelYear();
			if(vm.selectedModelYear !== '' && vm.selectedModelYear !== undefined){
				vm.triggerDropdownPopulation();
			}
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	vm.triggerDropdownPopulation = function(){
		vm.getModels();
		vm.selectedModel = vm.getModelName(VolumesDropdownService.selectedModel);
		vm.getMarkets();
		vm.selectedMarket = VolumesDropdownService.market;
		vm.getChannels();
		vm.selectedChannel = VolumesDropdownService.channel;
		vm.getStartMonth();
		vm.startMonthRange.startDate = VolumesDropdownService.startMonthDate;
		vm.getEndMonth();
		vm.endMonthRange.endDate = VolumesDropdownService.endMonthDate;
	}

	vm.getModels = function(){
		vm.models = [];
		vm.markets = [];
		vm.channels = [];
		vm.families = [];
		vm.selectedModel = '';
		vm.selectedMarket = '';
		vm.selectedChannel = '';
		vm.selectedStartMonth = '';
		vm.selectedEndMonth = '';
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.models = vm.selectedModelYear ? filterModel() : [];
		vm.buttonName = '';
		vm.enableCancelButton = false;
		vm.displayTable = false;
	}

	vm.getMarkets = function(){
		vm.markets = [];
		vm.channels = [];
		vm.families = [];
		vm.selectedMarket = '';
		vm.selectedChannel = '';
		vm.selectedStartMonth = '';
		vm.selectedEndMonth = '';
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.markets = vm.selectedModel ? filterMarket() : [];
		vm.buttonName = '';
		vm.enableCancelButton = false;
		vm.displayTable = false;
	}

	vm.getChannels  = function(){
		vm.channels = [];
		vm.families = [];
		vm.selectedChannel = '';
		vm.selectedStartMonth = '';
		vm.selectedEndMonth = '';
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.channels = vm.selectedMarket ? filterChannel() : [];
		vm.buttonName = '';
		vm.enableCancelButton = false;
		vm.displayTable = false;
	}
	
	vm.getMonthRangePickerObject = function(startDate,endDate){
		return new WcDateRangePickerPrototype({
			startDate : startDate,
			endDate : endDate,
			minDate : startDate,
			maxDate : endDate
		});
	}
	
	vm.emptyMonthsFamilies = function(){
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.families = [];
		vm.selectedFamilies = [];
		vm.buttonName = '';
		vm.enableCancelButton = false;
		vm.displayTable = false;
	}
	
	vm.getStartMonth = function(){
		console.log('getStartMonth Called:' + vm.selectedChannel);
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.families = [];
		var modelObj = filterForMonthHorizon();
		var startMonth = modelObj.horizonStartMonth;
		var endMonth = modelObj.horizonEndMonth;
		var startDate = new Date(startMonth.substring(0,4), parseInt(startMonth.substring(4,6))-1);
		var endDate = new Date(endMonth.substring(0,4),parseInt(endMonth.substring(4,6))-1);
		vm.startMonthRange = vm.getMonthRangePickerObject(startDate,endDate);
		if(VolumesDropdownService.selectedStartMonth)
			vm.startMonthRange.startDate = VolumesDropdownService.startMonthDate;
		vm.buttonName = '';
		vm.enableCancelButton = false;
		vm.displayTable = false;
		vm.getEndMonth();
	}
	
	vm.getEndMonth = function(){
		vm.endMonthRange = vm.getMonthRangePickerObject(vm.startMonthRange.startDate, vm.startMonthRange.endDate);
		if(VolumesDropdownService.selectedEndMonth)
			vm.endMonthRange.endDate = VolumesDropdownService.endMonthDate;
		vm.buttonName = '';
		vm.enableCancelButton = false;
		vm.displayTable = false;
		vm.getFamilies();
	}

	vm.getFamilies = function(){
		vm.families = [];
		vm.selectedFamilies = ['ALL'];
		if(vm.selectedModelYear && vm.selectedModel && vm.selectedMarket && vm.selectedChannel)
			vm.buttonName = 'retrieve';
		vm.families = filterFamilies();
	}
	
	vm.cancel = function(){
		vm.displayTable = false;
		vm.buttonName = 'retrieve';
		vm.enableCancelButton = false;
	}
	
	$scope.$watch('isLoadingIndicator',function(){
		if($scope.isLoadingIndicator){
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
             }, 10);
		}
	});

}