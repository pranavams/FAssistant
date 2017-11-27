'use strict';

angular.module('ChangeoverMappingModule').controller('ChangeoverMappingController', 
	['$scope','ChangeoverMappingService','$timeout','marketsList','WcAlertConsoleService','$translate','WcHttpEndpointPrototype','$state','$stateParams','$q','MarketGroupSelectModalService',
	 function($scope,ChangeoverMappingService,$timeout,marketsList,WcAlertConsoleService,$translate,WcHttpEndpointPrototype,$state,$stateParams,$q,MarketGroupSelectModalService){
		var vm = this;
		vm.marketsList =marketsList;
		vm.markets = $stateParams.markets;
		vm.models = $stateParams.models;
		vm.modelYears =$stateParams.modelYears;
		vm.selectedMarket=$stateParams.selectedMarket;
		vm.selectedModel=$stateParams.selectedModel;
		vm.selectedModelYear=$stateParams.selectedModelYear;
		vm.isDisplayTable=false;
		vm.isAllOpen = false;
		vm.isopen = false;
		vm.isCmyPmyFamiliesPresent = true;
		vm.isPmyFamiliesPresent = true;
		vm.isCmyFamiliesPresent = true;
		vm.isPmyPresent = true;
		vm.disableDifferences = false;
		vm.disableAll = false;
		vm.changeovermappings = {}
		vm.changeovermappingsAll = {};
		vm.changeovermappingsDifferences = {}; 
		$scope.isLoadingText = false;
		vm.markets =ChangeoverMappingService.getMarkets(vm.marketsList);
		var marketsObj=vm.markets;
		vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		if(marketsObj.length == 1) {
			vm.selectedMarket = marketsObj[0].key;	
			vm.isDisplayTable=false;
			ChangeoverMappingService.selectedMarket=vm.selectedMarket ;
			ChangeoverMappingService.getModels(vm.marketsList,vm.selectedMarket).then(angular.bind(vm, function(response){
				vm.models=response;
			}));
		}

		vm.loadModels=function(){
			$scope.$broadcast('display-tabs',false);
			return ChangeoverMappingService.getModels(vm.marketsList,vm.selectedMarket).then(angular.bind(vm, function(response){
				vm.models=response;
				vm.selectedModel = '';
				vm.selectedModelYear = '';
				vm.modelYears =[];
				vm.isDisplayTabs = false;
				vm.isDisplayTable=false;
				vm.isFormSubmitted = false;
				$scope.$broadcast('isAuthorized',MarketGroupSelectModalService.isAuthorisedParam(vm.selectedMarket)+":WRITE");
			}));
		};

		vm.loadModelYears=function(){
			vm.selectedModelYear = '';
			$scope.$broadcast('display-tabs',false);
			return  ChangeoverMappingService.getModelYears(vm.marketsList,vm.selectedMarket,vm.selectedModel).then(angular.bind(vm, function(response){
				vm.modelYears= response;
				var modelYearsObj=vm.modelYears;
				var maxModelYear = 0;
				vm.isDisplayTabs = false;
				vm.isDisplayTable=false;
				angular.forEach(modelYearsObj,function(modelYearOb, modelYearIndex) {
					if(modelYearOb.modelYear!= 'ALL' && parseFloat(maxModelYear) < parseFloat(modelYearOb.modelYear)) {
						maxModelYear = parseFloat(modelYearOb.modelYear);
					}
				});
				ChangeoverMappingService.currentModelYear = maxModelYear;
			}))

		};

		vm.orderByValue = function (value) {
			return value;
		}; 
		
		vm.hideAndPopulateDataTable = function(selectedModelYear) {
			// To Re-render the data table, used the timeout function..
			vm.isDisplayTable=false;
			$timeout(function() {	
				vm.loadContent(selectedModelYear);
			},0);
		};
		if(vm.selectedModelYear){
			vm.hideAndPopulateDataTable(vm.selectedModelYear);
		}
		vm.editMappings = function(mappings) {
			ChangeoverMappingService.selectedMarket = vm.selectedMarket;
			ChangeoverMappingService.selectedModel = vm.selectedModel;
			ChangeoverMappingService.selectedModelYear = vm.selectedModelYear;
			ChangeoverMappingService.selectedFamily = mappings;
			ChangeoverMappingService.changeovermappings = vm.changeovermappings;
				$state.go('create-edit-changeover-mapping');
			
		};
		
			    $scope.toggle = function(state) {
			      vm.changeovermappings.mappedFamilies.forEach(function(e) {
			        e.cmyFamily.open = state;
			      });
			    }
			  
		vm.loadContent = function(selectedModelYear){
			if(selectedModelYear == null) {
				vm.isDisplayTable=false;
			} else {
				return ChangeoverMappingService.getChangeoverMappings(selectedModelYear).then(angular.bind(vm,function(response){
					vm.changeovermappings = response.myco;
					ChangeoverMappingService.changeovermappingsAll = response.myco;	
					ChangeoverMappingService.changeovermappingsDifferences = response.myco;
					if(vm.changeovermappings == undefined){
						vm.isDisplayTable=false;
						WcAlertConsoleService.addMessage({
							message: $translate.instant('conflictNotification.errorMYCORetrieve'),
							type: 'warning',
							multiple: false
						});
						return;
					}
					vm.isCmyPmyFamiliesPresent = true;
					vm.isPmyFamiliesPresent = true;
					vm.isCmyFamiliesPresent = true;
					vm.isPmyPresent = true;
					vm.checkPmy(vm.changeovermappings);
					if( vm.isPmyPresent == false){
						vm.isDisplayTable=false;
						return;
					}
					vm.checkCmyPmyFamilies(vm.changeovermappings);
					if(vm.isCmyPmyFamiliesPresent == false){
						vm.isDisplayTable=false;
						return;
					}
					vm.checkCmyFamilies(vm.changeovermappings);
					if(vm.isCmyFamiliesPresent == false){
						vm.isDisplayTable=false;
						return;
					}
					vm.checkPmyFamilies(vm.changeovermappings);
					if(vm.isPmyFamiliesPresent == false){
						vm.isDisplayTable=false;
						return;
					}
					var mappedFamilies = vm.changeovermappings.mappedFamilies;
					
					if(vm.changeovermappings.mappedFamilies != undefined && vm.changeovermappings.mappedFamilies != null)
					{
						angular.forEach(vm.changeovermappings.mappedFamilies, function(arrElement, index){
							arrElement.changeoverRatesFlag = false;
							arrElement.cmyFamily.open = false;
						});
						vm.isDisplayTable=true;
						vm.disableDifferences = true;
						vm.disableAll = false;
					}
					else{
						vm.changeovermappings ={};
						vm.isDisplayTable=false;
						WcAlertConsoleService.addMessage({
							message: $translate.instant('conflictNotification.noDataToShowMYCO'),
							type: 'warning',
							multiple: false
						});
					}
					
				}));

			}
		};
		vm.checkPmy=function(changeovermappings){
			if(changeovermappings.pmy == undefined || changeovermappings.pmy == '')
				{
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.noDataPmyModelMyco'),
					type: 'warning',
					multiple: false
				});
				vm.isDisplayTable=false;
				vm.isPmyPresent = false;
				return;
				}
			
		}
		vm.checkCmyFamilies=function(changeovermappings){
			if(changeovermappings.cmyFamilies == undefined || changeovermappings.cmyFamilies.length ==0)
				{
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.noDataCmyFamilyMyco'),
					type: 'warning',
					multiple: false
				});
				vm.isDisplayTable=false;
				vm.isCmyFamiliesPresent = false;
				return;
				}
			
		}
		
		vm.checkPmyFamilies=function(changeovermappings){
			if(changeovermappings.pmyFamilies == undefined || changeovermappings.pmyFamilies.length ==0)
				{
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.noDataPmyFamilyMyco'),
					type: 'warning',
					multiple: false
				});
				vm.isDisplayTable=false;
				vm.isPmyFamiliesPresent = false;
				return;
				}
			
		}
		vm.checkCmyPmyFamilies=function(changeovermappings){
			if(changeovermappings.pmyFamilies == undefined || changeovermappings.pmyFamilies.length ==0)
				{
				if(changeovermappings.cmyFamilies == undefined || changeovermappings.cmyFamilies.length ==0){
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.noDataPmyCmyFamilyMyco'),
					type: 'warning',
					multiple: false
				});
				vm.isDisplayTable=false;
				vm.isCmyPmyFamiliesPresent = false;
				return;
				}
				}
		}
		vm.filterMappings = function(filterFlag){
			var deferred= $q.defer();
			$scope.isLoadingText = true;
			vm.isDisplayTable=false;
			if(filterFlag == 'A'){
				vm.changeovermappings = ChangeoverMappingService.changeovermappingsAll;
				vm.isDisplayTable=true;
			}
			else if(filterFlag == 'D'){
				if(ChangeoverMappingService.changeovermappingsDifferences.mappedFamilies != undefined && ChangeoverMappingService.changeovermappingsDifferences.mappedFamilies != null)
				{
					angular.forEach(ChangeoverMappingService.changeovermappingsDifferences.mappedFamilies, function(arrElement, index){
						arrElement.changeoverRatesFlag = false;
						arrElement.cmyFamily.open = false;
						if(arrElement.pmyFamily.code == arrElement.cmyFamily.code){
							var isDifferencesPresent = false;
							angular.forEach(arrElement.mappedFeatures, function(mappedFeature, index){
								if(mappedFeature.pmyFeature.code != mappedFeature.cmyFeature.code)
									isDifferencesPresent = true;
							});
							if(isDifferencesPresent == true)
								{
								ChangeoverMappingService.changeovermappingsDifferences.mappedFamilies.splice(index,1);
								}
						}
						else{
							ChangeoverMappingService.changeovermappingsDifferences.mappedFamilies.splice(index,1);
						}
						
					});
					vm.changeovermappings = ChangeoverMappingService.changeovermappingsDifferences;
					vm.isDisplayTable=true;
					vm.disableDifferences = false;
					vm.disableAll = true;
				}
			}
			$scope.isLoadingText = false;
			return deferred.promise;
		}	
		$scope.$watch('isLoadingText',function(){
			if($scope.isLoadingText == true){
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
		})	
	}]);
