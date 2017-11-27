'use strict';

angular.module('ForecastvsMPWModule')
		.controller('ForecastvsMPWController',['$scope','ForecastvsMPWService','WcDateRangePickerPrototype','TableToExcel','$timeout',
		                                       'VolumesDropdownService',ForecastvsMPWController]);

function  ForecastvsMPWController($scope,ForecastvsMPWService,WcDateRangePickerPrototype,TableToExcel,$timeout,VolumesDropdownService) {
	var vm = this;
	vm.marketGroup = ForecastvsMPWService.selectedMarketGroup;
	vm.modelYears = [];
	vm.models = [];
	vm.modelYearData;
	vm.selectedModelYear = VolumesDropdownService.selectedModelYear;;
	vm.selectedModel;
	vm.startMonthRange = {};
	vm.endMonthRange = {};
	vm.selectedStartMonth;
	vm.selectedFamilies;
	vm.families;
	vm.buttonName;
	vm.months;
	vm.weeks;
	vm.familiesAndFeatures;
	vm.transformedWeeks;
	vm.volumes;
	vm.mpwVolumes;
	vm.getSelectedFamiliesAndFeatures;
	vm.quarterWiseVolumesCache = {};
	vm.featureWiseMPWVolumesCache = {};
	vm.weekWiseForecastVolumesCache = {};
	vm.currentFamilyName = [];
	vm.displayTable = false;
	
	vm.removeDuplicates = removeDuplicates;
	vm.getModelYears = getModelYears;
	vm.getModels = getModels;
	vm.getStartMonth = getStartMonth;
	vm.getEndMonth = getEndMonth;
	vm.getDateRangePickerObject = getDateRangePickerObject;
	vm.cancel = cancel;
	vm.onModelYearSelect = onModelYearSelect;
	vm.onModelSelect = onModelSelect;
	vm.filterByModelYearAndModel = filterByModelYearAndModel;
	vm.onStartMonthSelect = onStartMonthSelect;
	vm.onEndMonthSelect = onEndMonthSelect;
	vm.getFamilies = getFamilies;
	vm.filterByModel = filterByModel;
	vm.getForecastvsMPWData = getForecastvsMPWData;
	vm.getAllFamilyKeys = getAllFamilyKeys;
	vm.deriveRequestParameters = deriveRequestParameters;
	vm.getMonths = getMonths;
	vm.getWeeks = getWeeks;
	vm.getNumberOfWeeks = getNumberOfWeeks;
	vm.prependMPWVolumeToMonths = prependMPWVolumeToMonths;
	vm.getTypeOfMonthObj = getTypeOfMonthObj;
	vm.getNumberOfFeaturesForFamily = getNumberOfFeaturesForFamily;
	vm.getTransformedWeeks = getTransformedWeeks;
	vm.transformMPWVolumes = transformMPWVolumes;
	vm.transformVolumes = transformVolumes;
	vm.getQuarterWiseVolumes = getQuarterWiseVolumes;
	vm.getFeatureWiseMPWVolumes = getFeatureWiseMPWVolumes;
	vm.getWeekWiseForecastVolumes = getWeekWiseForecastVolumes;
	vm.getMPWVolume = getMPWVolume;
	vm.getCounts = getCounts;
	vm.isCountGreaterThanMPWVol = isCountGreaterThanMPWVol;
	vm.getSelectedFamiliesAndFeatures = getSelectedFamiliesAndFeatures;
	vm.getFeaturesRecords = getFeaturesRecords;
	vm.isMonthLockedIn = isMonthLockedIn;
	vm.getColourOfCell = getColourOfCell;
	vm.getColourOfFeature = getColourOfFeature;
	vm.getCountsSum = getCountsSum;
	vm.getMPWSum = getMPWSum;
	vm.calculateMix = calculateMix;
	var getModelName = getModelName;
	
	var YEAR_MONTH_FORMAT = "YYYYMM";
	var YEAR_MONTH_DATE_FORMAT = "YYYYMMDD";
	var forFeature = function(volumeObj){return function(featObj){return featObj.ftrCode === volumeObj.ftrCode};};
	var forWeek = function(weekObj){ return function(volumeObj){ return moment(volumeObj.week).isSame(weekObj.week,'day'); }; };
	var forFamily = function(familyObj){ return function(volumeObj){ return volumeObj.famCode === familyObj.famCode; }; };
	var sum = function(list) { return list.reduce(function(partialSum, item) { return partialSum + item.vol;}, 0);};
	var forQuarter = function(weekObj){ return function(volumeObj){ return volumeObj.quarter === weekObj.quarter;}; };
	var forFeatureInVolumes = function(familyObj){ return function(volumeObj){ return volumeObj.ftrCode === familyObj.ftrCode; }; };

	init();
	function init(){
		$scope.isLoadingIndicator = true;
		ForecastvsMPWService.getModels().then(function(modelYearData){
			vm.modelYearData = modelYearData.modelYears;
			vm.modelYears = vm.getModelYears(modelYearData.modelYears);
			if(vm.selectedModelYear !== '' && vm.selectedModelYear !== undefined){
				vm.onModelYearSelect();
				vm.selectedModel = getModelName(VolumesDropdownService.selectedModel);
				vm.onModelSelect();
			}
			vm.displayTable = false;
			vm.enableCancelButton = false;
			$scope.isLoadingIndicator = false;
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	function getModelName(modelKey){
		return vm.modelYearObject.filter(function(modelObj){
			return modelObj.key === modelKey;
		})[0].name;
	}
	
	function cancel(){
		vm.displayTable = false;
		vm.buttonName = 'retrieve';
		vm.enableCancelButton = false;
	}
	
	function onModelYearSelect() {
		vm.models = [];
		vm.families = [];
		vm.selectedModel = '';
		vm.displayTable = false;
		vm.enableCancelButton = false;
		vm.buttonName = '';
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.models = vm.selectedModelYear ? vm.getModels(vm.modelYearData,vm.selectedModelYear) : '';
		vm.modelYearObject = vm.selectedModelYear ? getModelObjects(vm.modelYearData,vm.selectedModelYear) : '';
	}
	
	function onModelSelect() {
		vm.selectedModelObject = vm.filterByModel(vm.modelYearObject, vm.selectedModel);
		vm.startMonth = getStartMonth(vm.selectedModelObject);
		vm.endMonth = getEndMonth(vm.selectedModelObject);
		vm.startMonthRange = getDateRangePickerObject(vm.startMonth,vm.endMonth);
		vm.endMonthRange = getDateRangePickerObject(vm.startMonth,vm.endMonth);
		vm.selectedFamilies = ['ALL'];
		vm.families = getFamilies(vm.selectedModelObject);
		vm.buttonName = 'retrieve';
		vm.displayTable = false;
		vm.enableCancelButton = false;
	}
	
	function onStartMonthSelect() {
		vm.endMonthRange = getDateRangePickerObject(vm.startMonthRange.startDate,vm.endMonth);
		vm.displayTable = false;
		vm.enableCancelButton = false;
		vm.buttonName = 'retrieve';
	}
	
	function onEndMonthSelect() {
		vm.displayTable = false;
		vm.enableCancelButton = false;
		vm.buttonName = 'retrieve';
	}
	
	function getFamilies(input){
		return input.families;
	}
	
	function removeDuplicates(findFunction, list) {
		return list.reduce(function(partialResult, item) {
			if (!partialResult.find(findFunction(item))) {
				partialResult.push(item);
			}
			return partialResult;
		}, []);
	}
	
	function getModelYears(modelYears) {
		var modelYears = modelYears.map(function(modelYearObj){
			return modelYearObj.modelYear;
		});
		return modelYears;
	}
	
	function getModelObjects(modelYears,selectedYear){
		var modelYear = modelYears.filter(function(modelYearObj){
			return modelYearObj.modelYear == selectedYear;
		});
		return modelYear[0].models;
	}
	
	function getModels(modelYears,selectedYear) {
		return getModelObjects(modelYears, selectedYear).map(function(item){
			return item.name;
		});
	};
	
	function filterByModelYearAndModel(input, selectedYear, selectedModel) {
		return input.filter(function(item) {
			return item.marketingModelYear === selectedYear && item.catExtension === selectedModel;
		});
	}
	
	function filterByModel(input, selectedModel){
		return input.filter(function(item){
			return item.name === selectedModel;
		})[0];
	}
	
	function getStartMonth(input) {
		return moment(input.horizonStartMonth,YEAR_MONTH_FORMAT).toDate();
	}
	
	function getEndMonth(input) {
		return moment(input.horizonEndMonth,YEAR_MONTH_FORMAT).toDate();
	}
	
	function getDateRangePickerObject(startMonth, endMonth){
		return new WcDateRangePickerPrototype({
				startDate : startMonth,
				endDate : endMonth,
				minDate : startMonth,
				maxDate : endMonth
		});
	}

	function getForecastvsMPWData(){
		$scope.isLoadingIndicator = true;
		var reqObj = vm.deriveRequestParameters();
		ForecastvsMPWService.getForecastMPWdata(reqObj).then(function(result){
			var startTime = new Date();
			vm.months = vm.prependMPWVolumeToMonths(vm.getMonths(result.weeks));
			vm.weeks = vm.getWeeks(result.weeks);
			vm.transformedWeeks = vm.getTransformedWeeks();
			vm.familiesAndFeatures = result.families;
			vm.selectedFamiliesAndFeatures = vm.getFeaturesRecords(getSelectedFamiliesAndFeatures());
			vm.volumes = vm.transformVolumes(result.volumes);
			vm.mpwVolumes = vm.transformMPWVolumes(result.mpwVolumes);
			vm.currentFamilyName = [];
			vm.displayTable = true;
			vm.buttonName = '';
			vm.enableCancelButton = true;
			$scope.isLoadingIndicator = false;
			console.log('Processing Time: ' + (new Date() - startTime));
			setTimeout(function(){
				console.log('Total Time: ' + (new Date() - startTime));
			},0);
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	function getFeaturesRecords(featureRecords){
		vm.currentFamilyName = [];
		var lastIndex = featureRecords.length-1;
		vm.currentFamilyName.push(featureRecords[0].famName);
		var feat = featureRecords.map(function(featObj,index){
			var list = [];
			if(vm.isNextFamily(featObj.famName))
				list = list.concat({
					type : 'Total',
					famCode : featureRecords[index-1].famCode,
					famName : featureRecords[index-1].famName});
			list = list.concat(featObj);
			return list;
		});
		feat.push([{
			type : 'Total',
			famCode : featureRecords[lastIndex].famCode,
			famName : featureRecords[lastIndex].famName
		}]);
		return feat.reduce(function(flatList,featObj){
			return flatList.concat(featObj);
		},[]).map(function(featureObj){
			var transformedFeature = Object.assign({}, featureObj);
			transformedFeature.displayFamilyName = featureObj.famName + " - " + featureObj.famCode;
			return transformedFeature;
		});
	}
	
	vm.isNextFamily = function(familyName){
		if(vm.currentFamilyName.indexOf(familyName) === -1){
			vm.currentFamilyName.push(familyName);
			return true;
		}
		return false;
	}
	
	function getSelectedFamiliesAndFeatures(){
		if(vm.selectedFamilies.indexOf("ALL") !== -1){
			var families = vm.familiesAndFeatures;
			vm.returnFamilies = families.sort(function(a,b){
				return sortByName(a, b);
			});
			return vm.returnFamilies;
		}
		return vm.familiesAndFeatures.filter(function(featObj){
			return vm.selectedFamilies.indexOf(featObj.famCode) !== -1;
		}).sort(function(a,b){
			return sortByName(a, b);
		});
	}
	
	function sortByName(a,b){
		var fam1 = a.famCode.toUpperCase();
		var fam2 = b.famCode.toUpperCase();
		if(fam1 < fam2)
			return -1;
		else if(fam1 > fam2)
			return 1;
		return 0;
	} 
	
	function getAllFamilyKeys(){
		return vm.families.map(function(familyObj){
			return familyObj.key;
		});
	}
	
	function deriveRequestParameters(){
		var selectedModelObj = vm.modelYearObject.filter(function(modelObj){
			return modelObj.name === vm.selectedModel;
		})[0];
		return {
			modelYear : vm.selectedModelYear,
			modelKey : selectedModelObj.key,
			startMonth : moment(vm.startMonthRange.startDate).format(YEAR_MONTH_FORMAT),
			endMonth : moment(vm.endMonthRange.endDate).format(YEAR_MONTH_FORMAT),
			families : vm.getAllFamilyKeys()
		};
	}
	
	function getMonths(weeks){
		var months = weeks.map(function(weekObj){
			return weekObj.month;
		});
		var uniqueMonths = months.reduce(function(uniqueList,month){
			if(uniqueList.indexOf(month) === -1)
				uniqueList = uniqueList.concat(month);
			return uniqueList;
		},[]);
		return uniqueMonths.map(function(month){
			return moment(month,YEAR_MONTH_FORMAT);
		});
	}
	
	function getWeeks(weeks){
		return weeks.map(function(weekObj){
			return {
				week : moment(weekObj.week,YEAR_MONTH_DATE_FORMAT),
				month : moment(weekObj.month,YEAR_MONTH_FORMAT)
			};
		});
	}
	
	function getNumberOfWeeks(month){
		return vm.weeks.filter(function(weekObj){
			return moment(weekObj.month).isSame(month, 'month');
		}).length;
	}
	
	function prependMPWVolumeToMonths(months){
		 return months.reduce(function(list,month){
			var quarter = month.year().toString() + month.quarter();
			if(list.indexOf(quarter) == -1)
				list = list.concat(quarter);
			list = list.concat(month);
			return list;
		},[]).map(function(monthObj){
			return typeof monthObj === 'string' ? 'MPW Volume' : monthObj; 
		});
	}
	
	function getTypeOfMonthObj(month){
		return typeof month === 'object' ? true : false;
	}
	
	function getNumberOfFeaturesForFamily(familyObj){
		return vm.familiesAndFeatures.filter(function(family){
			return family.famCode === familyObj.famCode;
		}).length;
	}
	
	function getTransformedWeeks(){
		var hasQuarter = function(list,quarter){
			return list.find(function(obj){
				return obj.quarter === quarter;
			});
		}
		return vm.weeks.reduce(function(list,weekObj){
			var quarter = weekObj.month.year().toString() + weekObj.month.quarter();
			if(!hasQuarter(list, quarter))
				list = list.concat({type:'MPW',quarter:quarter});
			list = list.concat({week:weekObj.week,month:weekObj.month,type:'Counts'});
			list = list.concat({week:weekObj.week,month:weekObj.month,type:'Mix'});
			return list;
		},[]);
	}
	
	function transformMPWVolumes(mpwVolumes){
		return mpwVolumes.map(function(volumeObj){
			var quarterStartMonth = moment(volumeObj.month,YEAR_MONTH_FORMAT);
			return {
				famCode : vm.selectedFamiliesAndFeatures.filter(forFeature(volumeObj))[0].famCode,
				ftrCode : volumeObj.ftrCode,
				quarter : quarterStartMonth.year().toString() + quarterStartMonth.quarter(),
				vol : parseInt(volumeObj.vol || 0)
			};
		});
	}
	
	function transformVolumes(volumes){
		return volumes.map(function(volumeObj){
			var transformedVolume = Object.assign({},volumeObj);
			transformedVolume.famCode = vm.selectedFamiliesAndFeatures.filter(forFeature(volumeObj))[0].famCode,
			transformedVolume.week = moment(volumeObj.week,YEAR_MONTH_DATE_FORMAT);
			transformedVolume.vol = parseInt(volumeObj.vol || 0);
			transformedVolume.mix = +parseFloat(volumeObj.mix || 0).toFixed(2);
			return transformedVolume;
		});
	}
	
	function getQuarterWiseVolumes(weekObj){
		var quarterWiseVolumes;
		var cacheKey = "" + weekObj.quarter;
		if(cacheKey in vm.quarterWiseVolumesCache)
			quarterWiseVolumes = vm.quarterWiseVolumesCache[cacheKey];
		else{
			quarterWiseVolumes = vm.mpwVolumes.filter(forQuarter(weekObj));
			vm.quarterWiseVolumesCache[cacheKey] = quarterWiseVolumes;
		}
		return quarterWiseVolumes;
	}
	
	function getFeatureWiseMPWVolumes(familyObj){
		var featureWiseVolumes;
		var cacheKey = "" + familyObj.ftrCode;
		if(cacheKey in vm.featureWiseMPWVolumesCache)
			featureWiseVolumes = vm.featureWiseMPWVolumesCache[cacheKey];
		else{
			featureWiseVolumes = vm.mpwVolumes.filter(forFeatureInVolumes(familyObj));
			vm.featureWiseMPWVolumesCache[cacheKey] = featureWiseVolumes;
		}
		return featureWiseVolumes;
	}
	
	function getWeekWiseForecastVolumes(weekObj){
		var weekWiseVolumes;
		var cacheKey = "" + weekObj.week;
		if(cacheKey in vm.weekWiseForecastVolumesCache)
			weekWiseVolumes = vm.weekWiseForecastVolumesCache[cacheKey];
		else{
			weekWiseVolumes = vm.volumes.filter(forWeek(weekObj));
			vm.weekWiseForecastVolumesCache[cacheKey] = weekWiseVolumes;
		}
		return weekWiseVolumes;
	}
	
	function getMPWVolume(familyObj,weekObj){
		return vm.getFeatureWiseMPWVolumes(familyObj).filter(forQuarter(weekObj))[0];
	}
	
	function getCounts(familyObj,weekObj){
		return vm.getWeekWiseForecastVolumes(weekObj).filter(forFeatureInVolumes(familyObj))[0];
	}
	
	function getCountsSum(familyObj,weekObj){
		return sum(vm.getWeekWiseForecastVolumes(weekObj).filter(forFamily(familyObj)));
	}
	
	function getMPWSum(familyObj,weekObj){
		return sum(vm.mpwVolumes.filter(forQuarter(weekObj)).filter(forFamily(familyObj)));
	}
	
	function calculateMix(familyObj,weekObj){
		var totalVol = vm.getCountsSum(familyObj,weekObj);
		var individualFeatureVol = vm.getCounts(familyObj,weekObj).vol;
		return totalVol === 0 ? 0 : +(Math.floor(100*(individualFeatureVol * 100 / totalVol))/100).toFixed(2);
	}
	
	function isCountGreaterThanMPWVol(familyObj,weekObj){
		var countObj = vm.getCounts(familyObj,weekObj);
		var quarter = weekObj.month.year().toString() + weekObj.month.quarter();
		var quarterObj = {type:"MPW",quarter:quarter};
		var mpwObj = vm.getMPWVolume(familyObj,quarterObj);
		if(countObj.vol > mpwObj.vol)
			return true;
		return false;
	}
	
	function isMonthLockedIn(month){
		return vm.selectedModelObject.lockedInMonths.indexOf(month.format(YEAR_MONTH_FORMAT)) != -1 ? true : false; 
	}
	
	function getColourOfCell(familyObj,weekObj){
		if(weekObj.type =='MPW')
			return 'orange';
		else if(weekObj.type == 'Counts' && !familyObj.type)
			return vm.isCountGreaterThanMPWVol(familyObj,weekObj) ? 'highlightedRed' : 'numberFont';
		return 'numberFont';
	}
	
	function getColourOfFeature(familyObj){
		if(familyObj.type)
			return 'orange';
		var mpwSum = vm.mpwVolumes.filter(function(volObj){
			return volObj.ftrCode === familyObj.ftrCode;
		}).reduce(function(sum,volObj){
			return sum+volObj.vol;
		},0);
		var forecastSum = vm.volumes.filter(function(volObj){
			return volObj.ftrCode === familyObj.ftrCode;
		}).reduce(function(sum,volObj){
			return sum+volObj.vol;
		},0);
		return mpwSum === 0 ? 'mpwZeroForAllQuarters' : forecastSum === 0 ? 'forecastZeroForAllQuarters' : 'grey';
	}
	
	vm.getColspanForMonths = function(month){
		if(getTypeOfMonthObj(month))
			return 2*getNumberOfWeeks(month);
		return 1;
	}
	
	vm.getRowspanForMonths = function(month){
		if(!getTypeOfMonthObj(month))
			return 3;
		return 1;
	}
	
	vm.getQuarterStyle = function(month){
        var quarter = month.quarter();
        if(quarter=== 1 || quarter === 3)
               return 'seaGreen';
        return 'seaBlue';
    }
	
	vm.exportToExcel=function(tableId){
        var exportHref=TableToExcel.exportToExcel(tableId,'ForecastVsMpw');
        $timeout(function(){location.href=exportHref;},100); // trigger download
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
             }, 10)
		}
	});
}
