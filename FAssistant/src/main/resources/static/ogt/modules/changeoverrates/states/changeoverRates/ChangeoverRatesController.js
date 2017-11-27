'use strict';

angular.module('ChangeoverRatesModule').controller('ChangeoverRatesController', 
	['$scope','ChangeoverRatesService','$timeout','modelsList','WcAlertConsoleService','$translate','WcHttpEndpointPrototype','MarketGroupSelectModalService',
	 function($scope,ChangeoverRatesService,$timeout,modelsList,WcAlertConsoleService,$translate,WcHttpEndpointPrototype,MarketGroupSelectModalService){
		var vm = this;
		vm.modelsList =modelsList;
		vm.markets = [];
		vm.models = [];
		vm.vehicleLines =[];
		vm.modelYears =[];
		vm.selectedMarket=undefined;
		vm.selectedModel=undefined;
		vm.selectedModelYear=undefined;
		vm.isDisplayTable=false;
		vm.showEditButton=false;
		vm.showEditTextbox = false;
		
		vm.selectedBusinessProcess = MarketGroupSelectModalService.selectedBusiness;
		vm.selectedMarketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		
		vm.markets = ChangeoverRatesService.getMarkets(vm.modelsList);
		var marketsObj=vm.modelsList;
		if(marketsObj.length == 1) {
			vm.selectedMarket = marketsObj[0].key;	
			ChangeoverRatesService.selectedMarket=vm.selectedMarket ;
			ChangeoverRatesService.getModelsForSelectedMarket(ogtVars.vehicleLines,vm.selectedMarket).then(angular.bind(vm, function(response){
				vm.models=response;
			}));




		}
		vm.loadModels=function(){
			$scope.$broadcast('display-tabs',false);
			vm.selectedBusinessProcess = MarketGroupSelectModalService.selectedBusiness;
			vm.selectedMarketGroup = MarketGroupSelectModalService.selectedMarketGroup;
			return ChangeoverRatesService.getModelsForSelectedMarket(vm.modelsList,vm.selectedMarket).then(angular.bind(vm, function(response){
				vm.models=response;
				vm.selectedModel = '';
				vm.selectedModelYear = '';
				vm.modelYears =[];
				vm.isDisplayTabs = false;
				vm.isFormSubmitted = false;
				$scope.$broadcast('isAuthorized', MarketGroupSelectModalService.isAuthorisedParam(vm.selectedMarket)+":WRITE");
			
			}))
		};
		
		vm.loadModelYears=function(){
			vm.selectedModelYear = '';
			$scope.$broadcast('display-tabs',false);
				return  ChangeoverRatesService.getModelYears(vm.modelsList,vm.selectedMarket,vm.selectedModel).then(angular.bind(vm, function(response){
					vm.modelYears= response;
					var modelYearsObj=vm.modelYears;
					var maxModelYear = 0;
					vm.isDisplayTabs = false;
				
					angular.forEach(modelYearsObj,function(modelYearOb, modelYearIndex) {
						if(parseFloat(maxModelYear) < parseFloat(modelYearOb.modelYear)) {
							maxModelYear = parseFloat(modelYearOb.modelYear);
						}
					});
					ChangeoverRatesService.currentModelYear = maxModelYear;
				}))
				
		};

		vm.orderByValue = function (value) {
		        return value;
		    }; 
		    
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		vm.loadContent = function(selectedModelYear){
			if(selectedModelYear == null) {
				vm.isDisplayTable=false;
			} else {
				return ChangeoverRatesService.getChangeoverRates(selectedModelYear).then(angular.bind(vm,function(response){
					
					$scope.changeoverRates = response.ChangeoverRates;
					if($scope.changeoverRates != undefined && $scope.changeoverRates != null)
					{
						angular.forEach($scope.changeoverRates, function(arrElement, index){
							arrElement.changeoverRatesFlag = false;
						});
						
					}
					else{
						$scope.changeoverRates ={};
					}
					vm.isDisplayTable=true;
					vm.showEditButton = false;
				}));
				
			}
		};
		
		vm.hideAndPopulateDataTable = function(selectedModelYear) {
			// To Re-render the data table, used the timeout function..
			vm.isDisplayTable=false;
			 $timeout(function() {	
				 vm.loadContent(selectedModelYear);
	         },0);
		};
		
		$scope.$on("display-tabs", angular.bind(vm,function(event, data) {
			vm.isDisplayTable = data;
		}));
		
		vm.onClickSave =  function(){
			vm.isDisplayTable=false;
			var sum = 0;
			$timeout(function() {	
				angular.forEach($scope.changeoverRates, function(arrElement, index){
					arrElement.changeoverrate = arrElement.changeoverrateEdit;
					if(arrElement.changeoverrate != undefined && arrElement.changeoverrate != null && arrElement.changeoverrate != '')
					{
						sum = sum + parseFloat(arrElement.changeoverrate);
					}
				});
				if(sum>1)
				{
					WcAlertConsoleService.addMessage({
						message: $translate.instant('application.errors.changeoverRateSumError'),
						type: 'danger',
						multiple: false
					});
					vm.setEditableFlag(true);
					vm.showEditButton = true;
				}
				else{
					var rest = new WcHttpEndpointPrototype('changeoverRates/saveChangeoverRates');
					return rest.post($scope.changeoverRates).then(angular.bind(this, function(response) {
						$scope.changeoverRates = response.data;
						if($scope.changeoverRates != undefined && $scope.changeoverRates != null)
						{
							angular.forEach($scope.changeoverRates, function(arrElement, index){
								arrElement.changeoverRatesFlag = false;
							});
							
						}
						else{
							$scope.changeoverRates ={};
						}
						vm.isDisplayTable=true;
						vm.showEditButton = false;
					WcAlertConsoleService.addMessage({
						message: $translate.instant('application.success.changeoverRatesSaveSucess'),
						type: 'success',
						multiple: false
					});
				vm.setEditableFlag(false);
					}), function(error) {
						WcAlertConsoleService.addMessage({
							message: $translate.instant('application.errors.changeoverRateSaveError', {error: error}),
							type: 'danger',
							multiple: false,
							removeErrorOnStateChange: true
						});
					
					});
				}
			},0);
		}
		
		vm.onClickCancel =  function(){
			vm.isDisplayTable=false;
			 $timeout(function() {	
				 vm.setEditableFlag(false);
	         },0);
		}
		vm.setEditableFlag = function(isEditable){
			if($scope.changeoverRates != undefined && $scope.changeoverRates != null)
			{
			return ChangeoverRatesService.setEditableChangeoverRatesFlag($scope.changeoverRates,isEditable).then(angular.bind(vm,function(response){
				vm.isDisplayTable=true;
				$scope.changeoverRates = response;
			}));
			}
			else{
				$scope.changeoverRates ={};
			}
		
		}
		vm.onClickEdit = function(){
			vm.showEditTextbox = true;
			}
}]);
