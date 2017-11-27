'use strict';

angular.module('EntityMappingModule').controller('EntityMappingListController', ['EntityMappingListService','$state','$q','WcAlertConsoleService','$translate','$scope','MarketGroupSelectModalService', 
                                                                                 function(EntityMappingListService,$state,$q,WcAlertConsoleService,$translate,$scope,MarketGroupSelectModalService) {
	
	var vm=this;
	vm.isDisplayDataTable= false;
	vm.populateDataTable=[];
	vm.vehiclesToUpdate = [];
	vm.selectedMarket = undefined;
	vm.selectedModel = undefined;
	vm.models =[];	
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	
	$scope.isLoadingIndicator = true;
	
	function getDropdownValues(){
		var deferred = $q.defer();
		EntityMappingListService.getMarketsModelsModelYear().then(function(result){
			vm.markets = result.markets;
			deferred.resolve("ok");
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}
	getDropdownValues().then(function(success){
		$scope.isDataReceivedFromOgm = true;
		$scope.isLoadingIndicator = false;
	},function(error){
		WcAlertConsoleService.addMessage({
			message: $translate.instant('application.errors.marketDropdownServiceError', {error: error}),
			type: 'danger',
			multiple: false,
			removeErrorOnStateChange: true
		});
		$scope.isLoadingIndicator = false;
	});
	
	vm.loadModels = function(){
		vm.models = [];
		vm.selectedModel = '';
		vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		$.each(vm.markets,function(index,market){
			if(market.key === vm.selectedMarket.key){
				$.each(market.models,function(index,model){
					if(model.key!=="ALL"){
						vm.models.push(model);
					}
				});
			}
		});
	}
	
	this.searchEntityMappingList = function(){
		if(!isEmpty(vm.selectedMarket) && !isEmpty(vm.selectedModel))
		{
			$scope.isLoadingIndicator = true;
			return EntityMappingListService.getEntityMappingList(vm.selectedMarket,vm.selectedModel).then(angular.bind(this, function(response) {
				$scope.isLoadingIndicator = false;
				vm.populateDataTable = response;
				vm.isDisplayDataTable= true;
			}));
		} else{
			vm.isDisplayDataTable= false;
		}
	};
	
	function isEmpty(val){
	    return (val === undefined || val == null || val.length <= 0) ? true : false;
	};
	
	this.addEditEntityMapping = function(){
		EntityMappingListService.selectedMarket = vm.selectedMarket;
		EntityMappingListService.selectedModel = vm.selectedModel;
		$state.go('add-edit-entity-mapping');
	};
	
	this.hideDataTable=function()
	{
		vm.isDisplayDataTable= false;
	};
	
	$scope.$watch('isLoadingIndicator',function(){
		if($scope.isLoadingIndicator == true){
			$("#loading-cover").show().animate({
                opacity: 1
            }, 300), $("#loading-indicator").show().animate({
                opacity: 1
            }, 300)
		}
		else{
			 $("#loading-indicator").hide().animate({
                 opacity: 0
             }, 10), $("#loading-cover").hide().animate({
                 opacity: 0
             }, 10)
		}
	});
}]);