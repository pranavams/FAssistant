'use strict';

angular.module('PreferencePatternModule').service('PreferencePatternService',['$q','WcHttpEndpointPrototype',
         '$translate','WcAlertConsoleService','MarketGroupSelectModalService',
         function($q,WcHttpEndpointPrototype,$translate,WcAlertConsoleService,MarketGroupSelectModalService){
	
	var self=this;
	self.getModelsMonthsEndpoint = new WcHttpEndpointPrototype('marketInfo/PreferencePattern/markets/business');
	self.getPatternsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/preferencePattern/get');
	self.savePatternsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/preferencePattern/save');
	self.selectedStartMonth = '';
	self.selectedEndMonth = '';
	self.selectedModel = '';
	self.selectedModelYear = '';
	self.selectedMarketGroup='';
	self.selectedBusinessProcess='';
	self.loggedInUserId = '';
	self.models = [];
	self.modelYears = [];
	self.startMonths = [];
	self.endMonths = [];
	
	self.getModelMonths = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getModelsMonthsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess}}).then(function(response){
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
	
	self.getPatterns = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getPatternsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
			'model': self.selectedModel, 'modelyear':self.selectedModelYear, 'startMonth':self.selectedStartMonth, 'endMonth':self.selectedEndMonth, 'loggedInUserId' : self.loggedInUserId}}).then(function(response){
			deferred.resolve(response.data.PreferencePatterns);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.preferencePatternGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.savePatterns = function(preferencePatternJSON){
		var deferred = $q.defer();
		self.savePatternsEndpoint.post(preferencePatternJSON).then(function(response){
			deferred.resolve(response);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.success.preferencePatternSaveSuccess'),
				type: 'success',
			});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.preferencePatternSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
}])
