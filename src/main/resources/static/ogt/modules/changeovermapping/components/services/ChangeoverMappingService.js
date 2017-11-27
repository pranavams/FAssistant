'use strict';

angular.module('ChangeoverMappingModule').
service('ChangeoverMappingService', ['WcHttpEndpointPrototype','$http','$q','WcAlertConsoleService','$translate','$filter', function(WcHttpEndpointPrototype,$http,$q,WcAlertConsoleService,$translate,$filter) {

	this.selectedMarket='';
	this.selectedModel='';
	this.selectedModelYear='';
	this.modelYears=[];
	this.markets = [];
	this.models = [];
	this.selectedfamily = {};
	this.changeovermappings = [];
	this.changeovermappingsAll = [];
	this.changeovermappingsDifferences = [];
	this.marketInformationEndpoint = new WcHttpEndpointPrototype('marketInfo/ChangeOverMappings/markets/business');
	this.changeoverMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/myco');
	this.changeoverMappingsSaveOrDeleteEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/myco/saveOrDelete');
	this.getMarketInformation = function(businessProcess,marketGroup) {
		return this.marketInformationEndpoint.get({params: {'marketGroup': marketGroup,'businessProcess':businessProcess}}).then(function(response){
			return response.data;
		});
	};
	this.getMarkets = function(marketsArray) {
		this.markets = marketsArray.markets;
		return marketsArray.markets;
	}
	
	this.getModels = function(array,selectedMarket)
	{
		this.selectedMarket = selectedMarket;
		var deferred = $q.defer();
		var  models=[];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				models=market.models
			}
		});
		this.models = models;
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
	
	this.getChangeoverMappings = function(selectedModelYear) {
		var modelYear = $filter('filter')(this.modelYears, { modelYear: selectedModelYear  }, true)[0];
		return this.changeoverMappingsEndpoint.get({params: {'marketModelYearBusinessKey': modelYear.businessKey}}).then(function(response){
			return response.data;
		}, function(error) {
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.errorMYCORetrieve', {error: error}),
					type: 'danger'
				});
		});
	};

	this.saveOrDelete = function(mycoMappingJson) {
		console.log("mycoMappingJson  "+mycoMappingJson);
		return this.changeoverMappingsSaveOrDeleteEndpoint.post(mycoMappingJson).then(this,function(response){
			return response.data;
		});
	};
}]);
