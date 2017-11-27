'use strict';

angular.module('OgtModule').service('MarketGroupSelectModalService', ['$uibModal','WcHttpEndpointPrototype','$q',
                                                                            function($uibModal,WcHttpEndpointPrototype,$q) {
	this.selectedMarketGroup ='';
	this.selectedBusiness = '';
	this.opened = 'N';
	this.markets ='';
	this.business = '';
	this.marketGroupAndBusinessProcessEndpoint = new WcHttpEndpointPrototype('authorization/ogtAuthorization');
	this.open = function(){
		this.opened = 'Y';
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/components/modals/marketGroupSelectProcessModal/MarketGroupSelectModalTemplate.html',
				controller: 'MarketGroupSelectModalController as marketGroupSelectModalCtrl',
				backdrop: 'static',
				keyboard: false
			});
			return modalInstance.result.then(angular.bind(this, function() {
				return true;
			}));
		
	};
	
	this.getMarketGroupAndBusinessProcess = function(){
		var deferred = $q.defer();
		this.marketGroupAndBusinessProcessEndpoint.get().then(function(response){
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}
		

	this.selectedMarketGroupAndBusinessProcess = function() {
	console	.log("===selectedMarketGroupAndBusinessProcess===> "+ this.selectedBusiness + ":" + this.selectedMarketGroup);
	return this.selectedBusiness + ":" + this.selectedMarketGroup;
	}
	
	this.isAuthorisedParam =function(selectedMarket){
		if(selectedMarket!=undefined ){
			console.log("===> isAuthorisedParam "+ this.selectedBusiness + ":" + this.selectedMarketGroup+":"+selectedMarket);
			return this.selectedBusiness + ":" + this.selectedMarketGroup+":"+selectedMarket;
		}		
		
	}

	
}]);