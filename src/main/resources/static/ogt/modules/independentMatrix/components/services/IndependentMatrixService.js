'use strict';

angular.module('IndependentMatrixModule').service('IndependentMatrixService',['WcHttpEndpointPrototype','MarketGroupSelectModalService','$q',
                                                              'WcAlertConsoleService','UserService','$translate','$uibModal',
         function(WcHttpEndpointPrototype,MarketGroupSelectModalService,$q,WcAlertConsoleService,UserService,$translate,$uibModal){
	var self= this;
	self.getModelsMonthsEndpoint = new WcHttpEndpointPrototype('marketInfo/independentMatrix/markets/business');
	
	self.getModels = function(){
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

}]);
