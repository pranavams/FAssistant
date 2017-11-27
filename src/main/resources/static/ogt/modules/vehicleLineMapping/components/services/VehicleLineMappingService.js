'use strict';

angular.module('VehicleLineMappingModule').service('VehicleLineMappingService', 
		['$q','$translate','WcAlertConsoleService','WcHttpEndpointPrototype','$http',
		 'VehicleLineMappingMarketsPrototype','VehicleLineMappingModelsStatusPrototype','VehicleLineMappingModelsPrototype',
		 function($q,$translate,WcAlertConsoleService,WcHttpEndpointPrototype,$http,
				 VehicleLineMappingMarketsPrototype,VehicleLineMappingModelsStatusPrototype,VehicleLineMappingModelsPrototype) {
	
	var self=this;
	self.vehicleLineMappingListEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/modelMapping/retrieve/ModelMappings/vehicleList');
	self.saveVehicleLineMappingEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/modelMapping/save');
	
	this.selectedMarket =[];
	this.selectedModelStatus ='';
	this.isReload=undefined;
	
	this.getVehicleModelYearList = function(businessProcess,marketGroup) {
		var deferred= $q.defer();
		var endPointUrl = '/ogt/productAdmin/modelMapping/retrieve/ModelMappings/vehicleList/businessProcess/'+businessProcess+'/marketGroup/'+marketGroup;
		self.vehicleLineMappingListEndpoint = new WcHttpEndpointPrototype(endPointUrl);
		self.vehicleLineMappingListEndpoint.post().then(function(response){
			deferred.resolve(response.data);
		}, function(error) {
			if(error.status === 0 ) {
				/* CORS Error. Need to implement handler to handle this. */
				WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.corsError', {error: error}),
				type: 'danger',
				removeErrorOnStateChange: true
				});
			}
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.vehicleMappingListError', {error: error}),
				type: 'danger',
				removeErrorOnStateChange: true
			});
			deferred.reject(error);
			throw error;
		});
		return deferred.promise;
	};
	
	var ACTIVE_STATUS = "Active";
	var INACTIVE_STATUS = "Inactive";
	var NEW_STATUS = "New";
	
	this.saveModels = function(selectedModelsArray,selectedModelsMarketArray,userId,businessProcess,marketGroup) {
		var finalJSONModelObj = prepareJSONObject(selectedModelsArray,selectedModelsMarketArray,userId,businessProcess,marketGroup);
		return this.saveVehicleLineMappingEndpoint.post(finalJSONModelObj).then(angular.bind(this, function(response) {
			WcAlertConsoleService.addMessage({
	            message: $translate.instant('application.success.modelSaveSuccess'),
	            type: 'success'
	          });
			return response.data;
		}), function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
			return $q.reject(error);
		});
	};
	
	function prepareJSONObject(selectedModelsArray,selectedModelsMarketArray,userId,businessProcess,marketGroup) {
		var selectedMarketsArray = [];
		
		$.each(selectedModelsMarketArray, function(marketIndex, marketArrValue) {
			var marketsProtoType = new VehicleLineMappingMarketsPrototype();
			var modelsByActiveStatusPrototype = new VehicleLineMappingModelsStatusPrototype();
			var modelsByInactiveStatusPrototype = new VehicleLineMappingModelsStatusPrototype();
			var modelsByNewStatusPrototype = new VehicleLineMappingModelsStatusPrototype();
			
			$.each(selectedModelsArray, function(modelIndex, modelArrValue) {
				if(marketArrValue === modelArrValue.marketKey) {
					var vehicleMappingProto = modelArrValue;
					var modelsPrototype = new VehicleLineMappingModelsPrototype();
					modelsPrototype.key = vehicleMappingProto.modelKey;
					modelsPrototype.modelYear = vehicleMappingProto.modelYear;
					modelsPrototype.surrogateModel.key = vehicleMappingProto.surrogateModel.key;
					modelsPrototype.surrogateModel.name = vehicleMappingProto.surrogateModel.name;
					modelsPrototype.surrogateModel.modelYear = vehicleMappingProto.surrogateModel.modelYear;
					
					if(vehicleMappingProto.updatedStatus ===  ACTIVE_STATUS) {
						modelsByActiveStatusPrototype.status = vehicleMappingProto.updatedStatus;
						modelsByActiveStatusPrototype.models.push(modelsPrototype);
					} else if(vehicleMappingProto.updatedStatus ===  INACTIVE_STATUS) {
						modelsByInactiveStatusPrototype.status = vehicleMappingProto.updatedStatus;
						modelsByInactiveStatusPrototype.models.push(modelsPrototype);
					} else if(vehicleMappingProto.updatedStatus ===  NEW_STATUS) {
						modelsByNewStatusPrototype.status = vehicleMappingProto.updatedStatus;
						modelsByNewStatusPrototype.models.push(modelsPrototype);
					} 
					
					
					marketsProtoType.key = vehicleMappingProto.marketKey;
					marketsProtoType.name = vehicleMappingProto.marketName;
					marketsProtoType.loggedInUserId = userId;
					marketsProtoType.businessProcess = businessProcess;
					marketsProtoType.marketGroup = marketGroup;
				}
			});
			if(modelsByActiveStatusPrototype.status === ACTIVE_STATUS) {
				marketsProtoType.modelsByStatus.push(modelsByActiveStatusPrototype);
			} 
			if(modelsByInactiveStatusPrototype.status === INACTIVE_STATUS) {
				marketsProtoType.modelsByStatus.push(modelsByInactiveStatusPrototype);
			}
			if(modelsByNewStatusPrototype.status === NEW_STATUS) {
				marketsProtoType.modelsByStatus.push(modelsByNewStatusPrototype);
			}
			selectedMarketsArray.push(marketsProtoType);
		});
		
		console.log('Selected models to ogm: '+JSON.stringify(selectedMarketsArray));
		return JSON.stringify(selectedMarketsArray);
		
	};
	
	this.getModelMappingJSON = function() {
		var deferred = $q.defer();
		return  $http.get("ogt/ModelMapping.json").then(function(response){
			deferred.resolve(response.data);
			return deferred.promise;
		});
	};
}]);