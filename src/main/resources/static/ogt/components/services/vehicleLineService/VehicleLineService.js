'use strict';

angular.module('Ogt.ComponentsModule').
service('VehicleLineService', ['WcHttpEndpointPrototype','$http','$q', function(WcHttpEndpointPrototype,$http,$q) {

	this.marketInformationEndpoint = new WcHttpEndpointPrototype('marketInfo/markets');
	/*this.vehicleLineInformationEndpoint=new WcHttpEndpointPrototype('marketInfo/vehicleInfo');
	this.modelYearInformationEndpoint=new WcHttpEndpointPrototype('marketInfo/modelYear');*/
	this.selectedMarket='';
	this.selectedModel='';
	this.selectedModelYear='';
	this.modelYears='';
	this.sessionId='';
	this.currentModelYear = '';
	this.getMarketInformation = function() {
		return this.marketInformationEndpoint.get({cache: 'sessionStorage'}).then(function(response){
			return response.data;
		});
	};
	/*
	this.getVehicleLineInformation=function(marketCode) {
		return this.vehicleLineInformationEndpoint.get({cache: 'localStorage', alwaysRefresh: true, params: {'marketCode': marketCode}}).then(function(response){
			return response;
		});
	};
	
	this.getModelYearInformation=function(marketCode,vehicleLine) {
		return this.modelYearInformationEndpoint.get({cache: 'localStorage', alwaysRefresh: true, params: {'marketCode': marketCode,'vehicleLine':vehicleLine}}).then(function(response){
			return response;
		});
	};*/
	
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
	
	this.getMarketInformationJSON = function() {
		var deferred = $q.defer();
		return  $http.get("ogt/marketInfo.json").then(function(response){
			deferred.resolve(response.data);
			return deferred.promise;
		});
	};
}]);