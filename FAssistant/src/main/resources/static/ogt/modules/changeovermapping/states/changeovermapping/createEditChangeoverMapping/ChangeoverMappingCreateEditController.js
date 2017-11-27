'use strict';

angular.module('ChangeoverMappingModule').controller('ChangeoverMappingCreateEditController', 
		['$scope','ChangeoverMappingService','$timeout','marketsList','WcAlertConsoleService','$translate','WcHttpEndpointPrototype','$state','$filter','UserService','MarketGroupSelectModalService',
		 function($scope,ChangeoverMappingService,$timeout,marketsList,WcAlertConsoleService,$translate,WcHttpEndpointPrototype,$state,$filter,UserService,MarketGroupSelectModalService){
			var vm = this;
			vm.IS_MAPPED_STRING = " is mapped to "
				vm.marketsList =marketsList;
			vm.markets = ChangeoverMappingService.markets;
			vm.models = ChangeoverMappingService.models;
			vm.modelYears =ChangeoverMappingService.modelYears;
			vm.selectedMarket=ChangeoverMappingService.selectedMarket;
			vm.selectedModel=ChangeoverMappingService.selectedModel;
			vm.selectedModelYear=ChangeoverMappingService.selectedModelYear;
			vm.selectedFamily = ChangeoverMappingService.selectedFamily;
			vm.changeovermappings = ChangeoverMappingService.changeovermappings;
			vm.selectedCheckBoxObjsMapped = {};
			vm.mappedPmyFeatures = [];
			vm.mappedCmyFeatures = [];
			vm.unMappedPmyFeatures = [];
			vm.unMappedCmyFeatures = [];
			vm.unMappedCmyFeaturesCopy=[];
			vm.selectedPmyFeature = '';
			vm.selectedCmyFeature = '';	
			vm.mappedFeatures = [];
			vm.pmyFamilies = [];
			vm.cmyFamilies = [];
			vm.isCmyPmyFamiliesPresent = true;
			vm.isPmyFamiliesPresent = true;
			vm.isCmyFamiliesPresent = true;
			vm.isPmyPresent = true;
			$scope.isLoadingText = false;
			vm.mappedFamilies = [];
			vm.isDisplayTable=false;
			vm.user = '';
			vm.mycoMappingJson = {
					loggedInUser:'',
					mappingsToBeDeleted :[],
					mappingsToBeSaved : []
			}
			UserService.getUserInformation().then(angular.bind(this, function(userObj) {
				vm.user  = userObj.userId;
			}));
			if(vm.changeovermappings!=undefined)
			{
				vm.mappedFamilies = vm.changeovermappings.mappedFamilies;
				vm.pmyFamilies = vm.changeovermappings.pmyFamilies;
				vm.cmyFamilies = vm.changeovermappings.cmyFamilies;
			}
			
			vm.typeFamilyPmy = undefined;
			vm.typeFamilyCmy = undefined;
			vm.typeFeatureCmy = undefined;
			vm.typeFeaturePmy = undefined;
			vm.search = {
					pmyFamilyQuery:'',
					cmyFamilyQuery:'',
					pmyFeatureQuery:'',
					cmyFeatureQuery:''
			}
			$scope.clickSearch = function(){
				$scope.cmyFamilySearch = vm.search.cmyFamilyQuery;
				$scope.pmyFamilySearch = vm.search.pmyFamilyQuery;
				$scope.cmyFeatureSearch = vm.search.cmyFeatureQuery;
				$scope.pmyFeatureSearch = vm.search.pmyFeatureQuery;
			}
			$scope.clearSearch = function(id){
				if(id=='pmyFamilyQ'){
					vm.search.pmyFamilyQuery='';
					$scope.pmyFamilySearch = '';
					vm.typeFamilyPmy = undefined;
				}
				else if(id == 'cmyFamilyQ'){
					vm.search.cmyFamilyQuery = '';
					$scope.cmyFamilySearch ='';
					vm.typeFamilyCmy = undefined;
				}
				else if(id == 'cmyFeatureQ'){
					vm.search.cmyFeatureQuery = '';
					$scope.cmyFeatureSearch ='';
					vm.typeFeatureCmy = undefined;
				}
				else if(id == 'pmyFeatureQ'){
					vm.search.pmyFeatureQuery = '';
					$scope.pmyFeatureSearch ='';
					vm.typeFeaturePmy = undefined;
				}
			}
			$scope.keyedIn = function(element){
				if(element =='pmyFamilyQ')
					vm.typeFamilyPmy = "typed";
				else if(element =='cmyFamilyQ')
					vm.typeFamilyCmy = "typed";
				else if(element =='pmyFeatureQ')
					vm.typeFeaturePmy = "typed";
				else if(element =='cmyFeatureQ')
					vm.typeFeatureCmy = "typed";
			}



			
			vm.loadFeatures = function(selectedPmyFamily,selectedCmyFamily){
				if(selectedPmyFamily == undefined || selectedPmyFamily ==null || selectedCmyFamily == undefined || selectedCmyFamily ==null)
					return;
				vm.mappedFeatures = [];
				vm.unMappedPmyFeatures = [];
				vm.unMappedCmyFeatures = [];
				vm.mappedPmyFeatures = [];
				vm.mappedCmyFeatures = [];
				vm.selectedCheckBoxObjsMapped = [];
				vm.mycoMappingJson = {
						loggedInUser:'',
						mappingsToBeDeleted :[],
						mappingsToBeSaved : []
				}
				angular.forEach(vm.mappedFamilies, function(arrElement, index){
					if(arrElement.pmyFamily.key == selectedPmyFamily && arrElement.cmyFamily.key == selectedCmyFamily)
						var mappedFeatures = arrElement.mappedFeatures;
					angular.forEach(mappedFeatures, function(mappedFeature, index){
						var selectedMappingValue = mappedFeature.pmyFeature.name + vm.IS_MAPPED_STRING +  mappedFeature.cmyFeature.name;
						var selectedObj = {
								"mycoKey":mappedFeature.mycoKey,
								"value":selectedMappingValue,
								"pmyFeature":mappedFeature.pmyFeature,
								"cmyFeature":mappedFeature.cmyFeature
						}
						var index = vm.mappedFeatures.indexOf(selectedObj);
						if(index == -1) {
							vm.mappedFeatures.push(selectedObj);
						}
						});
				});
				
				angular.forEach(vm.mappedFeatures, function(mappedFeature, index){
					vm.mappedPmyFeatures.push(mappedFeature.pmyFeature);
					vm.mappedCmyFeatures.push(mappedFeature.cmyFeature);
				});
				angular.forEach(vm.changeovermappings.pmyFamilies, function(arrFamilyElement, index){
					if(arrFamilyElement.key == selectedPmyFamily)
					{
						angular.forEach(arrFamilyElement.features, function(pmyFeatureObj, index){
							var isFeatureElementPresent = $filter('filter')(vm.mappedPmyFeatures, { key : pmyFeatureObj.key  }, true)[0];
							if(!isFeatureElementPresent)
								vm.unMappedPmyFeatures.push(pmyFeatureObj);
						})
					}
				});

				
					angular.forEach(vm.changeovermappings.cmyFamilies, function(arrFamilyElement, index){
						if(arrFamilyElement.key == selectedCmyFamily)
						{
							vm.unMappedCmyFeatures = arrFamilyElement.features;
							vm.unMappedCmyFeaturesCopy = arrFamilyElement.features;
						}
					});
					if(vm.unMappedPmyFeatures.length ==0){
						vm.unMappedCmyFeatures =[];
					}
			};
			
			
			
			if(ChangeoverMappingService.selectedFamily != undefined)
			{
				vm.isDisplayTable=true;
				vm.selectedPmyFamily = ChangeoverMappingService.selectedFamily.pmyFamily.key;
				vm.selectedCmyFamily = ChangeoverMappingService.selectedFamily.cmyFamily.key;
				vm.loadFeatures(vm.selectedPmyFamily,vm.selectedCmyFamily);
			}

			vm.isAllOpen = false;
			vm.isopen = false;
			vm.markets =ChangeoverMappingService.getMarkets(vm.marketsList);
			var marketsObj=vm.markets;
			if(vm.selectedMarket == undefined){
				if(marketsObj.length == 1) {
					vm.selectedMarket = marketsObj[0].key;	
					vm.isDisplayTable=false;
					ChangeoverMappingService.selectedMarket=vm.selectedMarket ;
					ChangeoverMappingService.getModels(vm.marketsList,vm.selectedMarket).then(angular.bind(vm, function(response){
						vm.models=response;
					}));
				}
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
			if(vm.selectedModelYear != '' && vm.selectedModelYear != undefined )
			{
				vm.isDisplayTable=true;
			}
			vm.orderByValue = function (value) {
				return value;
			}; 

			vm.hideAndPopulateDataTable = function(selectedModelYear) {
				vm.isDisplayTable=false;
				$timeout(function() {	
					$scope.isLoadingText = true;
					vm.loadContent(selectedModelYear);
					$scope.isLoadingText = false;
				},0);
			};


			vm.resetArrays = function(){
				vm.selectedCheckBoxObjsMapped = [];
				vm.mappedPmyFeatures = [];
				vm.mappedCmyFeatures = [];
				vm.unMappedPmyFeatures = [];
				vm.unMappedCmyFeatures = [];
				vm.selectedPmyFeature = '';
				vm.selectedCmyFeature = '';	
				vm.mappedFeatures = [];
				vm.selectedPmyFamily = '';
				vm.selectedCmyFamily = '';
				vm.mycoMappingJson = {
						loggedInUser:'',
						mappingsToBeDeleted :[],
						mappingsToBeSaved : []
				}
			}
			vm.loadContent = function(selectedModelYear){
				if(selectedModelYear == null) {
					vm.isDisplayTable=false;
				} else {
					return ChangeoverMappingService.getChangeoverMappings(selectedModelYear).then(angular.bind(vm,function(response){
						vm.resetArrays();
						$scope.changeovermappings = response.myco;
						if($scope.changeovermappings == undefined){
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
						vm.checkPmy($scope.changeovermappings);
						if( vm.isPmyPresent == false){
							vm.isDisplayTable=false;
							return;
						}
						vm.checkCmyPmyFamilies($scope.changeovermappings);
						if(vm.isCmyPmyFamiliesPresent == false){
							vm.isDisplayTable=false;
							return;
						}
						vm.checkCmyFamilies($scope.changeovermappings);
						if(vm.isCmyFamiliesPresent == false){
							vm.isDisplayTable=false;
							return;
						}
						vm.checkPmyFamilies($scope.changeovermappings);
						if(vm.isPmyFamiliesPresent == false){
							vm.isDisplayTable=false;
							return;
						}
							
						var mappedFamilies = $scope.changeovermappings.mappedFamilies;
						if($scope.changeovermappings.mappedFamilies != undefined && $scope.changeovermappings.mappedFamilies != null)
						{
							angular.forEach($scope.changeovermappings.mappedFamilies, function(arrElement, index){
								arrElement.changeoverRatesFlag = false;
								arrElement.cmyFamily.open = false;
							});
							vm.changeovermappings = $scope.changeovermappings;
							vm.loadFamilies();
							vm.isDisplayTable=true;
						}
						else{
							$scope.changeovermappings ={};
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

			vm.loadFamilies = function(){
				vm.mappedFamilies = vm.changeovermappings.mappedFamilies;
				vm.pmyFamilies = vm.changeovermappings.pmyFamilies;
				vm.cmyFamilies = vm.changeovermappings.cmyFamilies;
			}
			vm.addMappings = function(){
				if(vm.selectedPmyFeature == undefined || vm.selectedCmyFeature == undefined ) {
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.noMappingToAddError'),
						type: 'warning',
						multiple: false
					});
					return false;
				}
				var pmyFeature;
				var cmyFeature;
				$.each(vm.unMappedPmyFeatures,function(index, pmyObj) {
					if(vm.selectedPmyFeature ===  pmyObj.key) {
						pmyFeature = pmyObj;
						return false;
					}
				});
				$.each(vm.unMappedCmyFeatures,function(index, cmyObj) {
					if(vm.selectedCmyFeature ===  cmyObj.key) {
						cmyFeature = cmyObj;
						return false;
					}
				});
				var selectedMappingValue = pmyFeature.name + vm.IS_MAPPED_STRING + cmyFeature.name;
				var selectedObj = {
						"value":selectedMappingValue,
						"pmyFeature":pmyFeature,
						"cmyFeature":cmyFeature
				}
				vm.newlyMappedObj = {
						"autoMappingFlag": "N",
						"changeOverTypeCode": "MY",
						"pmyFeatureKey":pmyFeature.key,
						"cmyFeatureKey":cmyFeature.key
				}
				vm.mappedFeatures.push(selectedObj);
				vm.mycoMappingJson.mappingsToBeSaved.push(vm.newlyMappedObj);
				$.each(vm.unMappedPmyFeatures,function(index, pmyObj) {
					if(vm.selectedPmyFeature ===  pmyObj.key) {
						vm.unMappedPmyFeatures.splice(index, 1);
						return false;
					}
				});
				if(vm.unMappedPmyFeatures.length ==0)
					{
					vm.unMappedCmyFeatures = [];
					}
				/*$.each(vm.unMappedCmyFeatures,function(index, cmyObj) {
					if(vm.selectedCmyFeature ===  cmyObj.key) {
						vm.unMappedCmyFeatures.splice(index, 1);
						return false;
					}
				});*/
			}
			vm.removeMappings = function(){
				var isMappingsSelected = false;
				var i;
				for(var prop in vm.selectedCheckBoxObjsMapped) {
					if(vm.selectedCheckBoxObjsMapped.hasOwnProperty(prop) && vm.selectedCheckBoxObjsMapped[prop] == true) {
						isMappingsSelected = true;
						vm.mappedFeatures = $.grep(vm.mappedFeatures, function(mappedObj, index) {	//grep will remove the element which has return true.
							if(mappedObj.value === prop) {
								vm.unMappedPmyFeatures.push(mappedObj.pmyFeature);
								vm.unMappedCmyFeatures = vm.unMappedCmyFeaturesCopy;
								vm.mycoMappingJson.mappingsToBeSaved = $.grep(vm.mycoMappingJson.mappingsToBeSaved,function(obj,i){
									return obj.pmyFeatureKey === mappedObj.pmyFeature.key;
								},true);
								// compare with initial manual mapped entities for deletion.
								var isFeatureElementPresent = $filter('filter')(vm.mappedFeatures, { value : mappedObj.value  }, true)[0];
								if(isFeatureElementPresent){
									vm.mycoMappingJson.mappingsToBeDeleted.push(isFeatureElementPresent.mycoKey);
								}
								return true;
							}
						}, true);
						delete vm.selectedCheckBoxObjsMapped[prop];
					}
				}
				if(!isMappingsSelected) {
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.noMappingToRemoveError'),
						type: 'warning',
						multiple: false
					});
				}

			}

			vm.saveMappings = function() {
				if(vm.mycoMappingJson.mappingsToBeSaved.length>0 || vm.mycoMappingJson.mappingsToBeDeleted.length>0){
					vm.mycoMappingJson.loggedInUser =vm.user;
					console.log('vm.mycoMappingJson -- ' + JSON.stringify(vm.mycoMappingJson,null,4));
					$scope.isLoadingText = true;
					ChangeoverMappingService.saveOrDelete(vm.mycoMappingJson).then(angular.bind(this,function(result) {
						if(result.exception)
						{
							WcAlertConsoleService.addMessage({
								message: $translate.instant('application.errors.changeoverMappingSaveFailure'),
								type: 'warning',
								multiple: false
							});
							$scope.isLoadingText = false;
							$("html, body").animate({ scrollTop: 0 }, "slow");
							return false;
						}
						vm.hideAndPopulateDataTable(vm.selectedModelYear);
						$scope.isLoadingText = false;
						WcAlertConsoleService.addMessage({
							message: $translate.instant('application.success.changeoverMappingSaveSuccess'),
							type: 'success',
							multiple: false
						});
					}))
				}
				else{
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.noNewMappingsToSave'),
						type: 'warning',
						multiple: false
					});
					$("html, body").animate({ scrollTop: 0 }, "slow");
				}
			};
			vm.cancel = function(){
				$state.go('changeover-mapping-list',{'selectedMarket':vm.selectedMarket,'selectedModel':vm.selectedModel,'selectedModelYear':vm.selectedModelYear,
					'markets':vm.markets,
					'models':vm.models,
					'modelYears':vm.modelYears});
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
		}]);
