'use strict';

angular.module('VehicleLineMappingModule').controller('VehicleLineMappingController', 
		['$scope','$translate','$compile','$timeout','WcDataTableService','VehicleLineMappingService','VehicleLineMappingPrototype',
		 'WcAlertConsoleService','$q','$state','UserService','$filter','MarketGroupSelectModalService',
        function($scope,$translate,$compile,$timeout,WcDataTableService,VehicleLineMappingService,
        		VehicleLineMappingPrototype,WcAlertConsoleService,$q,$state,UserService,$filter,MarketGroupSelectModalService) {
	
	var vm = this;
	vm.ACTIVE_STATUS = "Active";
	vm.INACTIVE_STATUS = "Inactive";
	vm.NEW_STATUS = "New";
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	vm.surrogateModels={};
	vm.modifiedSurrogateDetails = [];
	var EMPTY_STRING = "";
	var DASH_DELIMETER = "--";
	var ALL_CONSTANT = "ALL";
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		vm.user = userObj;
	}));
	
	$scope.isDataReceivedFromOgm = false;
	$scope.isLoadingText = true;
	
	var activeMarketVehicles = [];
	var inactiveMarketVehicles = [];
	var newMarketVehicles = [];
	
	
	vm.selectedMarket = [];
	vm.modelStatusList = [];
	vm.vehiclesToUpdate = [];
	vm.selectedModelsArray = [];
	vm.selectedModelsMarketArray = [];
	
	var statusList =  [ {
		"id" : vm.ACTIVE_STATUS,
		"label" : $translate.instant('application.vehicleStatusDropdown.active')
	}, {
		"id" : vm.INACTIVE_STATUS,
		"label" : $translate.instant('application.vehicleStatusDropdown.inactive')
	}, {
		"id" : vm.NEW_STATUS,
		"label" : $translate.instant('application.vehicleStatusDropdown.new')
	} ];
	
	vm.loadStatusList = function() {
		vm.isDisplayDataTable = false;
		vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		if(vm.selectedMarket != null) {
			vm.modelStatusList = statusList;
		} else {
			vm.modelStatusList = [];
		}
		vm.selectedModelStatus = null;
	}
	
	vm.hideAndPopulateDataTable = function() {
		vm.isDisplayDataTable = false;
		vm.modifiedSurrogateDetails = [];
		// To Re-render the data table, used the timeout function..
		 $timeout(function() {	
			 vm.populateDataTable();
         },0);
	};
	
	vm.populateDataTable = function() { //Need to fix pagination problem in webcore.
		if(vm.selectedMarket.indexOf(ALL_CONSTANT) > -1) {
			vm.selectedMarket = [];
			angular.forEach(vm.vehicleLineMappings.markets,function(marketObj, index) {
				vm.selectedMarket.push(marketObj.key);
			});
		}
		vm.dataTableMappings = [];
		if(vm.selectedModelStatus == "") {
			vm.isDisplayDataTable = false;
		} else {
			if(vm.selectedModelStatus === vm.ACTIVE_STATUS) {
				$.each(vm.selectedMarket, function(index, value) {
					Array.prototype.push.apply(vm.dataTableMappings, activeMarketVehicles[value]);
				});
			} else if(vm.selectedModelStatus === vm.INACTIVE_STATUS) {
				$.each(vm.selectedMarket, function(index, value) {
					Array.prototype.push.apply(vm.dataTableMappings, inactiveMarketVehicles[value]);
				});
			} else if(vm.selectedModelStatus === vm.NEW_STATUS) {
				$.each(vm.selectedMarket, function(index, value) {
					Array.prototype.push.apply(vm.dataTableMappings, newMarketVehicles[value]);
				});
			} 
			vm.isDisplayDataTable = true;
		}
	};
	
	vm.constructVehiclePrototypes = function() {
		var deferred= $q.defer();
		VehicleLineMappingService.getVehicleModelYearList(vm.businessProcess,vm.marketGroup).then(function(vehicleLineMappings){
			vm.vehicleLineMappings = vehicleLineMappings;
			angular.forEach(vehicleLineMappings.markets,function(marketObj, index) {
				var activeModelMappings = [];
				var inactiveModelMappings = [];
				var newModelMappings = [];
				if(index == 0) {
					vm.selectedMarket.push(marketObj.key);	//When only one market, select it as default and load the status list.
					vm.modelStatusList = statusList;
				} else {
					vm.selectedMarket = null;	//When more than one market, select empty as default.
					vm.modelStatusList = [];
				}
				angular.forEach(marketObj.modelsByStatus, function(modelByStatusObj) {
					angular.forEach(modelByStatusObj.models, function(modelObj) {
						var vhicleLineMappingProto = new VehicleLineMappingPrototype();
						vhicleLineMappingProto.marketKey = marketObj.key;
						vhicleLineMappingProto.marketName = marketObj.name;
						vhicleLineMappingProto.modelKey = modelObj.key;
						vhicleLineMappingProto.modelName = modelObj.name;
						vhicleLineMappingProto.modelYear = modelObj.modelYear;
						vhicleLineMappingProto.isSurrogateEligible = modelObj.isSurrogateEligible;
						if(vhicleLineMappingProto.isSurrogateEligible == 'Y')
						{
							vhicleLineMappingProto.surrogateModel =  modelObj.surrogateModel;
							if(vhicleLineMappingProto.surrogateModel != undefined && vhicleLineMappingProto.surrogateModel.key != undefined)	
							{
								vhicleLineMappingProto.surrogateModelKey = vhicleLineMappingProto.surrogateModel.key;
								vhicleLineMappingProto.surrogateModelName = vhicleLineMappingProto.surrogateModel.name;
								vhicleLineMappingProto.surrogateModelYear = vhicleLineMappingProto.surrogateModel.modelYear;
							}
							angular.forEach( marketObj.surrogateModelsByModelYear, function(surrogateModelsByModelYearObj,index) {

								if(surrogateModelsByModelYearObj.modelYear == (vhicleLineMappingProto.modelYear-1))
								{
									vhicleLineMappingProto.surrogateModels = surrogateModelsByModelYearObj.models;
								}
							})
							var defaultVal={ "key":"",
								"name":"Please select",
								"modelYear":""};
							var arrElement = $filter('filter')(vhicleLineMappingProto.surrogateModels, { key: ""  }, true)[0];
							if(arrElement == undefined){
								vhicleLineMappingProto.surrogateModels.splice(0, 0,defaultVal);
							}	

						}
						vhicleLineMappingProto.currentStatus = modelByStatusObj.status;
						vhicleLineMappingProto.uniqueKey = vhicleLineMappingProto.marketKey + DASH_DELIMETER + 
						vhicleLineMappingProto.modelKey + DASH_DELIMETER + vhicleLineMappingProto.modelYear;

						if(vhicleLineMappingProto.currentStatus === vm.ACTIVE_STATUS) {
							activeModelMappings.push(vhicleLineMappingProto); // Got the Array of Active Models
							activeMarketVehicles[vhicleLineMappingProto.marketKey] = activeModelMappings; // Map<MarketKey,List<ActiveModels>>
						} else if(vhicleLineMappingProto.currentStatus === vm.INACTIVE_STATUS) {
							inactiveModelMappings.push(vhicleLineMappingProto);
							inactiveMarketVehicles[vhicleLineMappingProto.marketKey] = inactiveModelMappings;
						} else if(vhicleLineMappingProto.currentStatus === vm.NEW_STATUS) {
							newModelMappings.push(vhicleLineMappingProto);
							newMarketVehicles[vhicleLineMappingProto.marketKey] = newModelMappings;
						}
					});
				});
			});
			deferred.resolve('Data received');
		},function(error){
			deferred.reject('Data not received');
		});
		return deferred.promise;
	};
	vm.constructVehiclePrototypes().then(function(result){
		$scope.isDataReceivedFromOgm = true;
		$scope.isLoadingText = false;
		if(VehicleLineMappingService.isReload == true){
			 vm.selectedMarket = VehicleLineMappingService.selectedMarket;
			 vm.loadStatusList();
			 vm.selectedModelStatus = VehicleLineMappingService.selectedModelStatus ;
			 vm.hideAndPopulateDataTable();
			 VehicleLineMappingService.isReload = false;
		}
	},function(error){
		$scope.isLoadingText = false;
	});
	
	vm.prepareModelsToSave = function(modelData, updatedStatus) {
		$.each(modelData,function(index, modelKey) {
			var market = modelKey.split(DASH_DELIMETER)[0];
			var mappingsFormarket = [];
			if(vm.selectedModelStatus === vm.ACTIVE_STATUS) {
				mappingsFormarket = activeMarketVehicles[market];
			} else if(vm.selectedModelStatus === vm.INACTIVE_STATUS) {
				mappingsFormarket = inactiveMarketVehicles[market];
			} else if(vm.selectedModelStatus === vm.NEW_STATUS) {
				mappingsFormarket = newMarketVehicles[market];
			}
			$.each(mappingsFormarket, function(index, vlmappingProto) {
				if(vlmappingProto.uniqueKey ===  modelKey) {
					vlmappingProto.updatedStatus = updatedStatus;
					vm.selectedModelsArray.push(vlmappingProto);
					if(vm.selectedModelsMarketArray.indexOf(vlmappingProto.marketKey) == -1) {
						vm.selectedModelsMarketArray.push(vlmappingProto.marketKey);
					}
				}
			});
		});
	};
	
	vm.showSurrogateDropdown = function(flag)
	{
		if(flag == "Y") {
			return true;
		}else if(flag == "N") {
			return false;
		}
	};
	vm.populateSurrogateModel = function(row){
		var arrElement = $filter('filter')(row.surrogateModels, { key: row.surrogateModelKey  }, true)[0];
		var findElement;
		angular.forEach(vm.modifiedSurrogateDetails, function(proto) {
			if(proto.uniqueKey == row.uniqueKey)
				{
				findElement = proto;
				}
		});
		if(arrElement != undefined){
			console.log(arrElement.key +arrElement.name + arrElement.modelYear );
			row.surrogateModelName = (arrElement.key != '') ? arrElement.name :"";
			row.surrogateModelYear = arrElement.modelYear;
			row.surrogateModel.key = arrElement.key;
			row.surrogateModel.name = (arrElement.key != '') ? arrElement.name :"";
			row.surrogateModel.modelYear = arrElement.modelYear;
		}
		if(findElement){
			var point = vm.modifiedSurrogateDetails.indexOf(findElement);
			vm.modifiedSurrogateDetails.splice(point,1);
			vm.modifiedSurrogateDetails.push(row);
		}
		else{
			vm.modifiedSurrogateDetails.push(row);
		}
	}
	vm.saveModelData = function(selectedModels, status) {
		vm.prepareModelsToSave(selectedModels, status);
		for (var modifiedSurrogate, i = 0; modifiedSurrogate = vm.modifiedSurrogateDetails[i++];) {	
			var vlmappingProto;
			var index;
			angular.forEach(vm.selectedModelsArray, function(proto) {
				if(proto.uniqueKey == modifiedSurrogate.uniqueKey)
					{
					vlmappingProto = proto;
					index = vm.selectedModelsArray.indexOf(proto);
					}
			});
			if(vlmappingProto)
				{
				vlmappingProto.surrogateModelName = modifiedSurrogate.surrogateModelName;
				vlmappingProto.surrogateModelYear = modifiedSurrogate.surrogateModelYear;
				vlmappingProto.surrogateModel.key = modifiedSurrogate.surrogateModel.key;
				vlmappingProto.surrogateModel.name = modifiedSurrogate.surrogateModel.name;
				vlmappingProto.surrogateModel.modelYear = modifiedSurrogate.surrogateModel.modelYear;
				vm.selectedModelsArray.splice(index,1);
				vm.selectedModelsArray.push(vlmappingProto);
				}
			else{
				modifiedSurrogate.updatedStatus = modifiedSurrogate.currentStatus;
				vm.selectedModelsArray.push(modifiedSurrogate);
				if(vm.selectedModelsMarketArray.indexOf(modifiedSurrogate.marketKey) == -1) {
					vm.selectedModelsMarketArray.push(modifiedSurrogate.marketKey);
				}
			}
		}
		if(vm.selectedModelsArray.length > 0) {
			VehicleLineMappingService.saveModels(vm.selectedModelsArray,vm.selectedModelsMarketArray,vm.user.userId,vm.businessProcess,vm.marketGroup).then(function(response){
				VehicleLineMappingService.selectedMarket = vm.selectedMarket;
				VehicleLineMappingService.selectedModelStatus = vm.selectedModelStatus;
				VehicleLineMappingService.isReload=true;
				$state.go($state.current, {}, {reload: true});
			});
		} else {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noModelsToSave'),
				type: 'warning',
				multiple: false
			});
		}
		$("html, body").animate({ scrollTop: 0 }, "slow");
		vm.selectedModelsArray = [];
	};
	
	$scope.$on("activate-mappings", angular.bind(this, function(event, data) {
		vm.selectedModelsArray = [];
		vm.saveModelData(data, vm.ACTIVE_STATUS);
	}));
	
	$scope.$on("inactivate-mappings", angular.bind(this, function(event, data) {
		vm.selectedModelsArray = [];
		vm.saveModelData(data, vm.INACTIVE_STATUS);
	}));
	
	$scope.$watch('isLoadingText',function(){
		if($scope.isLoadingText == true){
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
	})
	
	
}]);