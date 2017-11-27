'use strict';

angular.module('ChangeoverRatesModule').
service('ChangeoverRatesService', ['WcHttpEndpointPrototype','$http','$q','VehicleLineService','WcAlertConsoleService','$translate', function(WcHttpEndpointPrototype,$http,$q,VehicleLineService,WcAlertConsoleService,$translate) {

	this.selectedMarket='';
	this.selectedModel='';
	this.selectedModelYear='';
	this.modelYears='';
	this.changeoverRatesEndpoint = new WcHttpEndpointPrototype('/changeoverRates');

	this.getModels = function() {
		var rest = new WcHttpEndpointPrototype('/changeoverRates/models');
		return rest.get().then(function(response){
			return response.data;
		}, function(error) {
			if(error.status === 0 ) {
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.corsError', {error: error}),
					type: 'danger'
				});
			}
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.marketDropdownServiceError', {error: error}),
				type: 'danger'
			});
			return $q.reject(error);
		});
	};
	
	this.getChangeoverRates = function(selectedModelYear) {
		return this.changeoverRatesEndpoint.get({params: {'selectedModelYear': selectedModelYear}}).then(function(response){
			return response.data;
		});
	};

	this.setEditableChangeoverRatesFlag = function(changeoverRates, isEditable) {
		var deferred = $q.defer();
		angular.forEach(changeoverRates, function(arrElement, index){
			arrElement.changeoverRatesFlag = isEditable;
			arrElement.changeoverrateEdit = arrElement.changeoverrate;
		});
		deferred.resolve(changeoverRates);
		return deferred.promise;
	};
	
	
	this.getModelsForSelectedMarket = function(array,selectedMarket)
	{
		this.selectedMarket = selectedMarket;
		var deferred = $q.defer();
		var  models=[];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				models=market.models
			}
		});
		deferred.resolve(models);
		return deferred.promise;
	};
	
	
	this.getModelYears = function(array,selectedMarket,selectedModel)
	{
		this.selectedModel=selectedModel;
		var deferred = $q.defer();
		var  modelYears=[];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				angular.forEach(market.models, function(model, index){
					if(model.key == selectedModel){
						modelYears = model.modelYears;
					}
				});
			}
		});
		this.modelYears=modelYears;
		deferred.resolve(modelYears);
		return deferred.promise;
	}
	
	this.getMarkets = function(marketsArray)
	{
		this.markets = marketsArray.markets;
		return marketsArray.markets;
	}
	

}]);
