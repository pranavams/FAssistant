'use strict';

angular.module('WersEntityMappingModule').controller('WersEntityMappingController',['WcAlertConsoleService','$translate','$scope','WersEntityMappingService','$q','$compile','$state','WcAuthorizationService','UserService','MarketGroupSelectModalService', 
               function(WcAlertConsoleService,$translate,$scope,WersEntityMappingService,$q,$compile,$state,WcAuthorizationService,UserService,MarketGroupSelectModalService) {
	
	var vm = this;
	vm.models = [];
	vm.modelYears = [];
	vm.markets =[];
	vm.selectedMarket = '';
	vm.selectedModel = '';
	vm.selectedModelYear = '';
	vm.isDisplayMappings = false;
	vm.selectedCheckBoxObjsInManualMapped = {};
	vm.selectedCheckBoxObjsInAutoMapped = {};
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	var wersEntityMappingJson = {
			marketGroupCode:'',
			businessProcessCode:'',
			market:'',
			model:'',
			modelYear:'',
			loggedInUserId:'',
			createdEntities : [],
			deletedEntities :[]
	}
	var initialManuallyMappedEntities = [];
	var manualMappedValues = [];
	var openParenthesis = '  (';
	var closeParenthesis = ')  ';
	vm.search = {
			entityQuery:'',
			wersQuery:''
	}
	$scope.clickSearch = function(){
		$scope.entitySearch = vm.search.entityQuery;
		$scope.wersSearch = vm.search.wersQuery;
	}
	$scope.clearSearch = function(id){
		if(id=='wers'){
			vm.search.wersQuery='';
			$scope.wersSearch = '';
			vm.typeWers = undefined;
		}
		else if(id == 'entity'){
			vm.search.entityQuery = '';
			$scope.entitySearch ='';
			vm.typeEntity = undefined;
		}
	}
	$scope.keyedIn = function(element){
		element =='wers'? vm.typeWers = "typed" : vm.typeEntity = "typed";
	}
	$scope.isDataReceivedFromOgm = false;
	$scope.isLoadingIndicator = true;
	
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		wersEntityMappingJson.loggedInUserId = userObj.userId;
	}));
	
	function getDropdownValues(){
		var deferred = $q.defer();
		WersEntityMappingService.getMarketsModelsModelYear().then(function(result){
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
		if(WersEntityMappingService.isReload == true){
			vm.selectedMarket = WersEntityMappingService.selectedMarket;
			vm.loadModels();
			vm.selectedModel = WersEntityMappingService.selectedModel;
			vm.loadModelYears();
			vm.selectedModelYear = WersEntityMappingService.selectedModelYear;
			vm.loadWersEntityMappings();
			WersEntityMappingService.isReload = false;
		}
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
		vm.selectedModelYear = '';
		vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		console.log("parameter "+this.selectedBusinessProcess+"-----"+this.selectedMarketGroup);
		WcAuthorizationService.isAuthorized(["WERSEntityMapping:execute_"+MarketGroupSelectModalService.isAuthorisedParam(vm.selectedMarket)+":WRITE"],null).then(function(authorized){
			vm.buttonsDisabled = !authorized;
		});
		$.each(vm.markets,function(index,market){
			if(market.key === vm.selectedMarket){
				$.each(market.models,function(index,model){
					if(model.key!=="ALL"){
						vm.models.push(model);
					}
				});
			}
		});
	}
	vm.loadModelYears = function(){
		vm.modelYears = [];
		vm.selectedModelYear = '';
		$.each(vm.models,function(index,model){
			if(model.key===vm.selectedModel){
				$.each(model.modelYears,function(index,modelYear){
					if(modelYear.modelYear!=="ALL"){
						vm.modelYears.push(modelYear.modelYear);
					}
				});
			}
		});
	}
	vm.loadWersEntityMappings = function() {
		$scope.isLoadingIndicator = true;
		resetArrays();
		vm.isDisplayMappings = false;
		if(vm.selectedModelYear == undefined || vm.selectedModelYear == null || vm.selectedModelYear == '') {
			$scope.isLoadingIndicator = false;
			vm.isDisplayMappings = false;
			return false;
		}
		WersEntityMappingService.getWersEntityMappings(vm.selectedMarket,vm.selectedModel,vm.selectedModelYear).then(function(result){
			$scope.isLoadingIndicator = false;
			splitMappings(result);
			if(vm.unmappedEntities.length>0)
				vm.selectedUnmappedEntity = vm.unmappedEntities[0];
			if(vm.unmappedWers.length>0)
				vm.selectedUnmappedWers = vm.unmappedWers[0];
			vm.isDisplayMappings = true;
		},function(error){
			$scope.isLoadingIndicator = false;
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.wersEntityMappingGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
	};
	
	function resetArrays(){
		vm.unmappedWers = [];
		vm.unmappedEntities = [];
		vm.autoMappedEntities = [];
		vm.manualMappedEntities = [];
		wersEntityMappingJson.createdEntities =[];
		wersEntityMappingJson.deletedEntities =[];
		initialManuallyMappedEntities = [];
	}
	
	function splitMappings(result){
		$.each(result.unmappedEntities,function(index,object){
			if(object.systemName === "PDO")
				vm.unmappedWers = editUnmappedEntities(object.descriptions);
			else if(object.systemName === "VISTA")
				vm.unmappedEntities = editUnmappedEntities(object.descriptions);
		});
		$.each(result.mappedEntities,function(index,object){
			if(object.mappingType === "AUTO")
				vm.autoMappedEntities = editMappedEntities(object.descriptions);
			else if(object.mappingType === "MANUAL"){
				vm.manualMappedEntities = editMappedEntities(object.descriptions);
				initialManuallyMappedEntities = angular.copy(vm.manualMappedEntities);
			}
		});
	}
	
	function editUnmappedEntities(unmappedEntities){
		$.each(unmappedEntities,function(index,object){
			object.info = object.value + openParenthesis + object.code + closeParenthesis ;
		});
		return unmappedEntities;
	}
	function editMappedEntities(mappedEntities){
		$.each(mappedEntities,function(index,object){
			object.value = object.entityObject.value + openParenthesis + object.wersObject.code + closeParenthesis + object.entityObject.code;
			object.wersObject.info = object.wersObject.value + openParenthesis + object.wersObject.code + closeParenthesis;
			object.entityObject.info = object.entityObject.value + openParenthesis + object.entityObject.code + closeParenthesis;
		});
		return mappedEntities;
	}
	
	vm.hideWersEntityMappings = function() {
		vm.isDisplayMappings = false;
	};
	
	vm.addMappings = function() {
		if(vm.selectedUnmappedWers == undefined || vm.selectedUnmappedEntity == undefined) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noMappingToAddError'),
				type: 'warning',
				multiple: false
			});
			return false;
		}
		var selectedMappingValue = vm.selectedUnmappedEntity.value + openParenthesis + vm.selectedUnmappedWers.code + closeParenthesis + vm.selectedUnmappedEntity.code;
		$.each(vm.unmappedWers,function(index, wersCodeObj) {
			if(wersCodeObj.value ===  vm.selectedUnmappedWers.value) {
				vm.unmappedWers.splice(index, 1);
				return false;
			}
		});
		$.each(vm.unmappedEntities,function(index, entityCodeObj) {
			if(entityCodeObj.value ===  vm.selectedUnmappedEntity.value) {
				vm.unmappedEntities.splice(index, 1);
				return false;
			}
		});
		vm.selectedObj = {
			"value":selectedMappingValue,
			"wersObject":vm.selectedUnmappedWers,
			"entityObject":vm.selectedUnmappedEntity
		}
		vm.newlyMappedObj ={
			 "eid": vm.selectedObj.entityObject.code,
		     "entityDesc": vm.selectedObj.entityObject.value,
		     "dbpId": vm.selectedObj.entityObject.dbpId,
		     "wersCode": vm.selectedObj.wersObject.code
		}
		wersEntityMappingJson.createdEntities.push(vm.newlyMappedObj);
		vm.manualMappedEntities.push(vm.selectedObj);
		vm.selectedUnmappedWers = vm.unmappedWers[0];
		vm.selectedUnmappedEntity = vm.unmappedEntities[0];
	};
	
	vm.removeManualMappings = function() {
		var isMappingsSelected = false;
		var i;
		for(var prop in vm.selectedCheckBoxObjsInManualMapped) {
			if(vm.selectedCheckBoxObjsInManualMapped.hasOwnProperty(prop) && vm.selectedCheckBoxObjsInManualMapped[prop] == true) {
				isMappingsSelected = true;
				vm.manualMappedEntities = $.grep(vm.manualMappedEntities, function(mappedObj, index) {	//grep will remove the element which has return true.
					if(mappedObj.value === prop) {
						vm.unmappedWers.push(mappedObj.wersObject);
						vm.unmappedEntities.push(mappedObj.entityObject);
						wersEntityMappingJson.createdEntities = $.grep(wersEntityMappingJson.createdEntities,function(obj,i){
							return obj.entityDesc === mappedObj.entityObject.value;
						},true);
						return true;
					}
				}, true);
				vm.selectedUnmappedWers = vm.unmappedWers[0];
				vm.selectedUnmappedEntity = vm.unmappedEntities[0];
				delete vm.selectedCheckBoxObjsInManualMapped[prop];
			}
		}
		if(!isMappingsSelected) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noMappingToRemoveError'),
				type: 'warning',
				multiple: false
			});
		}
	};
	
	vm.removeAutoMappings = function() {
		var isMappingsSelected = false;
		for(var prop in vm.selectedCheckBoxObjsInAutoMapped) {
			if(vm.selectedCheckBoxObjsInAutoMapped.hasOwnProperty(prop) && vm.selectedCheckBoxObjsInAutoMapped[prop] == true) {
				isMappingsSelected = true;
				vm.autoMappedEntities = $.grep(vm.autoMappedEntities, function(mappedObj, index) {	//grep will remove the element which has return true.
					if(mappedObj.value === prop) {
						console.log('prop:'+prop);
						vm.unmappedWers.push(mappedObj.wersObject);
						vm.unmappedEntities.push(mappedObj.entityObject);
						wersEntityMappingJson.deletedEntities.push(mappedObj.entityObject.code);
						return true;
					}
				}, true);
				vm.selectedUnmappedWers = vm.unmappedWers[0];
				vm.selectedUnmappedEntity = vm.unmappedEntities[0];
				delete vm.selectedCheckBoxObjsInAutoMapped[prop];
			}
		}
		if(!isMappingsSelected) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noMappingToRemoveError'),
				type: 'warning',
				multiple: false
			});
		}
	};
	
	vm.saveMappings = function() {
		constructJsonForSave();
		if(wersEntityMappingJson.createdEntities.length>0 || wersEntityMappingJson.deletedEntities.length>0){
			WersEntityMappingService.saveMappings(wersEntityMappingJson).then(function(success){
				WersEntityMappingService.selectedMarket = vm.selectedMarket;
				WersEntityMappingService.selectedModel = vm.selectedModel;
				WersEntityMappingService.selectedModelYear = vm.selectedModelYear;
				WersEntityMappingService.isReload = true;
				$state.go($state.current, {}, {reload: true});
			})
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
	
	function constructJsonForSave(){
		manualMappedValues=[];
		console.log('Manual mapped entities' + vm.manualMappedEntities);
		$.each(vm.manualMappedEntities,function(index,object){
			manualMappedValues.push(object.value);
		});
		$.each(initialManuallyMappedEntities,function(index,object){ // To capture the deleted entities of manually mapped ones
			if($.inArray(object.value, manualMappedValues) == -1 && $.inArray(object.value,wersEntityMappingJson.deletedEntities) == -1)
				wersEntityMappingJson.deletedEntities.push(object.entityObject.code);
		});
		wersEntityMappingJson.market = vm.selectedMarket;
		wersEntityMappingJson.model = vm.selectedModel;
		wersEntityMappingJson.modelYear = vm.selectedModelYear;
	}
	
	vm.cancel = function(){
		$state.go($state.current, {}, {reload: true});
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
	
}]);
