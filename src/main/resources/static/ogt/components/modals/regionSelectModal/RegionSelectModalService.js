'use strict';

angular.module('OgtModule').service('RegionSelectModalService', ['$uibModal','WcHttpEndpointPrototype','$q','$http', 
                                                                            function($uibModal,WcHttpEndpointPrototype,$q,$http) {
	this.selectedMarket ='';
	this.selectedBusiness = '';
	this.opened = 'N';
	this.marketGroupAndBusinessProcessEndpoint = new WcHttpEndpointPrototype('authorization/business');
	
	this.open = function(){
		this.opened = 'Y';
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/components/modals/regionSelectModal/RegionSelectModalTemplate.html',
				controller: 'RegionSelectModalController as regionSelectModalCtrl',
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
	
	
	 this.getMarketGroups= function(businessProcess,){
		 
	 }
}]);