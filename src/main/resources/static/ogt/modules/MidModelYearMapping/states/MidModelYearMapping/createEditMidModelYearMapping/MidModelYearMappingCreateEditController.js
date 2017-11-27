'use strict';

angular.module('MidModelYearMappingModule')
	.controller('MidModelYearMappingCreateEditController', 
			['$scope','MidModelYearMappingService','ModelsFactory','WcAlertConsoleService','$translate','$state','MarketGroupSelectModalService',MidModelYearMappingCreateEditController]);
		 
	function MidModelYearMappingCreateEditController ($scope,MidModelYearMappingService,ModelsFactory,WcAlertConsoleService,$translate,$state,MarketGroupSelectModalService){
		var vm = this;
		vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		vm.families;
		vm.markets;
		vm.models;
		vm.modelYears;
		vm.selectedMarket;
		vm.selectedModel;
		vm.selectedModelYear;
		vm.selectedFamily;
		vm.selectedMappedFeature = {};
		vm.selectedUnmappedFtr;
		vm.selectedUnmappedFtpFtr;
		vm.familiesData;
		vm.features;
		vm.featuresOfChosenFamily;
		vm.mappedList;
		vm.initialMappedList = [];
		vm.mappedKeysList = [];
		vm.addedFeatures = [];
		vm.deletedFeatures = [];
		vm.transformedMappedList = [];
		vm.setFamiliesDataFromParentScreen = setFamiliesDataFromParentScreen;
		vm.onModelYearSelect = onModelYearSelect;
		vm.onFamilySelect = onFamilySelect;
		vm.getFeatures = getFeatures;
		vm.getMappedFeatures = getMappedFeatures;
		vm.getFeaturesKeysByMycoKey = getFeaturesKeysByMycoKey;
		vm.removeMappedFeatures = removeMappedFeatures;
		vm.getUnmappedFeatures = getUnmappedFeatures;
		vm.addMappings = addMappings;
		vm.getFeature = getFeature;
		vm.saveMappings = saveMappings;
		vm.cancel = cancel;
		vm.getFeaturesForSelectedFamily = getFeaturesForSelectedFamily;
		vm.getDeletedFeatures = getDeletedFeatures;
		vm.getAddedFeatures = getAddedFeatures;
		vm.getFamilyName =getFamilyName;
		vm.removeDuplicateFeatures = removeDuplicateFeatures;
		vm.displayMappings = false;
		var oldFamily;
		const YES_FLAG='Y';
		const NO_FLAG = 'N';
		var forFamily = function(familyKey){ return function(featureObj){ return featureObj.familyKey === familyKey;}; };
		var getFamilyKey = function(mycoKey){
			return vm.familiesData.mappedFeaturesKeys.filter(function(keyObj){
				return keyObj.mycoKey === mycoKey;
			})[0];
		}
		var itContainsMappedObj = function(list,mapId){
			return list.find(function(mappedObj){
				return mappedObj.mapId === mapId;
			});
		}
		
		var itContainsFtrObj = function(newList,key){
			return newList.find(function(listObj){
				return listObj.key === key;
			});
		}
		var getMycoKeyByFeatureKey = function(featureKey){
			return vm.transformedMappedList.filter(function(featureObj){
				return featureObj.key === featureKey;
			})[0];
		}
		init();
		function init(){
			vm.setFamiliesDataFromParentScreen();
		}
		function setFamiliesDataFromParentScreen(){
			vm.markets = MidModelYearMappingService.markets;
			vm.models = MidModelYearMappingService.models;
			vm.modelYears = MidModelYearMappingService.modelYears;
			vm.familiesData = MidModelYearMappingService.familiesData;
			vm.families = MidModelYearMappingService.familiesData.families;
			vm.selectedMarket=MidModelYearMappingService.selectedMarket;
			vm.selectedModel=MidModelYearMappingService.selectedModel;
			vm.selectedModelYear=MidModelYearMappingService.selectedModelYear;
			vm.selectedFamily = MidModelYearMappingService.selectedFamily;
			oldFamily=vm.selectedFamily;
			vm.features = vm.removeDuplicateFeatures(vm.getFeatures());
			vm.mappedKeysList = vm.getMappedFeatures();
			vm.getFeaturesForSelectedFamily();
			vm.displayMappings = vm.selectedFamily ? true : false;
		}
		vm.getModels = function(){
			vm.models = ModelsFactory.getModels(vm.markets,vm.selectedMarket);
			vm.modelYears=[];
			vm.families = [];
			vm.selectedModelYear="";
			vm.selectedModel="";
			vm.selectedFamily = "";
			vm.displayMappings = false;
		}
		vm.getModelYears = function(){
			vm.modelYears = ModelsFactory.getModelYears(vm.models,vm.selectedModel);
			vm.selectedModelYear="";
			vm.selectedFamily = "";
			vm.families = [];
			vm.displayMappings = false;
			
		}
		
		function onModelYearSelect(){
			oldFamily = vm.selectedFamily; 
			$scope.isLoadingIndicator = true;
			if(vm.selectedModelYear==null || vm.selectedModelYear=='undefined'){
				vm.selectedModelYear="";
				vm.selectedFamily = "";
				vm.families = [];
				vm.displayMappings = false;
				vm.initialMappedList =[];
				vm.mappedKeysList=[];
				vm.addedFeatures=[];
				vm.deletedFeatures = [];
				$scope.isLoadingIndicator = false;
				return;
			}
			MidModelYearMappingService.getFamilyFetauresData(ModelsFactory.getBusinessKey(vm.modelYears,vm.selectedModelYear)).then(function(result){
				vm.familiesData = result;
				vm.families = result.families;
				vm.features = vm.removeDuplicateFeatures(vm.getFeatures());
				$scope.isLoadingIndicator = false;
				if(vm.families.length === 0){
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.noDataFamilyMidMyco'),
						type: 'warning',
						multiple: false
					});
					vm.displayMappings = false;
					return false;
				}
				vm.selectedFamily ? vm.onFamilySelect() : "";
			},function(error){
				$scope.isLoadingIndicator = false;
			});
			vm.displayMappings = false;
		}
		function onFamilySelect(){
			if(vm.getAddedFeatures().length !== 0 || vm.getDeletedFeatures().length !== 0){
				if(!confirm("The Changes made will be lost. Do you want to continue?")){
					vm.selectedFamily = oldFamily;
					return false;
				}else{
					vm.initialMappedList =[];
					vm.mappedKeysList=[];
				}
			}
			vm.getFeaturesForSelectedFamily();
			vm.mappedKeysList = vm.getMappedFeatures();
			oldFamily = vm.selectedFamily;
			vm.displayMappings = vm.selectedFamily ? true : false;
			vm.addedFeatures = [];
			vm.deletedFeatures = [];
		}
		function getFeaturesForSelectedFamily(){
			vm.featuresOfChosenFamily = vm.features.filter(forFamily(vm.selectedFamily));
		}
		function getFeaturesKeysByMycoKey(mycoKey){
			var features = vm.familiesData.mappedFeatures.filter(function(featureObj){
				return featureObj.mycoKey === mycoKey; 
			});
			return [features[0].key,features[1].key];
		}
		
		vm.getUnmappedFtpFtrs = function(){
			return vm.featuresOfChosenFamily.filter(function(featureObj){
				return featureObj.ftrToprocess === YES_FLAG;
			});
		}
		function getFeatures(){
			var unmappedFeatures = vm.familiesData.unmappedFeatures.map(function(featureObj){
				var feature = Object.assign({},featureObj);
				feature.mycoKey = "";
				return feature;
			});
			var mappedFeatures = vm.familiesData.mappedFeatures.map(function(featureObj){
				return {
					name : featureObj.name,
					code : featureObj.code,
					key : featureObj.key,
					familyKey : getFamilyKey(featureObj.mycoKey).familyKey,
					mycoKey : featureObj.mycoKey,
					ftrToprocess : featureObj.ftrToprocess,
				}
			});
			return unmappedFeatures.concat(mappedFeatures);
		}
		
		function removeDuplicateFeatures(features){
			return features.reduce(function(newList,featureObj){
				if(itContainsFtrObj(newList,featureObj.key) === undefined)
					newList = newList.concat(featureObj);
				return newList;
			},[]);
		}
		function getFamilyName(){
			return vm.families.filter(familyObj => familyObj.key === vm.selectedFamily)[0].name;
		}
		function getUnmappedFeatures(){
			var mappedKeys = vm.mappedKeysList.map(function(mappedObj){
				return mappedObj.from;
			});
			return vm.featuresOfChosenFamily.filter(function(featureObj){
				return mappedKeys.indexOf(featureObj.key) === -1;
			});
		}
		
		function transformMappedFeatures(){
			vm.transformedMappedList = vm.familiesData.mappedFeatures.map(function(featureObj){
				var feature = featureObj;
				feature.familyKey = getFamilyKey(featureObj.mycoKey).familyKey;
				return feature;
			});
			return vm.transformedMappedList;
		}
		
		function getMappedFeatures(){
			vm.mappedKeysList = transformMappedFeatures().filter(forFamily(vm.selectedFamily)).map(function(featureObj){
				var keys = getFeaturesKeysByMycoKey(featureObj.mycoKey);
				return {
					from : keys[0],
					to : keys[1],
					mapId : ""+keys[0]+keys[1]
				}
			}).reduce(function(newList,mappingObj){
				if(itContainsMappedObj(newList,mappingObj.mapId) === undefined)
					newList = newList.concat(mappingObj);
				return newList;
			},[]);
			vm.initialMappedList = angular.copy(vm.mappedKeysList);
			return vm.mappedKeysList;
		}
		
		function addMappings(){
			if(!vm.selectedUnmappedFtpFtr || !vm.selectedUnmappedFtr)
				{
					WcAlertConsoleService.addMessage({
						message: $translate.instant('conflictNotification.noMappingsToAdd'),
						type: 'warning',
						multiple: false
					});
					return false;
				}
			else if(vm.selectedUnmappedFtr === vm.selectedUnmappedFtpFtr){
				alert("Same feature cannot be mapped for MidModelYear Mapping");
				return false;
			}
			else{
				vm.mappedKeysList.push({
					from : vm.selectedUnmappedFtr,
					to : vm.selectedUnmappedFtpFtr,
					mapId : "" + vm.selectedUnmappedFtr + vm.selectedUnmappedFtpFtr
				});
			}
		}
		
		function removeMappedFeatures(){
			Object.keys(vm.selectedMappedFeature).forEach(function(mapId){
				vm.mappedKeysList = vm.mappedKeysList.filter(function(mappingObj){
					return mappingObj.mapId !== mapId;
				});
			});
			vm.selectedMappedFeature = {};
		}
		function getFeature(featureKey){
			return vm.features.filter(function(featureObj){
				return featureObj.key === featureKey;
			})[0];
		}
		
		function getDeletedFeatures(){
			if(vm.initialMappedList.length > 0){
				vm.deletedFeatures = vm.initialMappedList.filter(function(oldKeyObj){
					if(itContainsMappedObj(vm.mappedKeysList,oldKeyObj.mapId))
						return false;
					return true;
				}).map(function(keyObj){
					var ftrObj = getMycoKeyByFeatureKey(keyObj.from);
					return ftrObj.mycoKey;
				});
			}
			return vm.deletedFeatures;
		}
		
		function getAddedFeatures(){
			if(vm.mappedKeysList.length > 0){
				vm.addedFeatures = vm.mappedKeysList.filter(function(newKeyObj){
					if(itContainsMappedObj(vm.initialMappedList,newKeyObj.mapId))
						return false;
					return true;
				}).map(function(keyObj){
					return {
						 autoMappingFlag: NO_FLAG,
					     changeOverTypeCode: "MMY",
					     cmyFeatureKey: keyObj.from,
					     pmyFeatureKey: keyObj.to
					};
				});
			}
			return vm.addedFeatures;
		}
		function saveMappings(){
			vm.getDeletedFeatures();
			vm.getAddedFeatures();
			if(vm.addedFeatures.length === 0 && vm.deletedFeatures.length ===0){
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.noNewMappingsToSave'),
					type: 'warning',
					multiple: false
				});
				return false;
			}
			vm.sendSaveData();
		}
	vm.sendSaveData = function(){
		var saveObj = {
				"mappingsToBeDeleted" : vm.deletedFeatures,
				"mappingsToBeSaved" : vm.addedFeatures
		};
		$scope.isLoadingIndicator = true;
		MidModelYearMappingService.saveMappings(saveObj).then(function(response){
			vm.initialMappedList = [];
			vm.mappedKeysList = [];
			vm.addedFeatures = [];
			vm.deletedFeatures = [];
			vm.onModelYearSelect();
			$scope.isLoadingIndicator = false;
		},function(error){
			$scope.isLoadingIndicator = false;
		});
	}
	
	function cancel(){
		MidModelYearMappingService.getSelectedTriplet(vm.selectedMarket,vm.selectedModel,vm.selectedModelYear,
				vm.markets,vm.models,vm.modelYears,vm.selectedFamily,vm.familiesData);
		$state.go('mid-model-year-mappings',{from : "EditScreen"});
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
			
};
