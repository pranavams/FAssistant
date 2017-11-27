'use strict';

angular.module('EntityMappingModule').controller('EntityMappingAddEditController',
		['WcAlertConsoleService','$translate','$scope','EntityMappingListService','$q','$compile','$state','WcAuthorizationService','UserService','MarketGroupSelectModalService', 
        function(WcAlertConsoleService,$translate,$scope,EntityMappingListService,$q,$compile,$state,WcAuthorizationService,UserService,MarketGroupSelectModalService) {
	
	var vm=this;
	$scope.market = EntityMappingListService.selectedMarket;
	$scope.model = EntityMappingListService.selectedModel;
	$scope.editMYCO = undefined;
	vm.IS_MAPPED_STRING = " is mapped to "
	vm.selectedCheckBoxObjsInManualMapped = {};
	vm.selectedCheckBoxObjsInAutoMapped = {};
	vm.selectedPmyEntities = [];
	vm.selectedCmyEntity ='';
	var openParenthesis = '  (';
	var closeParenthesis = ')  ';
	var mycoMappingJson = {
			loggedInUserId:'',
			createdEntities : [],
			deletedEntities :[]
	}
	var initialManuallyMappedEntities = [];
	var initialManualMappedValues = [];
	$scope.isDataReceivedFromOgm = false;
	$scope.isLoadingIndicator = true;
	vm.search = {
			cmyQuery:'',
			pmyQuery:''
	}
	$scope.clickSearch = function(){
		$scope.cmySearch = vm.search.cmyQuery;
		$scope.pmySearch = vm.search.pmyQuery;
	}
	$scope.clearSearch = function(id){
		if(id=='pmyQ'){
			vm.search.pmyQuery='';
			$scope.pmySearch = '';
			vm.typePmy = undefined;
		}
		else if(id == 'cmyQ'){
			vm.search.cmyQuery = '';
			$scope.cmySearch ='';
			vm.typeCmy = undefined;
		}
	}
	$scope.keyedIn = function(element){
		element =='pmyQ'? vm.typePmy = "typed" : vm.typeCmy = "typed";
	}
	
	if($scope.market === undefined || $scope.model === undefined)
		$scope.editMYCO = false;
	else
		$scope.editMYCO = true;
	
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		mycoMappingJson.loggedInUserId = userObj.userId;
	}));
	
	vm.loadMycoMappings = function() {
		var deferred = $q.defer();
		if($scope.editMYCO){
			$scope.isLoadingIndicator = true;
			resetArrays();
			WcAuthorizationService.isAuthorized(["EntityEntityMapping:execute_"+MarketGroupSelectModalService.isAuthorisedParam($scope.market.key)+":WRITE"],null).then(function(authorized){
				vm.buttonsDisabled = !authorized;
			});
			EntityMappingListService.getMycoMappings().then(function(result){
				$scope.isLoadingIndicator = false;
				splitMappings(result);
				if(vm.unmappedPmyEntities.length>0)
					vm.selectedPmyEntities[0] = vm.unmappedPmyEntities[0];
				if(vm.unmappedCmyEntities.length>0)
					vm.selectedCmyEntity = vm.unmappedCmyEntities[0];
				deferred.resolve("ok");
			},function(error){
				deferred.reject(error);
				$scope.isLoadingIndicator = false;
				WcAlertConsoleService.addMessage({
					message: $translate.instant('application.errors.entityToEntityMappingGetError', {error: error}),
					type: 'danger',
					multiple: false,
					removeErrorOnStateChange: true
				});
			});
		}
		else
			deferred.reject(" - Access to this page is not allowed directly");
		return deferred.promise;
	};
	
	vm.loadMycoMappings().then(function(success){
		$scope.isDataReceivedFromOgm = true;
		$scope.isLoadingIndicator = false;
		if(EntityMappingListService.isReload == true){
			vm.selectedMarket = EntityMappingListService.selectedMarket;
			vm.selectedModel = EntityMappingListService.selectedModel;
			vm.loadMycoMappings();
			EntityMappingListService.isReload = false;
		}
	},function(error){
		WcAlertConsoleService.addMessage({
			message: $translate.instant('application.errors.entityToEntityMappingGetError', {error: error}),
			type: 'danger',
			multiple: false,
			removeErrorOnStateChange: true
		});
		$scope.isLoadingIndicator = false;
	});
	
	function resetArrays(){
		vm.unmappedPmyEntities = [];
		vm.unmappedCmyEntities = [];
		vm.autoMappedEntities = [];
		vm.manualMappedEntities = [];
		mycoMappingJson.createdEntities =[];
		mycoMappingJson.deletedEntities =[];
		initialManuallyMappedEntities = [];
		initialManualMappedValues=[];
	}
	
	function splitMappings(result){
		$.each(result.unmappedEntities,function(index,object){
			if(object.status === "PMY")
				vm.unmappedPmyEntities = editUnmappedEntities(object.descriptions);
			else if(object.status === "CMY")
				vm.unmappedCmyEntities = editUnmappedEntities(object.descriptions);
		});
		$.each(result.mappedEntities,function(index,object){
			if(object.mappingType === "AUTO")
				vm.autoMappedEntities = editMappedEntities(object.descriptions);
			else if(object.mappingType === "MANUAL"){
				vm.manualMappedEntities = editMappedEntities(object.descriptions);
				initialManuallyMappedEntities = angular.copy(vm.manualMappedEntities); // angular copy will create a copy of a new object and changes to parent won't be reflected on child
				$.each(initialManuallyMappedEntities,function(index,object){
					initialManualMappedValues.push(object.value);
				});
			}
		});
	}
	
	function editUnmappedEntities(unmappedEntities){
		$.each(unmappedEntities,function(index,object){
			object.info = object.code + openParenthesis + object.desc + closeParenthesis + object.modelYear ;
		});
		return unmappedEntities;
	}
	function editMappedEntities(mappedEntities){
		$.each(mappedEntities,function(index,object){
			object.pmyObject.info =  object.pmyObject.code +  openParenthesis + object.pmyObject.desc + closeParenthesis +  object.pmyObject.modelYear ;
			object.cmyObject.info =  object.cmyObject.code +  openParenthesis + object.cmyObject.desc + closeParenthesis +  object.cmyObject.modelYear ;
			object.value = object.pmyObject.info + vm.IS_MAPPED_STRING + object.cmyObject.info;
		});
		return mappedEntities;
	}
	
	vm.addMappings = function(){
		if(vm.selectedCmyEntity == undefined || vm.selectedPmyEntities.length === 0 || vm.selectedPmyEntities[0] === undefined) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noMappingToAddError'),
				type: 'warning',
				multiple: false
			});
			return false;
		}
		var selectedMappingValues = [];
		if(!validateMapping())
			return false;
		$.each(vm.selectedPmyEntities,function(index, selectedPmyobj){
			var selectedMappingValue = selectedPmyobj.info + vm.IS_MAPPED_STRING + vm.selectedCmyEntity.info;
			selectedMappingValues.push(selectedMappingValue);
			var selectedObj = {
					"value":selectedMappingValues[index],
					"pmyObject":selectedPmyobj,
					"cmyObject":vm.selectedCmyEntity
				}
			vm.newlyMappedObj = {
					"pmyKey":selectedPmyobj.key,
					"cmyKey":vm.selectedCmyEntity.key
				}
			vm.manualMappedEntities.push(selectedObj);
			mycoMappingJson.createdEntities.push(vm.newlyMappedObj);
			$.each(vm.unmappedPmyEntities,function(index, pmyObj) {
				if(pmyObj.info ===  selectedPmyobj.info) {
					vm.unmappedPmyEntities.splice(index, 1);
					return false;
				}
			});
			if(checkIfCmyEntityIsFullyMapped(vm.selectedCmyEntity.info)){
				$.each(vm.unmappedCmyEntities,function(index,object){
					if(object.info === vm.selectedCmyEntity.info){
						vm.unmappedCmyEntities.splice(index,1);
						return false;
					}
				});
			}
			
		});
		vm.selectedPmyEntities[0] = vm.unmappedPmyEntities[0];
		vm.selectedCmyEntity = vm.unmappedCmyEntities[0];
	}
	
	vm.removeManualMappings = function() {
		var isMappingsSelected = false;
		var i;
		for(var prop in vm.selectedCheckBoxObjsInManualMapped) {
			if(vm.selectedCheckBoxObjsInManualMapped.hasOwnProperty(prop) && vm.selectedCheckBoxObjsInManualMapped[prop] == true) {
				isMappingsSelected = true;
				vm.manualMappedEntities = $.grep(vm.manualMappedEntities, function(mappedObj, index) {	//grep will remove the element which has return true.
					if(mappedObj.value === prop) {
						vm.unmappedPmyEntities.push(mappedObj.pmyObject);
						if(checkIfCmyEntityIsFullyMapped(mappedObj.cmyObject.info))
								vm.unmappedCmyEntities.push(mappedObj.cmyObject);
						mycoMappingJson.createdEntities = $.grep(mycoMappingJson.createdEntities,function(obj,i){
							return obj.pmyKey === mappedObj.pmyObject.key;
						},true);
						// compare with initial manual mapped entities for deletion.
						if($.inArray(mappedObj.value,initialManualMappedValues)!== -1){
							var selectedObjForDelete = {
									"pmyKey":mappedObj.pmyObject.key,
									"cmyKey":mappedObj.cmyObject.key
							}
							mycoMappingJson.deletedEntities.push(selectedObjForDelete);
						}
						return true;
					}
				}, true);
				vm.selectedPmyEntities[0] = vm.unmappedPmyEntities[0];
				vm.selectedCmyEntity = vm.unmappedCmyEntities[0];
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
						vm.unmappedPmyEntities.push(mappedObj.pmyObject);
						if(checkIfCmyEntityIsFullyMapped(mappedObj.cmyObject.info))
							vm.unmappedCmyEntities.push(mappedObj.cmyObject);
						var selectedObjForDelete = {
								"pmyKey":mappedObj.pmyObject.key,
								"cmyKey":mappedObj.cmyObject.key
						}
						mycoMappingJson.deletedEntities.push(selectedObjForDelete);
						return true;
					}
				}, true);
				vm.selectedPmyEntities[0] = vm.unmappedPmyEntities[0];
				vm.selectedCmyEntity = vm.unmappedCmyEntities[0];
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
		console.log('mycoMappingJson -- ' + JSON.stringify(mycoMappingJson,null,4));
		if(mycoMappingJson.createdEntities.length>0 || mycoMappingJson.deletedEntities.length>0){
			EntityMappingListService.saveMycoMappings(mycoMappingJson).then(function(success){
				EntityMappingListService.isReload = true;
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
	
	
	vm.cancel = function(){
		$state.go('entity-mapping-list');
	}
	
	function checkIfCmyEntityIsFullyMapped(cmyEntity){
		var mappedValues = [];
		$.each(vm.manualMappedEntities.concat(vm.autoMappedEntities),function(index,obj){
			mappedValues.push(obj.cmyObject.info);
		});
		if(mappedValues.filter(function (value){
			return value === cmyEntity;
		}).length === 4)
			return true;
		return false;
	}
	
	function validateMapping(){
		var pmyModelyears =[];
		$.each(vm.manualMappedEntities.concat(vm.autoMappedEntities),function(index,obj){
			if(vm.selectedCmyEntity.code === obj.cmyObject.code)
				pmyModelyears.push(obj.pmyObject.modelYear);
		});
		$.each(vm.selectedPmyEntities,function(index,obj){
			pmyModelyears.push(obj.modelYear);
		});
		if(pmyModelyears.length !== _.uniq(pmyModelyears).length){
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.invalidMapping'),
				type: 'warning',
				multiple: false
			});
			return false;
		}
		return true;
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