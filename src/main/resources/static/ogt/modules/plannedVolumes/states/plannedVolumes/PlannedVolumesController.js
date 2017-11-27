'use strict';

angular.module('PlannedVolumesModule')
		.controller('PlannedVolumesController',['$scope','PlannedVolumesService','PreferencePatternService','WcDateRangePickerPrototype',
		                                        'WcAlertConsoleService','$translate','VolumesDropdownService',
		                                        PlannedVolumesController]);

function PlannedVolumesController($scope,PlannedVolumesService,PreferencePatternService,
		WcDateRangePickerPrototype,WcAlertConsoleService,$translate,VolumesDropdownService) {
	$scope.isLoadingIndicator = true;
	var vm=this;
	vm.totalMonths = [];
	var startMonthIndex = -1;
	vm.dropdownValuesReceived = false;
	vm.isDisplayPlannedVolumes = false;
	vm.enableCancelButton = false;
	vm.plantsExpanded = false;
	vm.showCounts = false;
	vm.monthlyView = false;
	vm.buttonName = '';
	vm.models = [];
	vm.modelYears = [];
	vm.startMonths =[];
	vm.endMonths =[];
	vm.selectedStartMonth = '';
	vm.selectedEndMonth = '';
	vm.selectedModel = '';
	vm.selectedModelYear = VolumesDropdownService.selectedModelYear;
	vm.months = [];
	vm.weeks = [];
	vm.operatingPlan = [];
	vm.channels = [];
	vm.channelVolumes = [];
	vm.errorStack = [];
	vm.lockedInMonthsObject = {};
	vm.showCounts = false;
	vm.isPlannedVolumesSaved = PlannedVolumesService.isPlannedVolumesSaved;
	var APPLY_PATTERN = 'Apply pattern';
	var DERIVE_ENTITY_VOLUME = 'Derive Entity Volume';
	
	vm.getDropdownValues = function(){
		PlannedVolumesService.getModelMonths().then(function(result){
			vm.modelYears = result.modelYears;
			vm.dropdownValuesReceived = true;
			$scope.isLoadingIndicator = false;
			if(vm.selectedModelYear !== '' && vm.selectedModelYear !== undefined){
				vm.models = filterModels();
				vm.selectedModel = VolumesDropdownService.selectedModel;
				vm.loadStartMonths();
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
		vm.models = filterModels();
		vm.enableCancelButton = false;
		vm.buttonName = '';
		vm.isDisplayPlannedVolumes = false;
	}
	
	vm.loadStartMonths = function(){
		vm.startMonths =[];
		vm.endMonths =[];
		vm.selectedStartMonth = '';
		vm.selectedEndMonth = '';
		vm.totalMonths = filterStartMonths();
		vm.startMonths = angular.copy(vm.totalMonths);
		vm.startMonthRange = vm.getDateRangePickerObject(vm.startMonths);
		vm.loadEndMonths();
		vm.enableCancelButton = false;
		vm.isDisplayPlannedVolumes = false;
	}
	
	vm.loadEndMonths = function(){
		vm.selectedStartMonth = vm.parseDate(vm.startMonthRange.startDate);
		startMonthIndex = -1;
		vm.endMonths =[];
		vm.selectedEndMonth = '';
		$.each(vm.totalMonths,function(index,monthObj){
			if(monthObj.key === vm.selectedStartMonth){
				startMonthIndex = index;
			}
			if(startMonthIndex <= index && startMonthIndex != -1)
				vm.endMonths.push(monthObj);
		});
		vm.endMonthRange = vm.getDateRangePickerObject(vm.endMonths);
		vm.enableCancelButton = false;
		vm.isDisplayPlannedVolumes = false;
		vm.loadButtons();
	}
	
	vm.loadButtons = function(){
		vm.buttonName = 'retrieve';
		vm.enableCancelButton = false;
		vm.isDisplayPlannedVolumes = false;
	}
	
	vm.cancel = function(){
		vm.isDisplayPlannedVolumes = false;
		vm.buttonName = 'retrieve';
		vm.enableCancelButton = false;
	}
	
	vm.loadPlannedVolumes = function(){
		vm.selectedEndMonth = vm.parseDate(vm.endMonthRange.endDate);
		$scope.isLoadingIndicator = true;
		VolumesDropdownService.setDropdownValues(vm.selectedModel,vm.selectedModelYear,vm.selectedStartMonth,vm.selectedEndMonth);
		PlannedVolumesService.getPlannedVolumes(vm.selectedModel,vm.selectedModelYear,vm.selectedStartMonth,vm.selectedEndMonth).then(function(result){
			$scope.isLoadingIndicator = false;
			vm.setPlannedVolumesValues(result);
			vm.buttonName = 'save';
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	vm.applyPreferencePatterns = function(){
		PlannedVolumesService.openModal(vm.selectedModel,vm.selectedModelYear,vm.selectedStartMonth,vm.selectedEndMonth,APPLY_PATTERN).then(function(result){
			$scope.isLoadingIndicator = true;
			PlannedVolumesService.getAppliedPatternsOnPlannedVolumes(vm.selectedModel,vm.selectedModelYear,vm.selectedStartMonth,vm.selectedEndMonth).then(function(result){
				$scope.isLoadingIndicator = false;
				vm.setPlannedVolumesValues(result);
				vm.buttonName = 'save';
			},function(error){
				$scope.isLoadingIndicator = false;
			});
		});
	}
	
	vm.deriveEntityVolumes = function(){
		var startHorizon = vm.totalMonths[0].key;
		var endHorizon = vm.totalMonths[vm.totalMonths.length-1].key;
		PlannedVolumesService.openModal(vm.selectedModel,vm.selectedModelYear,startHorizon,endHorizon,DERIVE_ENTITY_VOLUME).then(function(result){
			$scope.isLoadingIndicator = true;
			PlannedVolumesService.deriveEntityVolumes(vm.selectedModel,vm.selectedModelYear,startHorizon,endHorizon).then(function(result){
				$scope.isLoadingIndicator = false;
				vm.buttonName = 'save';
				vm.isPlannedVolumesSaved = false;
				PlannedVolumesService.isPlannedVolumesSaved = false;
			},function(error){
				$scope.isLoadingIndicator = false;
				vm.isPlannedVolumesSaved = true;
				PlannedVolumesService.isPlannedVolumesSaved = true;
			});
		});
	}
	vm.setPlannedVolumesValues = function(result){
		vm.errorStack = [];
		vm.lockedInMonthsObject = vm.getLockedInMonthsObject();
		vm.months = vm.getMonths(result.operatingPlan);
		vm.weeks = vm.getWeeks(result.operatingPlan);
		vm.operatingPlan = vm.getOperatingPlan(result.operatingPlan);
		vm.plants = vm.getPlantNames(result.operatingPlan);
		vm.plantVolumes = vm.getPlantVolumes(result.operatingPlan);
		vm.channels = vm.getChannels(result.marketVolumes);
		vm.channelVolumes = vm.getChannelVolumes(result.marketVolumes);
		if(!vm.isOperatingPlanExists())
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noOperatingPlan'),
				type: 'warning',
				multiple: false
			});
		vm.isDisplayPlannedVolumes = true;
		vm.enableCancelButton = true;
	}
	
	vm.getMonths = function(operatingPlan){
		return operatingPlan.map(function(opPlan){
			return {
				monthKey: opPlan.month,
				month : new Date(opPlan.month.substring(0,4), parseInt(opPlan.month.substring(4))-1)
			};
		});
	}
	
	vm.getWeeks = function(operatingPlan){
		function parseWeeks(opPlan){
			var month = new Date(opPlan.month.substring(0,4), parseInt(opPlan.month.substring(4))-1);
			var weeks = opPlan.weeks.map(function(week){
				return {
					month: month,
					weekKey : week.weekKey,
					week : new Date(week.weekKey.substring(0,4),parseInt(week.weekKey.substring(4,6))-1, week.weekKey.substring(6))
				};
			});
			weeks.push({
				type : 'Total',
				month : month
			});
			weeks.push({
				type: 'Overrides',
				month: month
			});
			return weeks;
		}
		var weeksList = operatingPlan.map(function(opPlan){
			return parseWeeks(opPlan);
		});
		return weeksList.reduce(function(flattened,weeks){
			return flattened.concat(weeks);
		},[]);
	};
	
	vm.getOperatingPlan = function(operatingPlan) {
		function parseOplan(opPlan){
			var month = new Date(opPlan.month.substring(0,4), parseInt(opPlan.month.substring(4))-1);
			return opPlan.weeks.map(function(week){
				return {
					month: month,
					week : new Date(week.weekKey.substring(0,4),parseInt(week.weekKey.substring(4,6))-1, week.weekKey.substring(6)),
					opPlanKey : week.opPlanKey,
					opPlanVolume : parseInt(week.opPlanVolume || 0),
					spcpsKey: week.spcpsKey,
					spcpsOriginalVolume: parseInt(week.spcpsOriginalVolume || 0)
				};
			});
		}
		var opPlanList = operatingPlan.map(function(opPlan){
			return parseOplan(opPlan)
		});
		return opPlanList.reduce(function(flattened,opPlans){
			return flattened.concat(opPlans);
		},[]);
	};
	
	vm.getChannelVolumes = function(marketVolumes){
		function parseChannels(market){
			var channelsList = market.channels.map(function(channel){
				var monthList = channel.channelVolumes.map(function(monthObj){
					return monthObj.weeks.map(function(weekObj){
						if (weekObj.weekKey === "Total") {
							return {
								market : market.market,
								channelName : channel.name,
								channelKey : channel.key,
								type : "Total",
								month : new Date(monthObj.month.substring(0,4), parseInt(monthObj.month.substring(4))-1),
								volume : parseInt(weekObj.value || 0),
								counts : parseInt(weekObj.scheduleCounts || 0)
							};							
						} else {
							return {
								market : market.market,
								channelName : channel.name,
								channelKey : channel.key,
								plannedVolumeKey : weekObj.key,
								week : new Date(weekObj.weekKey.substring(0,4),parseInt(weekObj.weekKey.substring(4,6))-1, weekObj.weekKey.substring(6)),
								month : new Date(monthObj.month.substring(0,4), parseInt(monthObj.month.substring(4))-1),
								volume : parseInt(weekObj.value || 0),
								counts : parseInt(weekObj.scheduleCounts || 0),
								changed : false,
								originalVolume : parseInt(weekObj.value || 0)
							};
						}
					});
				});
				return monthList.reduce(function(flatList, month) { return flatList.concat(month); }, []);
			});
			return channelsList.reduce(function(flatList, channel) { return flatList.concat(channel); }, []);
		}
		var marketList = marketVolumes.map(function(market){
			return parseChannels(market);
		});
		return marketList.reduce(function(flatList, market) { return flatList.concat(market); }, []);
	}
	
	vm.getNumberOfWeeks = function(month){
		return vm.weeks.filter(function(week){
			return week.month.getTime() === month.getTime();
		}).length;
	}
	
	vm.getOpPlanVolumeForWeek = function(weekObj){
		return vm.operatingPlan.filter(function(opPlan){
			return opPlan.week.getTime() === weekObj.week.getTime();
		})[0];
	}
	
	vm.getOpPlanTotalForMonth = function(month){
		var opPlansForMonth = vm.operatingPlan.filter(function(opPlan){
			return opPlan.month.getTime() === month.getTime();
		});
		return opPlansForMonth.reduce(function(sum,opPlan){
			return sum + opPlan.opPlanVolume;
		},0);
	}
	
	vm.getWeekLevelScheduledCounts = function(week){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.week.getTime() === week.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.counts;
		},0);
	}
	
	vm.getMonthLevelScheduledCounts = function(month){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.month.getTime() === month.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.counts;
		},0);
	}
	
	vm.getSPCPSOriginalTotalForMonth = function(month){
		var opPlansForMonth = vm.operatingPlan.filter(function(opPlan){
			return opPlan.month.getTime() === month.getTime();
		});
		return opPlansForMonth.reduce(function(sum,opPlan){
			return sum + opPlan.spcpsOriginalVolume;
		},0);
	}
	
	vm.getChannels = function(marketVolumes){
		function parseChannels(marketObj){
			var channelsList = [{
				type: 'Market',
				market : marketObj.market
			},{
				type: 'MarketScheduleCounts',
				market: marketObj.market
			}];
			channelsList = channelsList.concat(marketObj.channels.map(function(channel){
				return [{
					market: marketObj.market,
					channelKey: channel.key,
					channelName: channel.name
				},{
					market: marketObj.market,
					channelName: channel.name,
					type: 'ScheduleCounts'
				}];
			}));
			return channelsList.reduce(function(flattenList, channel) { return flattenList.concat(channel); },[]);
		}
		var channelsList = marketVolumes.map(function(market){
			return parseChannels(market);
		});
		return channelsList.reduce(function(flattenned,channels){
			return flattenned.concat(channels);
		},[]);
	}

	vm.getChannelVolumeForWeek = function(market, channelName, week) {
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.week.getTime() === week.getTime();
		}).filter(function(channelVolume){
			return channelVolume.channelName === channelName;
		})[0];
	}
	
	vm.getSPCPSTotalChannelVolume = function(market, channelName, type, month){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type === type && channelVolume.month.getTime() === month.getTime();
		}).filter(function(channelVolume){
			return channelVolume.channelName === channelName;
		})[0];
	}
	
	vm.getSPCPSOverrideSumForChannel = function(market, channelName, month){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market; 
		}).filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.month.getTime() === month.getTime();
		}).filter(function(channelVolume){
			return channelVolume.channelName === channelName;
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.volume;
		},0);
	}
	
	vm.getMarketSumForWeek = function(market, week){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.week.getTime() === week.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.volume;
		},0);
	}
	
	vm.getMarketSumCountsForWeek = function(market, week){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.week.getTime() === week.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.counts;
		},0);
	}
	
	vm.getMarketSumSPCPSTotal = function(market, month, type){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type === type && channelVolume.month.getTime() === month.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.volume;
		},0);
	}
	
	vm.getMarketCountsForTotalcolumn = function(market, month, type){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type === type && channelVolume.month.getTime() === month.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.counts;
		},0);
	}
	
	vm.getMarketSumSPCPSOverrides = function(market, month){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.market === market;
		}).filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.month.getTime() === month.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.volume;
		},0);
	}
	
	vm.getWeekLevelSPCPSOverrideSum = function(week){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.week.getTime() === week.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.volume;
		},0);
	}
	
	vm.getMonthLevelSPCPSOverrideSum = function(month){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.type ? false : channelVolume.month.getTime() === month.getTime();
		}).reduce(function(sum,channelVolume){
			return sum + channelVolume.volume;
		},0);
	}
	
	vm.getLockedInMonthsObject = function(){
		var lockedMonthObj = {};
		vm.startMonths.forEach(function(month){
			lockedMonthObj[month.key] = month.lockedIn;
		});
		return lockedMonthObj;
	}
	
	vm.isMonthLockedIn = function(month){
		var monthString = vm.parseDate(month);
		return vm.lockedInMonthsObject[monthString] === 'Y';
	}
	
	vm.freezeChannelCell = function(weekObj){
		var isOpPlanVolumeZero = vm.getOpPlanVolumeForWeek(weekObj).opPlanVolume  === 0;
		var isMonthLockedIn = vm.isMonthLockedIn(weekObj.month);
		return isOpPlanVolumeZero;
	}
	
	vm.getPlantNames = function(operatingPlan){
		return operatingPlan[0].weeks[0].plants.map(function(plant){
			return plant.name;
		});
	}
	
	vm.getPlantVolumes = function(operatingPlan){
		return operatingPlan.map(function(monthObj){
			return monthObj.weeks.map(function(weekObj){
				return weekObj.plants.map(function(plant){
					return {
						month : new Date(monthObj.month.substring(0,4), parseInt(monthObj.month.substring(4))-1),
						week : new Date(weekObj.weekKey.substring(0,4),parseInt(weekObj.weekKey.substring(4,6))-1, weekObj.weekKey.substring(6)),
						plantName : plant.name,
						plantVolume : parseInt(plant.value || 0)
					}
				})
			}).reduce(function(flatList,plant){
				return flatList.concat(plant);
			},[])
		}).reduce(function(flatList,plant){
			return flatList.concat(plant);
		},[]);
	}
	
	vm.getPlantVolumeForWeek = function(weekObj,plantName){
		return vm.plantVolumes.filter(function(plant){
			return plant.week.getTime() === weekObj.week.getTime();
		}).filter(function(plant){
			return plant.plantName === plantName;
		})[0];
	}
	
	vm.getMonthLevelPlantTotal = function(month,plantName){
		return vm.plantVolumes.filter(function(plant){
			return plant.plantName === plantName;
		}).filter(function(plant){
			return plant.month.getTime() === month.getTime();
		}).reduce(function(volume,plant){
			return volume + plant.plantVolume;
		},0);
	}
	
	vm.captureEditedPlannedVolumes = function(){
		return vm.channelVolumes.filter(function(channelVolume){
			return channelVolume.type ? false : (channelVolume.changed ||
					(channelVolume.originalVolume !== channelVolume.volume) || 
					(channelVolume.plannedVolumeKey === '' && channelVolume.volume !== 0) ||
					(channelVolume.plannedVolumeKey !== '')
					);
		}).map(function(channelVolume){
			var opPlanObj = vm.operatingPlan.filter(function(opPlan){
				return opPlan.week.getTime() === channelVolume.week.getTime();
			})[0]; 
			var weekKey = vm.weeks.filter(function(weekObj){
				return weekObj.type ? false : weekObj.week.getTime() === channelVolume.week.getTime();
			})[0].weekKey;
			return {
				key: channelVolume.plannedVolumeKey, 
				value: channelVolume.volume,
				spcpsKey: opPlanObj.spcpsKey,
				spcpsOrigValue: opPlanObj.spcpsOriginalVolume,
				channelKey: channelVolume.channelKey,
				weekKey: weekKey
			}
		});
	}
	
	
	vm.isOverridenVolumeValid = function(weekObj){
		var isPresent = vm.errorStack.map(Number).indexOf(+weekObj.week);
		if(vm.getWeekLevelSPCPSOverrideSum(weekObj.week) === vm.getOpPlanVolumeForWeek(weekObj).opPlanVolume){
			isPresent !== -1 ? vm.errorStack.splice(isPresent,1) : '';
			return true;
		}else{
			isPresent === -1 ? vm.errorStack.push(weekObj.week) : '';
			return false;
		}
	}
	
	vm.constructSavePlannedVolumes = function(){
		return {
				modelKey: vm.selectedModel,
				modelYear: vm.selectedModelYear,
				volumes: vm.captureEditedPlannedVolumes()
		}
	}
	
	vm.savePlannedVolumes = function(){
		$scope.isLoadingIndicator = true;
		PlannedVolumesService.savePlannedVolumes(vm.constructSavePlannedVolumes()).then(function(result){
			vm.isDisplayPlannedVolumes = false;
			$scope.isLoadingIndicator =false;
			vm.loadPlannedVolumes();
			PlannedVolumesService.isPlannedVolumesSaved = true;
			vm.isPlannedVolumesSaved = PlannedVolumesService.isPlannedVolumesSaved;
		},function(error){
			$scope.isLoadingIndicator =false;
		});
	}
	
	vm.getChannelClass = function(channelType,weekType){
		if(channelType === 'MarketScheduleCounts' || channelType === 'ScheduleCounts'){
			if(weekType === 'Overrides')
				return 'scheduleCounts orange';
			else if(weekType === 'Total')
				return 'scheduleCounts grey';
			return 'scheduleCounts paleBlue';
		} else if(weekType === 'Overrides'){
			return 'orange';
		} else if(weekType === 'Total'){
			return 'grey';
		} else if(channelType === 'Market') {
			return 'orange';
		}
		return '';
	}
	
	vm.parseDate = function(month){
		var mm = (month.getMonth() + 1).toString();
		mm = mm.length === 1 ? '0' + mm : mm;
		return month.getFullYear().toString() + mm;
	}
	
	vm.getDateRangePickerObject = function(months){
		var startMonth = months[0];
		var endMonth = months[months.length-1];
		var startDate = new Date(startMonth.key.substring(0,4), parseInt(startMonth.key.substring(4,6))-1);
		var endDate = new Date(endMonth.key.substring(0,4),parseInt(endMonth.key.substring(4,6))-1);
		return new WcDateRangePickerPrototype({
				startDate : startDate,
				endDate : endDate,
				minDate : startDate,
				maxDate : endDate
		});
	}
	
	vm.canPatternsBeApplied = function(){
		return vm.operatingPlan.filter(function(opPlan){
			return opPlan.spcpsKey !== '';
		}).length > 0;
	}
	
	vm.isOperatingPlanExists = function(){
		return vm.operatingPlan.filter(function(opPlan){
			return opPlan.opPlanVolume !== 0;
		}).length > 0;
	}
	
	var filterModels = function(){
		var modelYears = vm.modelYears.filter(function(modelYear){
			return modelYear.modelYear === vm.selectedModelYear;
		});
		return modelYears[0].models;
	}
	
	function filterStartMonths(){
		var startMonths = vm.models.filter(function(model){
			return model.key === vm.selectedModel;
		});
		return startMonths[0].months;
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
