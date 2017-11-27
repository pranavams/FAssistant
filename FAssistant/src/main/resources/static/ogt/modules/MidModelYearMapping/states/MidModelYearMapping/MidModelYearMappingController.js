'use strict';

angular.module('MidModelYearMappingModule')
	.controller('MidModelYearMappingController',['MidModelYearMappingService','$state','$timeout','$scope','ModelsFactory','$stateParams','$translate','WcAlertConsoleService','MarketGroupSelectModalService',MidModelYearMappingController]);

function MidModelYearMappingController(MidModelYearMappingService,$state,$timeout,$scope,ModelsFactory,$stateParams,$translate,WcAlertConsoleService,MarketGroupSelectModalService){
	var vm = this;
	vm.markets;
	vm.models;
	vm.modelYears;
	vm.families;
	vm.selectedMarket;
	vm.selectedModel;
	vm.selectedModelYear;
	vm.isDisplayTable=false;
	vm.mappedFamilies;
	vm.selectedFamily;
	vm.familiesData;
	var init = init;
	vm.getTripletDetailsFromService = getTripletDetailsFromService;
	vm.getFamilyFetauresData = getFamilyFetauresData;
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	init();
	function init(){
		if($stateParams.from === "EditScreen")
			vm.getTripletDetailsFromService();
		else{
			$scope.isLoadingIndicator = true;
			MidModelYearMappingService.getMarketInformation().then(function(result){
				vm.markets = result.markets;
				MidModelYearMappingService.markets = vm.markets;
				$scope.isLoadingIndicator = false;
			},function(error){
				$scope.isLoadingIndicator = false;
			});
		}
	}
	function getTripletDetailsFromService(){
		vm.markets = MidModelYearMappingService.markets;
		vm.models = MidModelYearMappingService.models;
		vm.modelYears = MidModelYearMappingService.modelYears;
		vm.selectedMarket=MidModelYearMappingService.selectedMarket;
		vm.selectedModel=MidModelYearMappingService.selectedModel;
		vm.selectedModelYear=MidModelYearMappingService.selectedModelYear;
		vm.getFamilyFetauresData();
	}
	vm.getModels = function(){
		vm.models = ModelsFactory.getModels(vm.markets,vm.selectedMarket);
		MidModelYearMappingService.models = vm.models;
		vm.modelYears=[];
		vm.selectedModelYear="";
		vm.selectedModel="";
		vm.isDisplayTable = false;
	}
	
	vm.getModelYears = function(){
		vm.modelYears = ModelsFactory.getModelYears(vm.models,vm.selectedModel);
		MidModelYearMappingService.modelYears = vm.modelYears;
		vm.selectedModelYear="";
		vm.isDisplayTable = false;
	}
	
	function getFamilyFetauresData(){
		$scope.isLoadingIndicator = true;
		if(vm.selectedModelYear==null || vm.selectedModelYear=='undefined' || vm.selectedModelYear==""){
			vm.isDisplayTable = false;
			$scope.isLoadingIndicator = false;
			return;
		}
		var businessKey = ModelsFactory.getBusinessKey(vm.modelYears,vm.selectedModelYear);
		MidModelYearMappingService.getFamilyFetauresData(businessKey).then(function(result){
			vm.familiesData = result;
			vm.families = result.families;
			vm.mappedFeaturesKeys = result.mappedFeaturesKeys;
			vm.mappedFeatures = result.mappedFeatures;
			vm.unmappedFeatures = result.unmappedFeatures;
			if(vm.families.length==0){
				vm.isDisplayTable = false;
				$scope.isLoadingIndicator = false;
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.noDataFamilyMidMyco'),
					type: 'warning',
					multiple: false
				});
				return;
			}
			if(vm.mappedFeaturesKeys.length==0){
				vm.isDisplayTable = true;
				$scope.isLoadingIndicator = false;
				return;
			}
			vm.transformedFamiliesToDisplay = vm.transformFamilies().filter(function(familyObj){
				return familyObj.mappingCount === 0 ? false : true;
			});
			if(vm.transformedFamiliesToDisplay != undefined && vm.transformedFamiliesToDisplay != null)
			{
				angular.forEach(vm.transformedFamiliesToDisplay, function(arrElement, index){
					arrElement.changeoverRatesFlag = false;
					arrElement.open = false;
				});
			}
			vm.families.length === 0 ? vm.isDisplayTable = false : vm.isDisplayTable = true;
			$scope.isLoadingIndicator = false;
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	vm.getMycoKeys = function(familyKey){
		return vm.mappedFeaturesKeys.filter(function(keyObj){
			return keyObj.familyKey === familyKey;
		});
	}
	vm.getMappedFeaturesByMycoKey = function(mycoKey) {
		return vm.mappedFeatures.filter(function(featureObj) {
			return featureObj.mycoKey === mycoKey;
		});
	}
	vm.transformMappedFeatures = function(familyKey){
		var mycoKeys = vm.getMycoKeys(familyKey);
		var features = mycoKeys.map(function(mycoKeyObj){
			return vm.getMappedFeaturesByMycoKey(mycoKeyObj.mycoKey);
		});
		return features.map(function(featureObjArray){
			return {
				mycoKey : featureObjArray[0].mycoKey,
				ftr1Name : featureObjArray[0].name,
				ftr1Code : featureObjArray[0].code,
				ftr1key : featureObjArray[0].key,
		        ftr1ftrToprocess:featureObjArray[0].ftrToprocess,
		        ftr2Name: featureObjArray[1].name,
				ftr2Code : featureObjArray[1].code,
				ftr2key:featureObjArray[1].key,
	            ftr2ftrToprocess:featureObjArray[1].ftrToprocess
			}
		});
	}
	
	vm.transformFamilies = function(){
		return vm.families.map(function(familyObj){
			return {
				familyName: familyObj.name,
	            familyCode:familyObj.code,
	            familyKey:familyObj.key,
	            mappingCount:(vm.getMycoKeys(familyObj.key).length==0 ? 0 :vm.getMycoKeys(familyObj.key).length+" mappings"),
				mapping : vm.transformMappedFeatures(familyObj.key)
			}
		});
	}
	
	vm.editMappings = function(selectedFamilyObj) {
		var familyKey = selectedFamilyObj ? selectedFamilyObj.familyKey : "";
		MidModelYearMappingService.getSelectedTriplet(vm.selectedMarket,vm.selectedModel,vm.selectedModelYear,
				vm.markets,vm.models,vm.modelYears,familyKey,vm.familiesData);
		$state.go('create-edit-midmodelyear-mapping');
		
	};
	
	$scope.toggle = function(state) {
		vm.transformedFamiliesToDisplay.forEach(function(e) {
			e.open = state;
		});
	}
	 
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
}