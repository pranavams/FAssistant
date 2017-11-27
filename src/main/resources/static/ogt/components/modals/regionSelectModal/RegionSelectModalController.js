'use strict';

angular.module('OgtModule').controller('RegionSelectModalController',['$uibModalInstance','RegionSelectModalService', function($uibModalInstance,RegionSelectModalService) {
	this.selectedMarket ='';
	this.selectedBusiness = '';
	var vm=this;
	
	RegionSelectModalService.getMarketGroupAndBusinessProcess().then(function(result){
		
		vm.business = (result.businessProcess);
		//vm.markets = (result.marketGroup);
	});


	this.resolve = function() { 
        RegionSelectModalService.selectedMarket = this.selectedMarket; 
        RegionSelectModalService.selectedBusiness = this.selectedBusiness; 
        RegionSelectModalService.business =vm.business; 
        RegionSelectModalService.markets = vm.markets; 
        $uibModalInstance.close(); 
};

	
	this.onKeyPress = function($event){
		if(event.which === 13) {
			$("#modal-submit").click();
		}
	};
	
	this.reject = function() {
		$uibModalInstance.dismiss();
	};
	
}]);