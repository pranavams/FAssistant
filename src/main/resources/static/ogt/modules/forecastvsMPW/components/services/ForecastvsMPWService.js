'use strict';

angular.module('ForecastvsMPWModule').service('ForecastvsMPWService',['WcHttpEndpointPrototype','MarketGroupSelectModalService','$q','WcAlertConsoleService','UserService','$translate',
         function(WcHttpEndpointPrototype,MarketGroupSelectModalService,$q,WcAlertConsoleService,UserService,$translate){
	var self= this;
	self.getModelsMonthsEndpoint = new WcHttpEndpointPrototype('marketInfo/ForecastMpws/markets/business');
	self.getForecastMPWEndPoint = new WcHttpEndpointPrototype('ogt/productAdmin/forecastvsMPW');
	self.selectedMarketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	self.selectedBusinessProcess;
	
	self.getModels = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getModelsMonthsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess}}).then(function(response) {
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelsModelYears', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.getForecastMPWdata = function(reqObj){
		reqObj.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		reqObj.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		reqObj.loggedInUserId = UserService.getUserId();
		var deferred = $q.defer();
		self.getForecastMPWEndPoint.get({params:reqObj}).then(function(response){
			deferred.resolve(response.data.entityMix);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.forecastVsMpwGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
}])
