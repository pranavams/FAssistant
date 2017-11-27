'use strict';

angular.module('ManageFamiliesModule').controller('ManageFamiliesController',['WcAlertConsoleService','$translate','$scope','ManageFamiliesService','$q','$compile','$state','WcAuthorizationService','UserService','MarketGroupSelectModalService',
                                                                              'FamiliesPrototype',
               function(WcAlertConsoleService,$translate,$scope,ManageFamiliesService,$q,$compile,$state,WcAuthorizationService,UserService,MarketGroupSelectModalService,FamiliesPrototype) {
	
	var vm = this;
	vm.models = [];
	vm.modelYears = [];
	vm.markets =[];
	vm.selectedMarket = '';
	vm.selectedModel = '';
	vm.selectedModelYear = '';
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	vm.dataTableMappings = [];
	vm.isDisplayDataTable=false;
	vm.isCorrelationProcessColumn=false;
	vm.familiesToUpdate = [];
	vm.features= [];
	vm.featuresToUpdate =[];
	vm.user = '';
	vm.userId = '';
	vm.saveDisabled = true;
	vm.selectedEquipmentGroup='';
	vm.begFeatures=[];
	vm.superFamilyName='';
	vm.superFamilyDescription='';
	vm.begFamilyName='';
	vm.superFeatureList='';
	vm.begFamilyPresent='N';
	vm.message='';
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		vm.user = userObj;
		vm.userId = vm.user.userId;
	}));
	
	if(vm.businessProcess == 'MF'){
		vm.isCorrelationProcessColumn=true;
	}
	
	function getDropdownValues(){
		var deferred = $q.defer();
		ManageFamiliesService.modifiedFamiliesArray=[];
		ManageFamiliesService.getMarketsModelsModelYear(vm.businessProcess,vm.marketGroup).then(function(result){
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
		vm.isDisplayDataTable=false;
		if(ManageFamiliesService.isReload == true){
			vm.selectedMarket = ManageFamiliesService.selectedMarket;
			vm.loadModels();
			vm.selectedModel = ManageFamiliesService.selectedModel;
			vm.loadModelYears();
			vm.selectedModelYear = ManageFamiliesService.selectedModelYear;
			ManageFamiliesService.isReload = false;
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
		vm.modelYears = [];
		vm.selectedModel = '';
		vm.selectedModelYear = '';
		vm.isDisplayDataTable=false;
		ManageFamiliesService.modifiedFamiliesArray=[];
		WcAuthorizationService.isAuthorized(["ManageFamilies:execute_"+MarketGroupSelectModalService.isAuthorisedParam(vm.selectedMarket)+":WRITE"],null).then(function(authorized){
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
		ManageFamiliesService.modifiedFamiliesArray=[];
		vm.isDisplayDataTable=false;
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
	
	vm.searchFamilyList = function() {
		$scope.isLoadingIndicator = true;
		vm.dataTableMappings = [];
		vm.begFamilyPresent='N';
		ManageFamiliesService.modifiedFamiliesArray=[];
		vm.isDisplayDataTable=false;
		if(vm.selectedModelYear == undefined || vm.selectedModelYear == null || vm.selectedModelYear == '') {
			$scope.isLoadingIndicator = false;
			return false;
		}
		ManageFamiliesService.getFamilyList(vm.selectedMarket,vm.selectedModel,vm.selectedModelYear,vm.businessProcess,vm.marketGroup).then(function(result){
			vm.formFamiliesGrid(result);
		},function(error){
			$scope.isLoadingIndicator = false;
			vm.isDisplayDataTable=false;
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.getFamilyGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
	}
	
	vm.formFamiliesGrid = function(result){
		vm.isDisplayDataTable=false;
		vm.begFeatures=[];
		vm.selectedEquipmentGroup='';
		vm.superFamilyName='';
		vm.begFamilyName='';
		vm.superFeatureList='';
		var isResponseEmpty='Y';
		if(!angular.equals({"families":[]},result.superFamily)){
			vm.processSuperFamily(result.superFamily);
			isResponseEmpty='N';
		}
		vm.processFamily(result.familiesList,'Y','Y',2,'N'); 
		vm.begFeatures=vm.processFeatures(result.begFeatures);
		if(vm.begFamilyPresent==='N' && isResponseEmpty ==='N'){
			vm.addBegFamiliy();
		}
		//vm.formSuperFamilyandBegName();
		$scope.isLoadingIndicator = false;
		vm.isDisplayDataTable=true;
	}
	
	vm.addBegFamiliy=function(){
		
		var familiesProto = new FamiliesPrototype();
		familiesProto.key=0;
		familiesProto.code='BEG-TBD';
		familiesProto.name='BEG-TBD';
		familiesProto.superFamily='Y';
		familiesProto.begFamily='Y';
		/*if(familyObj.superFamily=='Y'){
			vm.superFeatureList=familyObj.features;
			vm.superFamilyDescription = familyObj.name;
		}*/
		
		
		familiesProto.baseVehicle="No";
		familiesProto.equipmentGroup='N';
		/*if(familyObj.equipmentGroup=='Y'){
			vm.selectedEquipmentGroup=familyObj.code;
		}*/
			familiesProto.familyToProcess="No";
			familiesProto.showEditLink='N';
			familiesProto.equipmentFlag='N';
			familiesProto.familyWeightage='';
			familiesProto.familyVarietyAdjustment='';
			familiesProto.sortFlag = 1;
		//	vm.begFamilyPresent='Y';
		familiesProto.familyBelongToSuperFamily='N';
		familiesProto.equipmentGroupArray.push({name:'Yes',key:'Y'},{name:'No',key:'N'});
		familiesProto.featuresArray=vm.superFeatureList;
		familiesProto.correlationProcess="No";
		vm.dataTableMappings.push(familiesProto);

	}
	
	vm.formSuperFamilyandBegName=function(){
		
		if(vm.superFamilyName !=''){
			if(JSON.stringify(vm.begFeatures)==JSON.stringify(vm.superFeatureList)){
				vm.superFamilyName="("+vm.superFamilyName.replace(/,\s*$/, "") + ")";
				vm.begFamilyName=vm.superFamilyDescription +" "+vm.superFamilyName;
				var entityName=(vm.businessProcess == 'OG'?'MPV':'PPV');
				if(vm.selectedEquipmentGroup == ''){
					vm.message='Base Vehicle setup is available but not the Equipment Group.'+ entityName +'  is showing up.'
				}else {
					vm.message='Base Vehicle and Equipment Group setup is available. BEG Family and Features are not generated yet,'+ entityName +' is showing up.'
				}
			}
			else{
				vm.begFamilyName="BEG (" + vm.superFamilyName+","+ vm.selectedEquipmentGroup +")";
			}
		}
	}
	
	vm.processSuperFamily = function(superFamilyObj){
		vm.buildFamiliesProtoType(superFamilyObj,'Y','N',3,'N');				
		if(superFamilyObj.superFamily == 'Y') {
			vm.processFamily(superFamilyObj.families,'N','N',3.100,'Y');
		}
	}
	
	/**
	 * EditFlag : To capture what records are being edited
	 * EquipmentFlag : To display equipment group immediately below the superFamily and to impose colour change
	 * sortFlag : To display superFamily and its subset list first in the grid
	 */
	vm.processFamily = function(familyList,editFlag,equipmentFlag,sortFlag,familyBelongToSuperFamily){
		$.each(familyList, function(index, familyObj) {
			if(familyBelongToSuperFamily=='Y'){
				sortFlag=sortFlag-0.1;
			}
			vm.buildFamiliesProtoType(familyObj,editFlag,equipmentFlag,sortFlag,familyBelongToSuperFamily);				
		});
	}
	
	function Feature(key,name,processFlag) {
		this.key=key; 
		this.name = name;
		this.processFlag=processFlag;
	}
	
	vm.processFeatures = function(featureList){
		var featuresArray=[];
		/*for (var featureObj in featureList) {
  			featuresArray.push({"value" :featureList[featureObj] + '(' + featureObj + ')'});
		}*/
		$.each(featureList,function(index,featureObj){
			var theFeature = new Feature(featureObj.key,featureObj.name,featureObj.processFlag);
			featuresArray.push(theFeature);
		});
		return featuresArray;
	}
	
	vm.buildFamiliesProtoType = function(familyObj,editFlag,equipmentFlag,sortFlag,familyBelongToSuperFamily){
		var familiesProto = new FamiliesPrototype();
		familiesProto.key=familyObj.key;
		familiesProto.code=familyObj.code;
		familiesProto.name=familyObj.name;
		familiesProto.superFamily=familyObj.superFamily;
		familiesProto.begFamily=familyObj.begFamily;
		if(familyObj.superFamily=='Y'){
			vm.superFeatureList=familyObj.features;
			vm.superFamilyDescription = familyObj.name;
		}
				
		familiesProto.baseVehicle=(familyObj.baseVehicle  == "Y"?"Yes":"No");
		familiesProto.equipmentGroup=familyObj.equipmentGroup;
		if(familyObj.equipmentGroup=='Y'){
			vm.selectedEquipmentGroup=familyObj.code;
		}
		familiesProto.familyToProcess=(familyObj.familyToProcess == "Y"?"Yes":"No");
		
		
		// to be changed
		if(familyObj.begFamily=='Y'){
			familiesProto.showEditLink='N';
			familiesProto.equipmentFlag='N';
			familiesProto.familyWeightage='';
			familiesProto.familyVarietyAdjustment='';
			familiesProto.sortFlag = 1;
			vm.begFamilyPresent='Y';
		}else{
			familiesProto.familyWeightage=familyObj.familyWeightage;
			familiesProto.familyVarietyAdjustment=familyObj.familyVarietyAdjustment;
			if(familyObj.familyToProcess=='N' || vm.buttonsDisabled){
				familiesProto.showEditLink='N';
			}else{
				familiesProto.showEditLink=editFlag;
			}
			familiesProto.equipmentFlag=equipmentFlag;
			familiesProto.sortFlag = sortFlag;
		}
		
		familiesProto.familyBelongToSuperFamily=familyBelongToSuperFamily;
		if(familyBelongToSuperFamily=='Y'){
			vm.superFamilyName=(vm.superFamilyName==''?(familiesProto.code):(vm.superFamilyName+", "+familiesProto.code));
		}
		familiesProto.equipmentGroupArray.push({name:'Yes',key:'Y'},{name:'No',key:'N'});
		familiesProto.featuresArray=vm.processFeatures(familyObj.features);
		
		familiesProto.correlationProcess=(familyObj.familyToCorrelate  == "Y"?"Yes":"No");
		vm.dataTableMappings.push(familiesProto);
	}

	
	vm.open =  function(featuresArray,familyObj,message){
		ManageFamiliesService.features=featuresArray;
		vm.begFamilyName='';
		vm.superFamilyName=vm.superFamilyName.replace(/,\s*$/, "");
		vm.message='';
		if(familyObj.begFamily=='Y'){
			var entityName=(vm.businessProcess == 'OG'?'MPV':'PPV');
			if(vm.begFamilyPresent==='Y'){
				vm.begFamilyName="BEG (" + vm.superFamilyName+","+ vm.selectedEquipmentGroup +")";
			}else{
				vm.begFamilyName=vm.superFamilyDescription +" ("+vm.superFamilyName+")";
				if(vm.selectedEquipmentGroup == ''){
					vm.message='Base Vehicle setup is available but not the Equipment Group.'+ entityName +'  is showing up.'
				}else {
					vm.message='Base Vehicle and Equipment Group setup is available. BEG Family and Features are not generated yet,'+ entityName +' is showing up.'
				}
			}
			ManageFamiliesService.familyName=vm.begFamilyName;
		}else{
			if(familyObj.superFamily=="Y"){
				ManageFamiliesService.familyName=familyObj.name + ' (' + vm.superFamilyName +')';
			}else{
				ManageFamiliesService.familyName=familyObj.name + ' ('+familyObj.code+')';
			}
		}
		/*if(familyObj==''){
			ManageFamiliesService.familyName=vm.begFamilyName;
		}else{
			if(familyObj.superFamily=="Y"){
				ManageFamiliesService.familyName=familyObj.name + ' (' + vm.superFamilyName +')';
			}else{
				ManageFamiliesService.familyName=familyObj.name + ' ('+familyObj.code+')';
			}
		}*/
		
		ManageFamiliesService.businessProcess=vm.businessProcess;
		ManageFamiliesService.message=vm.message;
		ManageFamiliesService.open().then(angular.bind(this, function(response){
		})).finally(function() {
		});
	}
	

	
	
	vm.onchangeEquipmentGroup= function(familyObj){
		
		var msg= " was marked as Equipment Group. Existing BEG's will be permanently deleted from the system by this change. Would you like to proceed?";
		if(vm.selectedEquipmentGroup!=""){
			if( vm.selectedEquipmentGroup ==familyObj.code){
				if(familyObj.equipmentGroup=='N'){
					if(confirm(vm.selectedEquipmentGroup + msg)){
						vm.keepOneEquipmentGroup(familyObj);
						vm.constructSave(familyObj);
					}else{
						vm.setEquipmentFamily(familyObj);
					}
				}else{
					vm.keepOneEquipmentGroup(familyObj);
					vm.constructSave(familyObj);
				}
			}
			else if(confirm(vm.selectedEquipmentGroup + msg)){
				$scope.isLoadingIndicator = true;
				//vm.selectedEquipmentGroup=familyObj.code;
				vm.keepOneEquipmentGroup(familyObj);
				vm.constructSave(familyObj);
				$scope.isLoadingIndicator = false;
			}else{
				vm.setEquipmentFamily(familyObj);
			}
		}else{
			vm.constructSave(familyObj);
		}
	}
	
	
	vm.setEquipmentFamily=function(familyObj){
		
		if(familyObj.equipmentGroup=='Y'){
			familyObj.equipmentGroup='N';
		}else{
			familyObj.equipmentGroup='Y';
		}
	}
	
	
	vm.keepOneEquipmentGroup= function(familyObj){
		$.each(vm.dataTableMappings,function(index,family){
			if(familyObj.code!=family.code && family.equipmentGroup=='Y'){
				family.equipmentGroup='N';
				vm.constructSave(family);
			}
			
		});
		
	}
	
	
	vm.constructSave = function(familyObj){
		ManageFamiliesService.modifiedFamiliesArray = $.grep(ManageFamiliesService.modifiedFamiliesArray, function(e){ 
			return e.key != familyObj.key; 
		});
		ManageFamiliesService.modifiedFamiliesArray.push(familyObj);
	}
	
	vm.checkBEGFamilyChanged=function(family,begFamilyChanged){
		if(family.equipmentGroup=='Y'){
			if(family.name==vm.selectedEquipmentGroup){
				return 'N';
			}else{
				return 'Y';
			}
		}else{
			if(family.name==vm.selectedEquipmentGroup){
				if(family.name==vm.selectedEquipmentGroup){
					return 'Y';
				}
			}
		}
		return begFamilyChanged;
	}
	
	vm.changeStyle=function(equipmetFlag,begFamily){
		if(equipmetFlag=="N" && begFamily=='N'){
			return {"background-color": "#e59595"};
		}else if(begFamily=='Y'){
			return {"background-color": "bisque"};
		}
	}
	
	vm.constructJson = function(){
		var families = [];
		var begFamilyChanged='N';
		$.each(ManageFamiliesService.modifiedFamiliesArray,function(index,family){
			begFamilyChanged=vm.checkBEGFamilyChanged(family,begFamilyChanged);
			
			var family = {"key":family.key,
					"code":family.code,
					"name":family.name,
					"superFamily":family.superFamily,
					"baseVehicle":family.baseVehicle,
					"equipmentGroup":family.equipmentGroup,
					"familyToProcess":family.familyToProcess,
					"familyWeightage":family.familyWeightage,
					"familyVarietyAdjustment":family.familyVarietyAdjustment,
					"begFamilyChanged":begFamilyChanged,
					"familyToCorrelate":family.correlationProcess,
					 "features": []
				    };
			families.push(family);
		});
		return families;
	}
	
	vm.saveFamilies=function(){
		$scope.isLoadingIndicator = true;
		for (var familyObj, i = 0; familyObj = ManageFamiliesService.modifiedFamiliesArray[i++];){
			if(vm.isFamilyWeigtageEmpty(familyObj.familyWeightage) || vm.isFamilyVarietyAdjEmpty(familyObj.familyVarietyAdjustment)){
				$scope.isLoadingIndicator = false;
				return false;
			}
		}
		var families= vm.constructJson();
		if(families.length>0){
			ManageFamiliesService.saveFamilies(vm.userId,families).then(function(result){
				/*var promises = [];
				promises.push(ManageFamiliesService.getFamilyList(vm.selectedMarket,vm.selectedModel,vm.selectedModelYear,vm.businessProcess,vm.marketGroup));
				return $q.all(promises);*/
				
			},function(error){
				$scope.isLoadingIndicator = false;
				vm.isDisplayDataTable=true;
				return;
			}).then(function(result) {
				$scope.isLoadingIndicator = true;
				 vm.searchFamilyList();
				},function(error){
					$scope.isLoadingIndicator = false;
					vm.isDisplayDataTable=true;
					return;
				})			
		}else{
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.noFamiliesToSave'),
				type: 'warning',
				multiple: false
			});
			$("html, body").animate({ scrollTop: 0 }, "slow");
			$scope.isLoadingIndicator = false;
			return false;
		}
		return true;
		
	}
	
	vm.isFamilyWeigtageEmpty=function(familyWeightage){
		if(familyWeightage == '' || familyWeightage == undefined){
			vm.setError('application.errors.getFamilyWeightageGetError');
			return true;
		}
		return false;
	}
	
	vm.isFamilyVarietyAdjEmpty=function(familyVarietyAdjustment){
		if(familyVarietyAdjustment == '' || familyVarietyAdjustment == undefined){
			vm.setError('application.errors.getFamilyAdjustmentError');
			return true;
		}
		return false;
	}
	
	vm.setError=function(errorMsg){
		WcAlertConsoleService.addMessage({
			message: $translate.instant(errorMsg, {error: ''}),
			type: 'danger',
			multiple: false,
			removeErrorOnStateChange: true
		});
	}

	$scope.$on("enable-disable-save", angular.bind(this,function(event, data) {
		vm.saveDisabled = false;
	}));
	
	$scope.user = {
		    id: 1,
		    name: 'awesome user',
		    status: 2,
		    group: 4,
		    groupName: 'admin'
		  }; 

		  $scope.statuses = [
		    {value: 1, text: 'status1'},
		    {value: 2, text: 'status2'},
		    {value: 3, text: 'status3'},
		    {value: 4, text: 'status4'}
		  ]; 

		  $scope.groups = [];
		  $scope.loadGroups = function() {
		    return $scope.groups.length ? null : $http.get('/groups').success(function(data) {
		      $scope.groups = data;
		    });
		  };

		  $scope.showGroup = function() {
		    if($scope.groups.length) {
		      var selected = $filter('filter')($scope.groups, {id: $scope.user.group});
		      return selected.length ? selected[0].text : 'Not set';
		    } else {
		      return $scope.user.groupName;
		    }
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
