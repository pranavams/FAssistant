'use strict';

angular.module('ForecastParameterModule').service('ForecastParameterService',['$q','WcHttpEndpointPrototype',
         '$translate','WcAlertConsoleService','MarketGroupSelectModalService',
         function($q,WcHttpEndpointPrototype,$translate,WcAlertConsoleService,MarketGroupSelectModalService){
	
	var self=this;
	self.getModelYearsEndpoint = new WcHttpEndpointPrototype('marketInfo/ForecastParameters/markets/business');
	self.getParametersEndpoint = new WcHttpEndpointPrototype('ogt/productAdmin/forecastParameter/get');
	self.saveEndpoint = new WcHttpEndpointPrototype('ogt/productAdmin/forecastParameter/save');
	self.selectedModelYear = '';
	self.selectedMarketGroup='';
	self.selectedBusinessProcess='';
	self.loggedInUserId = '';
	
	self.modelYears = [];
		
	self.getModelYears = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getModelYearsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess}}).then(function(response){
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
	
	self.getParameters = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getParametersEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
				'modelyear':self.selectedModelYear, 'loggedInUserId' : self.loggedInUserId}}).then(function(response){
			deferred.resolve(response.data.forecastParameters);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.forecastParameterGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.save = function(saveForecastParameters){
		var deferred = $q.defer();
		self.saveEndpoint.post(saveForecastParameters).then(function(response){
			deferred.resolve(response);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.success.forecastParametersSaveSuccess'),
				type: 'success',
			});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.forecastParameterSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
		
}])
