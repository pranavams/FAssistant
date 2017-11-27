'use strict';

angular.module('WersEntityMappingModule').service('WersEntityMappingService',['$q','WcHttpEndpointPrototype','$http',
         '$translate','WcAlertConsoleService','MarketGroupSelectModalService',
         function($q,WcHttpEndpointPrototype,$http,$translate,WcAlertConsoleService,MarketGroupSelectModalService){
	
	var self=this;
	self.marketsModelModelYearEndpoint = new WcHttpEndpointPrototype('marketInfo/WERSEntityMapping/markets/business');
	self.getMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/wersEntityMappings');
	self.saveMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/wersEntityMappings/save');
	self.selectedMarket = '';
	self.selectedModel = '';
	self.selectedModelYear = '';
	self.isReload = undefined;
	self.selectedMarketGroup='';
	self.selectedBusinessProcess='';
	
	self.getMarketsModelsModelYear = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.marketsModelModelYearEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess}}).then(function(response){
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}
	
	self.getWersEntityMappings = function(market,model,modelYear){
		var deferred = $q.defer();
		self.getMappingsEndpoint.get({params: {'market': market,'model':model,'modelYear':modelYear,'businessProcess':self.selectedBusinessProcess,'marketGroup': self.selectedMarketGroup}}).then(function(response){
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}
	
	self.saveMappings = function(wersEntityMappingJson){
		var deferred = $q.defer();
		wersEntityMappingJson.marketGroupCode = self.selectedMarketGroup;
		wersEntityMappingJson.businessProcessCode = self.selectedBusinessProcess;
		console.log('wersEntityMappingJson -- ' + JSON.stringify(wersEntityMappingJson,null,4));
		self.saveMappingsEndpoint.post(wersEntityMappingJson).then(function(response){
			deferred.resolve(response.data);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.success.wersEntityMappingSaveSuccess'),
				type: 'success',
			});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.wersEntityMappingSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
}])
