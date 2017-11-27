'use strict';

angular.module('EntityMixModule')
		.controller('EntityMixController',['$scope','$timeout','EntityMixService','WcDateRangePickerPrototype','VolumesDropdownService',EntityMixController]);

function  EntityMixController($scope,$timeout,EntityMixService,WcDateRangePickerPrototype,VolumesDropdownService) {
	var vm = this;
	vm.dropdownValuesReceived = false;
	vm.modelYears;
	vm.models;
	vm.selectedModelYear = VolumesDropdownService.selectedModelYear;
	vm.selectedModel;
	vm.selectedMarket;
	vm.selectedChannel;
	vm.channels;
	vm.startMonthRange;
	vm.endMonthRange;
	vm.selectedFamilies;
	vm.families;
	vm.buttonName;
	vm.entities;
	vm.weeks;
	vm.volumes;
	vm.SPCPSVol;
	vm.months;
	vm.featureRecords;
	vm.modelObj;
	vm.displayTable = false;
	vm.monthlyView = false;
	vm.volumeView = "both";
	vm.enableCancelButton = false;
	vm.featuresExpanded = false;
	vm.uniqueModelObject;
	vm.PPVKey;
	vm.weekVolumesCache = {};
	vm.entityVolumesCache = {};
	
	var getDateFromWeek = function(dateObj){
		return	new Date(dateObj.substring(0,4),parseInt(dateObj.substring(4,6))-1, dateObj.substring(6));
	}
	var getMonthFromWeek = function(weekString){
		var weekDate = getDateFromWeek(weekString);
		return vm.weeks.filter(function(weekObj){
			return weekObj.type ? false : weekObj.week.getTime() === weekDate.getTime();
		})[0].month;
	}
	var forMonth = function(month) { return function(weekObj) { return weekObj.month.getTime() == month.getTime(); }};
	var forFullMonth = function(weekObj) { return function(volume) { return volume.month.getTime() == weekObj.month.getTime(); }};
	var forEntity = function(entity) { return function(volume) { return volume.entityKey == entity.key; }};
	var forWeek = function(weekObj) { return function(volume) { return volume.week.getTime() == weekObj.week.getTime(); }};
	var hasFeature = function(featureName, featureValue) { return function(volume) { 
		var entity = vm.entities.filter(function(entity) { return entity.key == volume.entityKey; })[0];
		return entity[featureName] === featureValue;
	}; };
	var sum = function(list) { return list.reduce(function(partialSum, item) { return partialSum + parseInt(item.volume || 0); }, 0); };
	var getEntityKeys = function(familyKey,feature){
		return vm.entities.filter(function(entity){
			return entity[familyKey] === feature;
		}).map(function(entity){
			return entity.key;
		});
	}
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
		}
		return removeDuplicates(hasFamilyKey, duplicateFamilies);
	}
	var parseDate = function(month){
		var mm = (month.getMonth() + 1).toString();
		mm = mm.length === 1 ? '0' + mm : mm;
		return month.getFullYear().toString() + mm;
	}
	
	function getModelName(modelKey){
		return vm.ogmDropDown.filter(function(modelObj){
			return modelObj.vehicleKey === modelKey;
		})[0].catExtension;
	}
	
	vm.getDropDownValues = function(){
		$scope.isLoadingIndicator = true;
		EntityMixService.getModels().then(function(result){
			$scope.isLoadingIndicator = false;
			vm.dropdownValuesReceived = true;
			vm.ogmDropDown = result.modelYears;
			vm.modelYears = filterModelYear();
			if(vm.selectedModelYear !== '' && vm.selectedModelYear !== undefined){
				vm.getModels();
				vm.selectedModel = getModelName(VolumesDropdownService.selectedModel);
				vm.getMarkets();
				vm.selectedMarket = VolumesDropdownService.market;
				vm.getChannels();
				vm.selectedChannel = VolumesDropdownService.channel;
				vm.getStartMonth();
				vm.startMonthRange.startDate = VolumesDropdownService.startMonthDate;
				vm.getEndMonth();
				vm.endMonthRange.endDate = VolumesDropdownService.endMonthDate;
			}
		},function(error){
			$scope.isLoadingIndicator = false;
		});
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
	
	vm.getStartMonth = function(){
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
		vm.PPVKey = vm.families[0].key;
	}
	
	vm.getRequestParameters = function(){
		vm.uniqueModelObject = vm.ogmDropDown.filter(function(obj){
			return obj.marketingModelYear === vm.selectedModelYear && obj.catExtension === vm.selectedModel
			&& obj.marketName === vm.selectedMarket && obj.channelName === vm.selectedChannel;
		})[0];
		return {
			modelKey : vm.uniqueModelObject.vehicleKey,
			modelYear : vm.selectedModelYear,
			channelKey : vm.uniqueModelObject.channelKey,
			startMonth : parseDate(vm.startMonthRange.startDate),
			endMonth : parseDate(vm.endMonthRange.endDate)
		};
	}
	
	vm.setEntityMixTableData = function(result){
		vm.weekVolumesCache = {};
		vm.entityVolumesCache = {};
		var startTime = new Date();
		vm.currentMonth = vm.startMonthRange.startDate;
		vm.entities = result.entities;
		vm.weeks = vm.getWeeks(result.weeks);
		vm.months = vm.getMonths(vm.weeks);
		vm.volumes = vm.getVolumes(result.volumes);
		vm.SPCPSVol = vm.transformSPCPSVolumes(result.spcps);
		vm.featureRecords = vm.getFamilyTableRecords();
		vm.displayTable = true;
		vm.buttonName = '';
		vm.enableCancelButton = true;
		console.log('Processing Time: ' + (new Date() - startTime));
		setTimeout(function(){
			console.log('Total Time: ' + (new Date() - startTime));
		},0);
	}
	
	vm.applyWeeklyVolumes = function(){
		EntityMixService.openModal().then(function(sucsess){
			$scope.isLoadingIndicator = true;
			EntityMixService.getAppliedWeeklyVolumes(vm.getRequestParameters()).then(function(result){
				$scope.isLoadingIndicator = false;
				vm.setEntityMixTableData(result);
			},function(error){
				$scope.isLoadingIndicator = false;
			});
		});
	}
	
	vm.setDropdownsInService = function(){
		VolumesDropdownService.modelName = vm.selectedModel;
		VolumesDropdownService.selectedModelYear = vm.selectedModelYear;
		VolumesDropdownService.startMonthDate = vm.startMonthRange.startDate;
		VolumesDropdownService.endMonthDate = vm.endMonthRange.endDate;
		VolumesDropdownService.market = vm.selectedMarket;
		VolumesDropdownService.channel = vm.selectedChannel;
		VolumesDropdownService.setDropdownValues(vm.modelObj.modelKey,vm.selectedModelYear, vm.modelObj.startMonth, vm.modelObj.endMonth);
	}
	
	vm.getEntityMixData = function(){
		$scope.isLoadingIndicator = true;
		vm.modelObj = vm.getRequestParameters();
		vm.setDropdownsInService();
		EntityMixService.getEntityMixData(vm.modelObj).then(function(result){
			$scope.isLoadingIndicator = false;
			vm.setEntityMixTableData(result);
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	vm.cancel = function(){
		vm.displayTable = false;
		vm.buttonName = 'retrieve';
		vm.enableCancelButton = false;
	}
	
	vm.isNextMonth = function(month){
		if(vm.currentMonth.getTime() !== month.getTime()){
			vm.previousMonth = vm.currentMonth;
			vm.currentMonth = month;
			return true;
		}
		return false;
	}

	vm.getWeeks = function(weeks){
		var transformedWeeks = weeks.map(function(weekObj){
			var month = new Date(weekObj.month.substring(0,4), parseInt(weekObj.month.substring(4))-1);
			var week = getDateFromWeek(weekObj.week);
			if(vm.isNextMonth(month))
				return [{
					type : 'Total',
					month : vm.previousMonth
				},{
					type : 'SPCPS',
					month : vm.previousMonth
				},{
					week: week,
					month: month
				}];
			return [{week: week, month: month}];
		});
		transformedWeeks.push({type: 'Total', month: vm.currentMonth},{type: 'SPCPS', month: vm.currentMonth});
		return transformedWeeks.reduce(function(flatList,weekList){
			return flatList.concat(weekList);
		},[]);
	}
	
	vm.getMonths = function(weekList) {
		var hasMonth = function(monthList, monthObj) {
			return monthList.find(function(item) { return monthObj.getTime() == item.getTime();});
		};
		return removeDuplicates(hasMonth, weekList.map(function(weekObj) { return weekObj.month; }));
	};

	vm.getNumWeeksForMonth = function(month) {
		return vm.weeks.filter(forMonth(month)).length;
	}
	
	vm.getVolumes = function(volumes){
		return volumes.map(function(volumeObj){
			var transformedVolume = Object.assign({}, volumeObj);
			transformedVolume.week = getDateFromWeek(volumeObj.week);
			transformedVolume.month = getMonthFromWeek(volumeObj.week);
			return transformedVolume;
		});
	}
	
	vm.transformSPCPSVolumes = function(volumes){
		return volumes.map(function(volumeObj){
			var transformedVolume = Object.assign({}, volumeObj);
			transformedVolume.month = new Date(volumeObj.month.substring(0,4),parseInt(volumeObj.month.substring(4,6))-1);
			transformedVolume.mix = +(Math.floor(100 * parseFloat(volumeObj.mix || 0)) / 100).toFixed(2);
			transformedVolume.vol = parseInt(volumeObj.vol || 0);
			return transformedVolume;
		});
	}

	vm.getWeekVolumes = function(weekObj) {
		var weekVolumes;
		var cacheKey = "" + weekObj.week;
		if (cacheKey in vm.weekVolumesCache) {
			weekVolumes = vm.weekVolumesCache[cacheKey];
		} else {
			weekVolumes = vm.volumes.filter(forWeek(weekObj));
			vm.weekVolumesCache[cacheKey] = weekVolumes;
		}
		return weekVolumes;
	};
	
	vm.getEntityVolumes = function(entity){
		var entityWiseVolumes;
		var cacheKey = "" + entity.key;
		if (cacheKey in vm.entityVolumesCache) {
			entityWiseVolumes = vm.entityVolumesCache[cacheKey];
		} else {
			entityWiseVolumes = vm.volumes.filter(forEntity(entity));
			vm.entityVolumesCache[cacheKey] = entityWiseVolumes;
		}
		return entityWiseVolumes;
	}
	
	vm.getVolumeForWeek = function(entity, weekObj) {
		return vm.getWeekVolumes(weekObj).filter(forEntity(entity))[0];
	};

	vm.getTotalVolumeForWeek = function(weekObj) {
		return sum(vm.getWeekVolumes(weekObj));
	};
	
	vm.getTotalVolumeForEntityAndMonth = function(entity,weekObj){
		return sum(vm.getEntityVolumes(entity).filter(forFullMonth(weekObj)));
	}
	
	vm.getSPCPSVolumeForEntityAndMonth = function(entity, weekObj){
		return vm.SPCPSVol.filter(function(volumeObj){
			return volumeObj.entityKey === entity.key;
		}).filter(function(volumeObj){
			return volumeObj.month.getTime() === weekObj.month.getTime();
		})[0];
	}
	
	vm.getTotalMixForEntityAndMonth = function(entity,weekObj){
		var totalVol = vm.getTotalVolumeForMonth(weekObj);
		var individualFeatureVol = vm.getTotalVolumeForEntityAndMonth(entity, weekObj);
		return totalVol === 0 ? 0 : +(Math.floor(100*(individualFeatureVol * 100 / totalVol))/100).toFixed(2);
	}
	
	vm.getTotalVolumeForMonth = function(weekObj){
		return sum(vm.volumes.filter(forFullMonth(weekObj)));
	}
	
	vm.getSPCPSVolumeForMonth = function(weekObj){
		return vm.SPCPSVol.filter(forFullMonth(weekObj)).reduce(function(sum,item){
			return sum + item.vol;
		},0);
	}
	
	vm.getTotalVolumeForFeatureAndMonth = function(familyKey,feature,weekObj){
		var entityKeys = getEntityKeys(familyKey,feature);
		return sum(vm.volumes.filter(forFullMonth(weekObj)).filter(function(volume){
			return entityKeys.indexOf(volume.entityKey) !== -1;
		}));
	}
	
	vm.getSPCPSVolumeForFeatureAndMonth = function(familyKey,feature,weekObj){
		var entityKeys = getEntityKeys(familyKey,feature);
		return vm.SPCPSVol.filter(forFullMonth(weekObj)).filter(function(volume){
			return entityKeys.indexOf(volume.entityKey) !== -1;
		}).reduce(function(sum,volumeObj){
			return sum+volumeObj.vol;
		},0);
	}
	
	vm.getTotalMixForFeatureAndMonth = function(familyKey,feature,weekObj){
		var totalVol = vm.getTotalVolumeForMonth(weekObj);
		var individualFeatureVol = vm.getTotalVolumeForFeatureAndMonth(familyKey,feature, weekObj);
		return totalVol === 0 ? 0 : +(Math.floor(100*(individualFeatureVol * 100 / totalVol))/100).toFixed(2);
	}
	
	vm.getSPCPSMixForFeatureAndMonth = function(familyKey,feature,weekObj){
		var totalVol = vm.getSPCPSVolumeForMonth(weekObj);
		var individualFeatureVol = vm.getSPCPSVolumeForFeatureAndMonth(familyKey,feature, weekObj);
		return totalVol === 0 ? 0 : +(Math.floor(100*(individualFeatureVol * 100 / totalVol))/100).toFixed(2);
	}
	
	vm.calculateMixPercentForWeek = function(weekObj) {
		var totalVolumeForWeek = vm.getTotalVolumeForWeek(weekObj);
		vm.getWeekVolumes(weekObj).map(function(volume) { 
			volume.mixPercent = volume.volume * 100 / totalVolumeForWeek; 
		});
	};	

	vm.getFeaturesForFamilyKey = function(family){
		var features =	vm.entities.reduce(function(featuresList,entity){
			return featuresList.concat(entity[family.key]);
		},[]);
		var uniqueFeatures = vm.removeDuplicateFeatures(features);
		return uniqueFeatures.map(function(featureCode){
			return {
				family : family.name,
				feature : featureCode,
				familyKey : family.key
			}
		});
	}
	
	vm.removeDuplicateFeatures = function(features){
		return features.reduce(function(list,feature){
			if(list.indexOf(feature) === -1)
				list = list.concat(feature);
			return list;
		},[]);
	}
	
	vm.getFeatureVolume = function(familyKey,feature,weekObj){
		var entityKeys = getEntityKeys(familyKey,feature);
		return sum(vm.getWeekVolumes(weekObj).filter(function(volume){
			return entityKeys.indexOf(volume.entityKey) !== -1;
		}));
	}
	
	vm.getFeatureMixes = function(familyKey,feature,weekObj){
		var totalVol = vm.getTotalVolumeForWeek(weekObj);
		var individualFeatureVol = vm.getFeatureVolume(familyKey, feature, weekObj);
		return totalVol === 0 ? 0 : +(Math.floor(100*(individualFeatureVol * 100 / totalVol))/100).toFixed(2);
	}
	
	function sortByName(a,b){
		var fam1 = a.code.toUpperCase();
		var fam2 = b.code.toUpperCase();
		if(fam1 < fam2)
			return -1;
		else if(fam1 > fam2)
			return 1;
		return 0;
	} 
	
	vm.getSelectedFamiliesArray = function(){
		if(vm.selectedFamilies.indexOf('ALL')!== -1){
			var families = vm.families.slice(1);
			vm.returnFamilies = families.sort(function(a,b){
				return sortByName(a,b);
			});
			return vm.returnFamilies;
		}
		var families = vm.families.filter(function(family){
			return (vm.selectedFamilies.indexOf(family.key)!== -1) && (family.name !== 'PPV') ;
		});
		return families.sort(function(a,b){
			return sortByName(a, b);
		});
	}
	
	vm.getFamilyTableRecords = function(){
		return vm.getSelectedFamiliesArray().map(function(family){
			var features = vm.getFeaturesForFamilyKey(family);
			features.push({
				type:'Total',
				family: family.name,
				familyKey: family.key
			});
			return features;
		}).reduce(function(flatList,family){
			return flatList.concat(family);
		},[]);
	}
	
	vm.isMonthLockedIn = function(month){
		return vm.uniqueModelObject.lockedinMonth.indexOf(parseDate(month)) !== -1 ? true : false;
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

