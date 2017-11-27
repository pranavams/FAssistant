'use strict';

angular.module('Ogt.ComponentsModule').service('MarketService', ['$q','$translate','WcAlertConsoleService','WcHttpEndpointPrototype', 
                                                                 function($q,$translate,WcAlertConsoleService,WcHttpEndpointPrototype) {

	this.marketInformationEndpoint = new WcHttpEndpointPrototype('marketInfo/markets');

	this.getMarketInformation = function() {
		return this.marketInformationEndpoint.get(/*{cache: 'sessionStorage'}*/).then(function(response){
			return response;
		}, function(error) {
			if(error.status === 0 ) {
				/* CORS Error. Need to implement handler to handle this. */
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
		}).catch(function() {
			console.log("Error in accessing the Market Information End Point promise.! ");
		});
	};

}]);