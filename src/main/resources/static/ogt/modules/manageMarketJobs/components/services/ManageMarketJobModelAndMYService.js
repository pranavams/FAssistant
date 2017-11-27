'use strict';

angular.module('Ogt.ComponentsModule').
service('ManageMarketJobModelAndMYService', ['WcHttpEndpointPrototype','$http','$q','MarketGroupSelectModalService', function(WcHttpEndpointPrototype,$http,$q,MarketGroupSelectModalService) {

	this.marketInformationEndpoint = new WcHttpEndpointPrototype('marketInfo/ManageMarketJobs/markets/business');
	this.marketMFInformationEndpoint = new WcHttpEndpointPrototype('marketInfo/ManageForecastJobs/markets/business');
	this.selectedMarket='';
	this.selectedModel='';
	this.selectedModelYear='';
	this.modelYears='';
	this.sessionId='';
	this.currentModelYear = '';
	this.markets = [];
	this.getMarketInformation = function() {
		var deferred = $q.defer();
		if(MarketGroupSelectModalService.selectedBusiness === 'OG'){
			this.marketInformationEndpoint.get({params: {'marketGroup': MarketGroupSelectModalService.selectedMarketGroup,'businessProcess':MarketGroupSelectModalService.selectedBusiness}}).then(angular.bind(this, function(response){
				deferred.resolve(response.data);
			}))}
			else {
				this.marketMFInformationEndpoint.get({params: {'marketGroup': MarketGroupSelectModalService.selectedMarketGroup,'businessProcess':MarketGroupSelectModalService.selectedBusiness}}).then(angular.bind(this, function(response){
					deferred.resolve(response.data);
			}))
	};
		return deferred.promise;
	};
	
	this.getMarkets = function(marketsArray)
	{
		this.markets = marketsArray.markets;
		return marketsArray.markets;
	}
		
	this.getModels = function(array,selectedMarket)
	{
		this.selectedMarket = selectedMarket;
		var  models=[];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				models=market.models
			}
		});
		this.models=models;
		return this.models;
	};
	
	
	this.getModelYears = function(array,selectedMarket,selectedModel)
	{
		this.selectedModel=selectedModel;
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
		return this.modelYears;
	};
}]);