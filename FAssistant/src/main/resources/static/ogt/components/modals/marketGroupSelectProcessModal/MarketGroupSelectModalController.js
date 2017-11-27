'use strict';

angular.module('OgtModule').controller('MarketGroupSelectModalController',['$uibModalInstance','MarketGroupSelectModalService', function($uibModalInstance,MarketGroupSelectModalService) {
	this.selectedMarketGroup ='';
	this.selectedBusiness = '';
	var vm=this;
	vm.business;
	
	MarketGroupSelectModalService.getMarketGroupAndBusinessProcess().then(function(result){
		if(vm.userNotHavingAccessToRoles(result)){
			$uibModalInstance.close();
		}
		else if(!vm.authorizeModalPanelRequired(result)){
				vm.setSelectedBusinessProcessAndMarketGroup(result);
				$uibModalInstance.close();
		}else{
			vm.business = result.businessProcess;
		}
	});
	
	vm.userNotHavingAccessToRoles  = function(businessProcessJson){
		return _.keys(businessProcessJson.businessProcess).length < 1 ; 
	};
	
	this.authorizeModalPanelRequired  = function(businessProcessJson){
		return vm.hasAccessToMultipleBusinessProcess(businessProcessJson) || vm.hasAccessToMultipleMarketGroups(businessProcessJson);
	};
	
	
	
	this.setSelectedBusinessProcessAndMarketGroup = function(businessProcessJson){
		MarketGroupSelectModalService.business = businessProcessJson.businessProcess;
		MarketGroupSelectModalService.markets = (businessProcessJson.businessProcess[0]).marketGroup;
		vm.selectedBusiness = MarketGroupSelectModalService.business[0].key;
		vm.selectedMarketGroup =  MarketGroupSelectModalService.business[0].marketGroup[0].key;
		MarketGroupSelectModalService.selectedMarketGroup = vm.selectedMarketGroup;
		MarketGroupSelectModalService.selectedBusiness = vm.selectedBusiness;
	};
	
	
	this.hasAccessToMultipleBusinessProcess = function(businessProcessJson){
		return _.keys(businessProcessJson.businessProcess).length > 1; 
	};
	
	this.hasAccessToMultipleMarketGroups = function(businessProcessJson){
		return _.keys((businessProcessJson.businessProcess[0]).marketGroup).length > 1;
	};
	
	this.resolve = function() {
		MarketGroupSelectModalService.selectedMarketGroup = this.selectedMarketGroup;
		MarketGroupSelectModalService.selectedBusiness = this.selectedBusiness;
		MarketGroupSelectModalService.business =vm.business;
		MarketGroupSelectModalService.markets = vm.markets;
		$uibModalInstance.close();
	};
	
	
	this.loadMarketGroup = function() {
		$.each(vm.business,function(index,obj){
			if(obj.key == vm.selectedBusiness){
				vm.markets = obj.marketGroup;
			}
		});
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