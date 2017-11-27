'use strict';

angular.module('MidModelYearMappingModule')
	.service('MidModelYearMappingService',['MarketGroupSelectModalService','$q','WcHttpEndpointPrototype','WcAlertConsoleService','$translate','UserService',
	                                       MidModelYearMappingService]);

function MidModelYearMappingService(MarketGroupSelectModalService,$q,WcHttpEndpointPrototype,WcAlertConsoleService,$translate,UserService){
	var self = this;
	self.selectedMarket='';
	self.selectedModel='';
	self.selectedModelYear='';
	self.modelYears=[];
	self.markets = [];
	self.models = [];
	self.familiesData;
	self.selectedFamily;
	self.marketInformationEndpoint = new WcHttpEndpointPrototype('marketInfo/MidModelYearMappings/markets/business');
	self.midModelYearMappingsEndpoint = new WcHttpEndpointPrototype('ogt/productAdmin/myco/midmyco');
	self.saveMidModelYearMappingEndpoint = new WcHttpEndpointPrototype('ogt/productAdmin/myco/saveOrDelete');
	
	self.getSelectedTriplet = function(market,model,modelYear,marketsList,modelsList,modelYearsList,family,familiesData){
		self.selectedMarket = market;
		self.selectedModel = model;
		self.selectedModelYear = modelYear;
		self.modelYears = modelYearsList;
		self.markets = marketsList;
		self.models = modelsList;
		self.familiesData = familiesData;
		self.selectedFamily = family;
	}
	
	self.getMarketInformation = function() {
		var deferred = $q.defer();
		self.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		self.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		self.marketInformationEndpoint.get({params: {'marketGroup': self.marketGroup,'businessProcess': self.businessProcess}}).then(function(response){
			deferred.resolve(response.data);
		},function(error){
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelsModelYears', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	self.getFamilyFetauresData = function(marketModelYearBusinessKey) {
		var deferred = $q.defer();
		this.midModelYearMappingsEndpoint.get({params: {'marketModelYearBusinessKey': marketModelYearBusinessKey}}).then(function(response){
			deferred.resolve(response.data.midmyco);
		}, function(error) {
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.midMYCOGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	};
	
	self.saveMappings = function(saveObj){
		var deferred = $q.defer();
		saveObj.loggedInUser = UserService.getUserId();
		self.saveMidModelYearMappingEndpoint.post(saveObj).then(function(response){
			deferred.resolve(response);
			WcAlertConsoleService.addMessage({
					message: $translate.instant('application.success.midMycoSuccess'),
					type: 'success'
				});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
					message: $translate.instant('application.errors.midMycoSaveError', {error: error}),
					type: 'danger',
					multiple: false,
					removeErrorOnStateChange: true
				});
		});
		return deferred.promise;
	}
	
	
}