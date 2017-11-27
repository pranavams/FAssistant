'use strict';

angular.module('PreferencePatternModule').controller('PreferencePatternController',['$scope','PreferencePatternService','WcDateRangePickerPrototype',
               'ChannelPrototype','ChannelCellPrototype','OperatingPlanPrototype',
               'PlantPrototype','PlantCellPrototype','MonthPrototype','PreferencePatternPrototype','UserService','PreferencesWrapper','ChannelWrapper','$filter',
               'VolumesDropdownService',
               	function($scope,PreferencePatternService, WcDateRangePickerPrototype, ChannelPrototype, ChannelCellPrototype, OperatingPlanPrototype, PlantPrototype,
               	PlantCellPrototype, MonthPrototype, PreferencePatternPrototype, UserService, PreferencesWrapper, ChannelWrapper, $filter,
               	VolumesDropdownService) {

	var vm = this;
	vm.models = [];
	vm.modelYears = [];
	vm.startMonths =[];
	vm.endMonths =[];
	vm.selectedStartMonth = '';
	vm.selectedEndMonth = '';
	vm.selectedModel = '';
	vm.selectedModelYear = VolumesDropdownService.selectedModelYear;
	vm.patterns = [];
	vm.months = [];
	vm.operatingPlan =[];
	vm.plants = [];
	vm.errorStack = [];
	vm.isDisplayPattern = false;
	vm.enableCancelButton = false;
	vm.buttonName = '';
	vm.loggedInUserId = '';
	vm.isCrewNonCrew = '';
	vm.marketRowspan = 1;
	$scope.isDataReceivedFromOgm = false;
	$scope.isLoadingIndicator = true;
	var tempMktIndex = -1;
	var totalMonths = [];
	var weekIndexes = [];
	var channelIndexes = [];
	var startMonthIndex = -1;
	var colspan = 0;
	var LOCKEDIN = ' - (Locked-in)';
	var CREW = 'CREW';
	var NONCREW = 'NONCREW';
	var preferencePatternProto = new PreferencePatternPrototype();
	var highlightRed = {
			"border" : "2px solid red",
			"color" : "red",
			"padding-right" : "10px",
			"text-align" : "right",
			"border-radius" : "5px"
	}
	var plantType = {
			INDIVIDUAL : 'individual',
			CREW : '-CREW',
			NONCREW : '-NONCREW',
			TOTAL : 'Total'
	}
	
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		vm.loggedInUserId = userObj.userId;
	}));
	
	vm.getDropdownValues = function(){
		PreferencePatternService.getModelMonths().then(function(result){
			vm.modelYears = result.modelYears;
			$scope.isDataReceivedFromOgm = true;
			$scope.isLoadingIndicator = false;
			if(vm.selectedModelYear !== '' && vm.selectedModelYear !== undefined){
				vm.loadModels();
				vm.selectedModel = VolumesDropdownService.selectedModel;
				vm.getStartMonthsHorizon();
			}
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	vm.loadModels = function(){
		vm.models = [];
		vm.startMonths =[];
		vm.endMonths =[];
		vm.selectedModel = '';
		vm.selectedStartMonth = '';
		vm.selectedEndMonth = '';
		vm.startMonthRange = {};
		vm.endMonthRange = {};
		vm.buttonName = '';
		$.each(vm.modelYears,function(index,modelYearObj){
			if(modelYearObj.modelYear === vm.selectedModelYear){
				$.each(modelYearObj.models,function(index,model){
					vm.models.push(model);
				});
			}
		});
		vm.enableCancelButton = false;
		vm.buttonName = '';
		vm.isDisplayPattern = false;
	}
	vm.getStartMonthsHorizon = function(){
		vm.loadStartMonths();
		vm.startMonthRange = getStartDateEndDate(vm.startMonths);
		vm.getEndMonthsHorizon();
	}
	function getStartDateEndDate(months){
		var startMonth = months[0];
		var endMonth = months[months.length-1];
		var startDate = new Date(startMonth.key.substring(0,4), parseInt(startMonth.key.substring(4,6))-1);
		var endDate = new Date(endMonth.key.substring(0,4),parseInt(endMonth.key.substring(4,6))-1);
		var monthRange = new WcDateRangePickerPrototype({
				startDate : startDate,
				endDate : endDate,
				minDate : startDate,
				maxDate : endDate
		});
		return monthRange;
	}
	vm.getEndMonthsHorizon = function(){
		vm.buttonName = 'retrieve';
		vm.loadEndMonths();
		vm.endMonthRange = getStartDateEndDate(vm.endMonths);
	}
	vm.loadStartMonths = function(){
		vm.startMonths =[];
		vm.endMonths =[];
		vm.selectedStartMonth = '';
		vm.selectedEndMonth = '';
		totalMonths = [];
		$.each(vm.modelYears,function(index,modelYearObj){
			if(modelYearObj.modelYear === vm.selectedModelYear){
				$.each(modelYearObj.models,function(index,model){
					if(model.key === vm.selectedModel){
						$.each(model.months,function(index,month){
							totalMonths.push(month);
							vm.startMonths = angular.copy(totalMonths); //Doing a deep copy
						});
					}
				});
			}
		});
		vm.enableCancelButton = false;
		vm.isDisplayPattern = false;
		vm.endMonths =[];
		
	}
	
	vm.mergeStartDate = function(){
		var zero = 0;
		var startMonth = vm.startMonthRange.startDate.getMonth()+1;
		 if(startMonth<10){
		 	startMonth = zero.toString()+startMonth.toString();
		 }		 
		 var startMonthYear = vm.startMonthRange.startDate.getFullYear();
		 var startMonthKey = startMonthYear.toString()+startMonth.toString();
		vm.selectedStartMonth = startMonthKey;
	}
	
	function mergeEndDate(){
		var zero = 0;
		var endMonth = vm.endMonthRange.endDate.getMonth()+1;
		 if(endMonth<10){
			 endMonth = zero.toString()+endMonth.toString();
		 }		 
		 var endMonthYear = vm.endMonthRange.endDate.getFullYear();
		 var endMonthKey = endMonthYear.toString()+endMonth.toString();
		vm.selectedEndMonth = endMonthKey;
	}
	
	vm.loadEndMonths = function(){
		vm.mergeStartDate();
		startMonthIndex = -1;
		vm.endMonths =[];
		vm.selectedEndMonth = '';
		$.each(totalMonths,function(index,monthObj){
			if(monthObj.key === vm.selectedStartMonth){
				startMonthIndex = index;
			}
			if(startMonthIndex <= index && startMonthIndex != -1)
				vm.endMonths.push(monthObj);
		});
		vm.enableCancelButton = false;
		vm.isDisplayPattern = false;
	}
	
	vm.loadButtons = function(){
		vm.buttonName = 'retrieve';
		vm.isDisplayPattern = false;
	}
	
	vm.cancel = function(){
		vm.isDisplayPattern = false;
		vm.buttonName = 'retrieve';
		vm.enableCancelButton = false;
	}
	
	vm.loadPatterns = function() {
		$scope.isLoadingIndicator = true;
		mergeEndDate();
		setDropdownValuesInService();
		PreferencePatternService.getPatterns().then(function(result){
			$scope.isLoadingIndicator = false;
			resetArrays();
			vm.isCrewNonCrew = result.isCrewNonCrew;
			createOperatingPlanPrototype(result);
			createMonthPrototype();
			createPlantPrototype(result);
			createPlantCellPrototypeAcrossWeeksAndPlants(result);
			$.each(result.preferences,function(mktIndex,mktObj){
				$.each(mktObj.channels,function(channelIndex,channelObj){
					buildPatternPrototype(channelObj,mktObj,mktIndex,channelIndex);
				});
			});
			vm.marketRowspan = result.operatingPlan[0].plants.length + 3;
			vm.isDisplayPattern = true;
			vm.buttonName = 'edit';
			vm.enableCancelButton = true;
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	};
	
	function buildPatternPrototype(channelObj,mktObj,mktIndex,channelIndex){
		var channelProto = new ChannelPrototype();
		channelProto.market = mktObj.market;
		channelProto.channelWrapper.key = channelObj.key;
		channelProto.channelWrapper.name = channelObj.name;
		$.each(channelObj.allocationPercentage,function(allocationIndex,allocationObj){
			var cellProto = new ChannelCellPrototype();
			cellProto.uniqueChannelVolume.value = allocationObj.value;
			cellProto.rowIndex = channelIndex;
			cellProto.columnIndex = allocationIndex;
			cellProto.recollectVolume = allocationObj.value;
			cellProto.uniqueChannelVolume.weekKey = allocationObj.weekKey;
			cellProto.uniqueChannelVolume.weekName = allocationObj.weekName;
			cellProto.uniqueChannelVolume.key = allocationObj.key;
			if(isEndOfMonth(allocationObj.weekName)){
				cellProto.editable = false;
			}
			if(isOpPlanEmpty(allocationIndex)){
				cellProto.hasOpPlan = false;
			}
			if(vm.operatingPlan[allocationIndex].lockedInPeriod){
				cellProto.lockedInPeriod = true;
			}
			channelProto.channelWrapper.allocationPercentage.push(cellProto);
		});
		if(tempMktIndex !== mktIndex){ //To identify the changeover of market
			tempMktIndex = mktIndex;
			channelProto.marketFlag = true;
			channelProto.rowspan = mktObj.channels.length;
		}
		vm.patterns.push(channelProto);
	}
	
	function createOperatingPlanPrototype(result){
		$.each(result.operatingPlan,function(index,opPlanObj){
			var opPlanProto = new OperatingPlanPrototype();
			opPlanProto.opPlanWrapper.key = opPlanObj.key;
			opPlanProto.opPlanWrapper.weekKey = opPlanObj.weekKey;
			opPlanProto.opPlanWrapper.weekName = opPlanObj.weekName;
			opPlanProto.opPlanWrapper.value = opPlanObj.value;
			opPlanProto.recollectVolume = opPlanObj.value;
			opPlanProto.columnIndex = index;
			if(isEndOfMonth(opPlanObj.weekName)){
				opPlanProto.rowspan = 2;
				opPlanProto.endOfMonth = true;
			}
			vm.operatingPlan.push(opPlanProto);
		});
	}
	
	function createPlantPrototype(result){
		$.each(result.operatingPlan[0].plants, function(index,plantObj){
			var plantProto = new PlantPrototype();
			plantProto.name = plantObj.name;
			plantProto.subName = trimPlantNameForHeavyVL(plantObj.name);
			plantProto.rowIndex = index;
			plantProto.displayName = getPlantDisplayName(plantObj.name);
			if(identifyPlantType(plantObj.name) !== plantType.INDIVIDUAL)
				plantProto.editable = false;
			vm.plants.push(plantProto);
		});
	}
	
	function createPlantCellPrototypeAcrossWeeksAndPlants(result){
		$.each(result.operatingPlan, function(opPlanIndex,opPlanObj){
			$.each(opPlanObj.plants,function(plantIndex,plantObj){
				var plantCellProto = new PlantCellPrototype();
				plantCellProto.uniquePlantVolume.value = plantObj.value;
				plantCellProto.uniquePlantVolume.key = plantObj.key;
				plantCellProto.uniquePlantVolume.name = plantObj.name;
				plantCellProto.uniquePlantVolume.vehiclePlantKey = plantObj.vehiclePlantKey;
				plantCellProto.recollectVolume = plantObj.value;
				plantCellProto.weekName = opPlanObj.weekName;
				plantCellProto.plantType = identifyPlantType(plantObj.name);
				if(isEndOfMonth(opPlanObj.weekName) || (filterPlant(plantObj.name)[0].editable === false))
					plantCellProto.editable = false;
				vm.plants[plantIndex].volumeAcrossWeeks.push(plantCellProto);
			});
		});
	}
	
	function createMonthPrototype(){
		$.each(vm.operatingPlan,function(index,opPlanObj){
			colspan++;
			if(opPlanObj.endOfMonth){
				var monthProto = new MonthPrototype();
				monthProto.name = opPlanObj.opPlanWrapper.weekName;
				monthProto.colspan = colspan;
				monthProto.columnIndex = index;
				monthProto.weekIndexes = weekIndexes;
				colspan = 0;
				weekIndexes = [];
				vm.months.push(monthProto);
			}
			else
				weekIndexes.push(index);
		});
		assignLockInWeeks();
	}
	
	vm.calculateTotalChannelPercentForAMonth = function(rowIndex,columnIndex){
		var sum=0;
		$.each(vm.months,function(index,monthObj){
			if(columnIndex < monthObj.columnIndex){
				for(var i = 0; i < monthObj.weekIndexes.length; i++)
					sum = sum + parseInt(vm.patterns[rowIndex].channelWrapper.allocationPercentage[monthObj.weekIndexes[i]].uniqueChannelVolume.value || 0);
				vm.patterns[rowIndex].channelWrapper.allocationPercentage[monthObj.columnIndex].uniqueChannelVolume.value = sum;
				channelIndexes.indexOf(rowIndex) === -1 ? channelIndexes.push(rowIndex) : '';
				if(sum === 100 || sum === 0){
					vm.patterns[rowIndex].channelWrapper.allocationPercentage[monthObj.columnIndex].wrongAllocation = false;
				}
				else{
					vm.patterns[rowIndex].channelWrapper.allocationPercentage[monthObj.columnIndex].wrongAllocation = true;
				}
				return false;
			}
		});
	}
	
	var calculatePlantWiseTotal = function (rowIndex,columnIndex){
		function rowWiseTotal(rowIndex){
			var sum=0;
			$.each(vm.months,function(index,monthObj){
				if(columnIndex < monthObj.columnIndex){
					for(var i=0; i<monthObj.weekIndexes.length; i++){
						sum = sum + parseInt(vm.plants[rowIndex].volumeAcrossWeeks[monthObj.weekIndexes[i]].uniquePlantVolume.value || 0);
					}
					vm.plants[rowIndex].volumeAcrossWeeks[monthObj.columnIndex].uniquePlantVolume.value = sum;
					return false;
				}
			});
		}
		var calculateObj = {
			calculatePlantWeekTotal : function(){
				rowWiseTotal(rowIndex);
			},
			calculateOpPlanWeekTotal : function(){
				var sum = 0;
				$.each(vm.plants, function(plantIndex,plantObj){
					if(identifyPlantType(plantObj.name) === plantType.INDIVIDUAL)
						sum += parseInt(plantObj.volumeAcrossWeeks[columnIndex].uniquePlantVolume.value || 0);
					vm.operatingPlan[columnIndex].opPlanWrapper.value = sum.toString();
				});
			},
			calculateOpPlanMonthTotal : function(){
				var sum =0;
				$.each(vm.months,function(index,monthObj){
					if(columnIndex < monthObj.columnIndex){
						for(var i = 0; i < monthObj.weekIndexes.length; i++)
							if(vm.operatingPlan[monthObj.weekIndexes[i]].opPlanWrapper.value !== '')
								sum = sum + parseInt(vm.operatingPlan[monthObj.weekIndexes[i]].opPlanWrapper.value);
						vm.operatingPlan[monthObj.columnIndex].opPlanWrapper.value = sum;
						return false;
					}
				});
			},
			calculateWeekPlantTotalForHeavyVL : function(){
				var plants = filterPlant(vm.plants[rowIndex].subName);
				if(plants.length === 3){
					plants[2].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value = parseInt(plants[0].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value || 0) +
					parseInt(plants[1].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value || 0);
					rowWiseTotal(plants[2].rowIndex);
				}
				else{
					plants[1].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value = parseInt(plants[0].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value || 0);
					rowWiseTotal(plants[1].rowIndex);
				}
			},
			calculateWeekCrewNonCrewTotal : function(){
				if(vm.plants[rowIndex].name.includes(plantType.CREW)){
					var finalRowIndex = vm.plants.length - 2;
					var addedVolume = vm.plants[finalRowIndex].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value = 0;
					var crewPlants = filterPlant(plantType.CREW);
					$.each(crewPlants,function(index,plant){
						addedVolume += parseInt(plant.volumeAcrossWeeks[columnIndex].uniquePlantVolume.value || 0);
					});
					vm.plants[finalRowIndex].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value = addedVolume;
					rowWiseTotal(finalRowIndex);
				}
				else if(vm.plants[rowIndex].name.includes(plantType.NONCREW)){
					var finalRowIndex = vm.plants.length - 1;
					var addedVolume = vm.plants[finalRowIndex].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value = 0;
					var nonCrewPlants = filterPlant(plantType.NONCREW);
					$.each(nonCrewPlants,function(index,plant){
						addedVolume += parseInt(plant.volumeAcrossWeeks[columnIndex].uniquePlantVolume.value || 0);
					});
					vm.plants[finalRowIndex].volumeAcrossWeeks[columnIndex].uniquePlantVolume.value = addedVolume;
					rowWiseTotal(finalRowIndex);
				}
			},
			enableDisableChannelCellForEdit : function(){
				if(isOpPlanEmpty(columnIndex)){
					$.each(vm.patterns,function(rowIndex,channel){
						channel.channelWrapper.allocationPercentage[columnIndex].hasOpPlan = false;
						channel.channelWrapper.allocationPercentage[columnIndex].uniqueChannelVolume.value = '';
						vm.calculateTotalChannelPercentForAMonth(rowIndex,columnIndex);
					});
				}
				else{
					$.each(vm.patterns,function(index,channel){
						channel.channelWrapper.allocationPercentage[columnIndex].hasOpPlan = true;
					});
				}
			}
		}
		return calculateObj;
	}
	
	vm.calculateTotalPlantVolumeForAMonth = function(rowIndex,columnIndex){
		weekIndexes.indexOf(columnIndex) === -1 ? weekIndexes.push(columnIndex) : '';
		var calculateObj = calculatePlantWiseTotal(rowIndex,columnIndex);
		calculateObj.calculatePlantWeekTotal();
		calculateObj.calculateOpPlanWeekTotal();
		if(vm.isCrewNonCrew === 'Y'){
			calculateObj.calculateWeekPlantTotalForHeavyVL();
			calculateObj.calculateWeekCrewNonCrewTotal();
		}
		calculateObj.calculateOpPlanMonthTotal();
		calculateObj.enableDisableChannelCellForEdit();
	}
	
	
	vm.checkErrors = function(rowIndex,columnIndex,invalid){
		var index = vm.errorStack.indexOf(rowIndex+','+columnIndex);
		if(invalid){
			index == -1 ? vm.errorStack.push(rowIndex+','+columnIndex) : '';
			return highlightRed;
		}
		else{
			index !== -1 ? vm.errorStack.splice(index,1) : '';
		}
		return '';
	}
	
	function constructOpPlanArray(){
		var operatingPlan = [];
		$.each(weekIndexes,function(index,week){
			vm.operatingPlan[week].opPlanWrapper.plants = [];
			$.each(vm.plants,function(plantIndex,plant){
				if(isPlantVolumeChanged(plant,week)){
					vm.operatingPlan[week].opPlanWrapper.plants.push(plant.volumeAcrossWeeks[week].uniquePlantVolume);
				}
			});
			operatingPlan.push(vm.operatingPlan[week].opPlanWrapper);
		});

		$.each(vm.operatingPlan,function(index,opPlanObj){
			if(!checkInvalidOpPlanVolume(opPlanObj) && !opPlanObj.endOfMonth){
				var isPresent = $filter('filter')(operatingPlan, {key : opPlanObj.opPlanWrapper.key}, true)[0];
				if(!isPresent) {
					operatingPlan.push(opPlanObj.opPlanWrapper);
				}
			}
		});
		return operatingPlan;
	}
	
	function constructPreferencesArray(){
		var markets = [];
		var preferences = [];
		for(var i=0; i< channelIndexes.length; i++){
			var row = channelIndexes[i];
			var marketName = vm.patterns[row].market;
			var chWrapper = new ChannelWrapper();
			chWrapper.key = vm.patterns[row].channelWrapper.key;
			chWrapper.name = vm.patterns[row].channelWrapper.name;
			var allocationPercentage = [];
			$.each(vm.patterns[row].channelWrapper.allocationPercentage,function(cellIndex,channelCell){
				if(isPatternPercentChanged(channelCell))
					allocationPercentage.push(channelCell.uniqueChannelVolume);
			});
			if(allocationPercentage.length !== 0 ){
				chWrapper.allocationPercentage = allocationPercentage;
				if(markets.indexOf(marketName) === -1){
					var preferencesObj = new PreferencesWrapper();
					markets.push(marketName);
					preferencesObj.channels.push(chWrapper);
					preferencesObj.market = marketName;
					preferences.push(preferencesObj);
				}else{
						$.each(preferences,function(cellIndex,ppWrapper){
							ppWrapper.market === marketName ? ppWrapper.channels.push(chWrapper) : '';
						});
				}
			}
		}
		return preferences;
	}
	
	function constructSaveJSON(){
		preferencePatternProto.modelKey = vm.selectedModel;
		preferencePatternProto.modelYear = vm.selectedModelYear;
		preferencePatternProto.loggedInUser = vm.loggedInUserId;
		preferencePatternProto.isCrewNonCrew = vm.isCrewNonCrew;
		preferencePatternProto.operatingPlan = constructOpPlanArray();
		preferencePatternProto.preferences = constructPreferencesArray();
		console.log('SaveProto:'+ JSON.stringify(preferencePatternProto,null,4));
	}
	
	vm.savePatterns = function(){
		$scope.isLoadingIndicator = true;
		constructSaveJSON();
		PreferencePatternService.savePatterns(preferencePatternProto).then(function(response){
			$scope.isLoadingIndicator =false;
			vm.isDisplayPattern = false;
			setDropdownValuesOnSave();
		}, function(error) {
			$scope.isLoadingIndicator =false;
		});
	}
	
	function identifyPlantType(plantName){
		return plantName.startsWith(plantType.TOTAL) || plantName.endsWith(plantType.TOTAL) ? '' : plantType.INDIVIDUAL;
	}
	
	function trimPlantNameForHeavyVL(name){
		if(identifyPlantType(name) === plantType.INDIVIDUAL)
			return name.substring(0, name.indexOf('-'));
		return '';
	}
	
	function filterPlant(name){
		return vm.plants.filter(function(plant){
			return plant.name.includes(name);
		});
	}
	
	function isOpPlanEmpty(columnIndex){
		return (vm.operatingPlan[columnIndex].opPlanWrapper.value == 0 || vm.operatingPlan[columnIndex].opPlanWrapper.value == ''); 
	}
	
	function isEndOfMonth(name){
		return name.length>5 ;
	}
	
	function isPlantVolumeChanged(plant,week){
		return plant.editable && plant.volumeAcrossWeeks[week].uniquePlantVolume.value !== plant.volumeAcrossWeeks[week].recollectVolume;
	}
	
	function checkInvalidOpPlanVolume(opPlanObj){
		return opPlanObj.opPlanWrapper.key === '' &&  opPlanObj.opPlanWrapper.value === '';
	}
	
	function isPatternPercentChanged(channelCell){
		return channelCell.uniqueChannelVolume.value !== channelCell.recollectVolume && !isEndOfMonth(channelCell.uniqueChannelVolume.weekName);
	}
	
	function getPlantDisplayName(name){
		if(vm.isCrewNonCrew === 'Y'){
			if(name.endsWith(plantType.CREW))
				return CREW;
			else if(name.endsWith(plantType.NONCREW))
				return NONCREW;
		}
		return name;
	}
	
	function containsMonth(month,lockedInMonths){
		var lockedInMonths = lockedInMonths.filter(function(monthObj){
			return month.name.substring(0,3).toUpperCase() === monthObj.name.substring(0,3).toUpperCase(); 
		});
		return lockedInMonths.length > 0;
	}
	
	function getLockedWeeks(lockedInMonths,weeks){
		weeks = lockedInMonths.map(function(month){
			return month.weekIndexes;
		});
		weeks = weeks.reduce(function(cols,week){
			return cols.concat(week);
		},[]);
		return weeks;
	}
	
	function identifyLockInMonths(weeks){
		var lockedInMonths = vm.startMonths.filter(function(month){
			return (month.lockedIn === 'Y');
		});
		lockedInMonths = vm.months.filter(function(month){
			if(containsMonth(month,lockedInMonths)){
				month.name = month.name + LOCKEDIN;
				month.lockedInPeriod = true;
				return true;
			}
			else
				return false;
		});
		return getLockedWeeks(lockedInMonths,weeks);
	}
	function assignLockInWeeks(){
		var weeks = [];
		weeks = identifyLockInMonths(weeks);
		vm.operatingPlan.map(function(opPlan){
			if(weeks.indexOf(opPlan.columnIndex) !== -1)
				opPlan.lockedInPeriod = true;
		});
	}
	
	function setDropdownValuesOnSave(){
		vm.selectedModel = PreferencePatternService.selectedModel;
		vm.selectedModelYear = PreferencePatternService.selectedModelYear;s
		vm.selectedStartMonth = PreferencePatternService.selectedStartMonth;
		vm.selectedEndMonth = PreferencePatternService.selectedEndMonth;
		vm.models = PreferencePatternService.models ;
		vm.modelYears = PreferencePatternService.modelYears ;
		vm.startMonths = PreferencePatternService.startMonths ;
		vm.endMonths = PreferencePatternService.endMonths;
		vm.loadPatterns();
	}
	
	function setDropdownValuesInService(){
		PreferencePatternService.selectedModel = vm.selectedModel;
		PreferencePatternService.selectedModelYear = vm.selectedModelYear;
		PreferencePatternService.selectedStartMonth = vm.selectedStartMonth;
		PreferencePatternService.selectedEndMonth = vm.selectedEndMonth;
		PreferencePatternService.models = vm.models;
		PreferencePatternService.modelYears = vm.modelYears;
		PreferencePatternService.startMonths = vm.startMonths;
		PreferencePatternService.endMonths = vm.endMonths;
		PreferencePatternService.loggedInUserId = vm.loggedInUserId;
		VolumesDropdownService.selectedModel = vm.selectedModel;
		VolumesDropdownService.selectedModelYear = vm.selectedModelYear;
		VolumesDropdownService.selectedStartMonth = vm.selectedStartMonth;
		VolumesDropdownService.selectedEndMonth = vm.selectedEndMonth;
	}
	
	function resetArrays(){
		vm.enableCancelButton = false;
		vm.buttonName = '';
		tempMktIndex = -1;
		colspan = 0;
		vm.months = [];
		vm.operatingPlan =[];
		vm.patterns = [];
		vm.plants = [];
		channelIndexes = [];
		weekIndexes = [];
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
	
}]);
