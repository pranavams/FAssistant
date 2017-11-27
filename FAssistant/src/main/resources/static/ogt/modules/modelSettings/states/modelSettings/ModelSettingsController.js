'use strict';

angular.module('ModelSettingsModule').controller('ModelSettingsController', 
	['$scope','$compile','$state','$translate','WcDataTableService','$http','WcAlertConsoleService','$timeout',
	 		'ModelSettingsService','ModelSettingsPrototype', 'WcAuthorizationService',
	 		'ModelMarketSettingsPrototype','ModelGlobalSalesTypePrototype','UserService','MarketGroupSelectModalService',
	 function($scope,$compile,$state,$translate,WcDataTableService,$http,WcAlertConsoleService,$timeout,
			 ModelSettingsService,ModelSettingsPrototype, WcAuthorizationService,
			 ModelMarketSettingsPrototype,ModelGlobalSalesTypePrototype,UserService,MarketGroupSelectModalService){
		
	$scope.isLoadingIndicator = true;
	var vm = this;
	vm.selectedMarket = ModelSettingsService.selectedMarket;
	vm.selectedModelYear = ModelSettingsService.selectedModelYear;
	vm.selectedModel = ModelSettingsService.selectedModel;
	vm.isFromViewPage = ModelSettingsService.isFromViewPage;
	
	vm.modelYears = [];
	vm.models = [];
	vm.isDropdownValuesChanged = false;		
	vm.months = [1,2,3,4,5,6,7,8,9,10,11,12];
	
	$scope.linkStatus = ModelSettingsService.linkStatus;
	vm.isApplyWeightsInvalid = false;
	vm.isWeightsNotApplied = false;
	vm.isApplyWeightsInvalidIndividual = false;
	vm.displayModelMarketSettings = false;
	vm.marketName='';
	vm.modelName='';
	vm.user='';
	
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	
	$scope.$watch('isLoadingIndicator',function(){
		if($scope.isLoadingIndicator == true){
			$("#loading-cover").show().animate({
                opacity: 1
            }, 300), $("#loading-indicator").show().animate({
                opacity: 1
            }, 300)
		} else{
			 $("#loading-indicator").hide().animate({
                 opacity: 0
             }, 10), $("#loading-cover").hide().animate({
                 opacity: 0
             }, 10)
		}
	});
	
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		vm.user = userObj.userId;
	}));
	/* Edit Data table configuration starts here  */
	$scope.gstDataTableMappings = [];
	vm.gstCheckBoxColPosition = 0;
	vm.gstSelectedValue = "gstWeightName";
	vm.gstValues = [];
	vm.marketJSON = [];
	vm.vehicleLines=[];
	
	vm.gstColumns = [{
		'mData': 'gstWeightName',
		'aTargets': [1],
		sDefaultContent: '',
		sClass:"text-center"
	}, {
		'mData': 'gstWeightValue',
		'aTargets': [2],
		sDefaultContent: '',
		mRender : function(gstWeightValue,type,fullObj) {
			var ngModelString = fullObj.gstWeightName + "_value";
			$scope[ngModelString] = gstWeightValue;
			return '<div class="row col-xs-12 form-group">\n\
					<input class="form-control input-sm" type="text" digit-decimal-validator="_._" \n\
					id="'+ ngModelString + '" name="'+ ngModelString +'" ng-model="'+ ngModelString +'"/>\n\
				</div>'
		},
		sClass:"text-center",
		"fnCreatedCell": function (nTd, sData, oData, iRow, iCol){
			$compile(nTd)($scope)
         }
	}];
	
	vm.gstColumnDefs = [{
		'bSortable' : false,
		'aTargets' : [ 0 ]
	}, {
		'bSortable' : true,
		'aTargets' : [ 1 ]
	},{
		'bSortable' : false,
		'aTargets' : [ 2 ]
	}];
	
	vm.gstOverrideOptions = {
		'bPaginate': false,
		'bLengthChange': true,
		'bFilter': true,
		'bDestroy': true,
		"bInfo" : false,
		'aaSorting': [
			[1, 'asc']
		],
	};
/* Edit Data table configuration Ends here */
	
	ModelSettingsService.getModelSettingsMarkets(vm.businessProcess,vm.marketGroup).then(function(responseData) {
		vm.marketJSON = responseData;
		vm.vehicleLines = responseData.markets;
		if(!(vm.selectedMarket === undefined || vm.selectedMarket === "")) {
			vm.loadModels();
		}
		if(!(vm.selectedModel === undefined || vm.selectedModel === "")) {
			vm.loadModelYears();
		}
		if($scope.isDataReceivedFromOgm)
			vm.loadModelSettings();
		$scope.isDataReceivedFromOgm = true;
		$scope.isLoadingIndicator = false;
	},function(error){
		WcAlertConsoleService.addMessage({
			message: $translate.instant('application.errors.modelSettingsListError', {error: error}),
			type: 'danger',
			multiple: false,
			removeErrorOnStateChange: true
		});
		$scope.isLoadingIndicator = false;
	});
	
	$scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
		if(fromState.name === "model-settings") {
			ModelSettingsService.selectedMarket = "";
			ModelSettingsService.selectedModelYear = "";
			ModelSettingsService.selectedModel = "";
			ModelSettingsService.operation = "";
			ModelSettingsService.linkStatus = true;
		}
	});
	
	vm.loadModels = function() {
		vm.models = ModelSettingsService.loadModels(vm.marketJSON,vm.selectedMarket);
		if(vm.models != undefined && vm.models.length > 0) {
			if(vm.isDropdownValuesChanged || vm.selectedModel === undefined || vm.selectedModel === "") {
				vm.selectedModel = "ALL";
			}
			if(!vm.isFromViewPage) {
				vm.modelYears = [];
				vm.selectedModelYear = "ALL";
				if($scope.isDataReceivedFromOgm)
					vm.loadModelSettings();
			}
		} else {
			vm.models = [];
			vm.selectedModel = "";
			vm.modelYears = [];
			vm.selectedModelYear = "";
			vm.displayModelMarketSettings=false;
		}
		$scope.$broadcast('isAuthorized',MarketGroupSelectModalService.isAuthorisedParam(this.selectedMarket)+":WRITE");
	}
	
	vm.loadModelYears = function() {
		vm.isFormSubmitted = false;
		if(vm.selectedModel === "ALL") {
			vm.modelYears = [];
		} else {
			vm.modelYears = ModelSettingsService.loadModelYears(vm.marketJSON, vm.selectedMarket,vm.selectedModel);
		}
		if(!vm.isFromViewPage)
			vm.selectedModelYear = "ALL";
		vm.isFromViewPage = false;
		ModelSettingsService.isFromViewPage = false;
		if($scope.isDataReceivedFromOgm)
			vm.loadModelSettings();
	}
	
	vm.loadModelSettings = function() {
		$scope.isLoadingIndicator = true;
		if(!isEmpty(vm.selectedMarket) && !isEmpty(vm.selectedModel) && !isEmpty(vm.selectedModelYear)){
			WcAuthorizationService.isAuthorized(["ModelSettings:execute_"+ MarketGroupSelectModalService.isAuthorisedParam(vm.selectedMarket)+":WRITE"],null).then(angular.bind(this, function(authorized) {
				$scope.linkStatus = !authorized;
					ModelSettingsService.getModelSettings(vm.selectedMarket, vm.selectedModelYear, vm.selectedModel, vm.businessProcess, vm.marketGroup).then(function(response){
						vm.modelMarketSettingsList = response;
						vm.constructEditVehicleSettingsPrototypes(vm.modelMarketSettingsList);
						vm.displayModelMarketSettings = true;
						$scope.isDataReceivedFromOgm = true;
						$scope.isLoadingIndicator = false;
					},function(error){
						vm.displayModelMarketSettings = false;
						$scope.isLoadingIndicator = false;
					});
			}));
		}
	}
	vm.loadModelSettings();
	
	function isEmpty(val){
	    return (val === undefined || val == null || val.length <= 0) ? true : false;
	};
	
	vm.constructEditVehicleSettingsPrototypes = function(modelSettingsEditObj) {
		var modelSettingsProto = new ModelSettingsPrototype();
		var marketSettingsProto = new ModelMarketSettingsPrototype();
		modelSettingsProto.marketKey = modelSettingsEditObj.marketKey;
		modelSettingsProto.marketName = modelSettingsEditObj.marketName;
		modelSettingsProto.modelKey = modelSettingsEditObj.modelKey;
		modelSettingsProto.modelName = modelSettingsEditObj.modelName;
		modelSettingsProto.modelYear = modelSettingsEditObj.modelYear;
		
		
		marketSettingsProto.salesHorizon = parseInt(modelSettingsEditObj.modelMarketSettings.salesHorizon) > 0 
												? parseInt(modelSettingsEditObj.modelMarketSettings.salesHorizon) : undefined;
		marketSettingsProto.projectionHorizon = parseInt(modelSettingsEditObj.modelMarketSettings.projectionHorizon) > 0 
												? parseInt(modelSettingsEditObj.modelMarketSettings.projectionHorizon) : undefined;
		marketSettingsProto.mixThreshold = parseFloat(modelSettingsEditObj.modelMarketSettings.mixThreshold) > 0 
												? parseFloat(modelSettingsEditObj.modelMarketSettings.mixThreshold) : undefined;
		modelSettingsProto.modelMarketSettings = marketSettingsProto;
		
		angular.forEach(modelSettingsEditObj.modelGSTSettings,function(gstSettingsObj) {
			var gstPrototype = new ModelGlobalSalesTypePrototype();
			gstPrototype.gstWeightName = gstSettingsObj.gstWeightName;
			gstPrototype.gstWeightValue = parseFloat(gstSettingsObj.gstWeightValue);
			modelSettingsProto.modelGSTSettings.push(gstPrototype);
		});
		
		$scope.salesHorizon = parseInt(modelSettingsProto.modelMarketSettings.salesHorizon);
		$scope.projectionHorizon = parseInt(modelSettingsProto.modelMarketSettings.projectionHorizon);
		$scope.mixThreshold = parseFloat(modelSettingsProto.modelMarketSettings.mixThreshold);
		$scope.modelSettingsProtoType=modelSettingsProto;
		$scope.gstDataTableMappings = $scope.modelSettingsProtoType.modelGSTSettings;
	}
	
	vm.validateOnSave = function() {
		var isValid = vm.validateSetAllWeight();
		if(isValid && $scope.gstDataTableMappings.length > 0) {
			isValid = vm.validateIndividualWeights();
		}
		return isValid;
	}
	
	vm.validateSetAllWeight = function() {
		var isValid = true;
		if($scope.weightMasterInput == undefined || $scope.weightMasterInput === "") {
			if(vm.gstValues.length === 0) {
				vm.isApplyWeightsInvalid = false;
				vm.isWeightsNotApplied = false;
				isValid = true;
			}
		} else {
			if($scope.weightMasterInput === "." || $scope.weightMasterInput < 0 || $scope.weightMasterInput > 1) {
				vm.isApplyWeightsInvalid = true;
				vm.isWeightsNotApplied = false;
				isValid = false;
			} else if(vm.gstValues.length === 0) {
				vm.isApplyWeightsInvalid = false;
				vm.isWeightsNotApplied = true;
				isValid = false;
			} else if(vm.gstValues.length > 0) {
				$.each(vm.gstValues, function(index, gstWeightName) {
					var gstWeightValue = angular.element('#' + gstWeightName + "_value").val();
					if($scope.weightMasterInput != gstWeightValue) {
						isValid = false;
					} 
				});
				if(!isValid) {
					vm.isApplyWeightsInvalid = false;
					vm.isWeightsNotApplied = true;
				}
			}
		}
		return isValid;
	}
	
	vm.validateIndividualWeights = function() {
		var isValid = true;
		$.each($scope.gstDataTableMappings, function(index, gst) {
			var weightValueElement = angular.element('#' + gst.gstWeightName + "_value");
			var gstWeightValue = weightValueElement.val();
			if(gstWeightValue === undefined || gstWeightValue === "" || gstWeightValue === "."
					|| gstWeightValue < 0 || gstWeightValue > 1) {
				weightValueElement.addClass("error");
				isValid = false;
			} else {
				weightValueElement.removeClass("error");
			}
		});
		if(!isValid) {
			vm.isApplyWeightsInvalidIndividual = true;
		}
		return isValid;
	}
	
	vm.clearErrorIndicators = function() {
		vm.isApplyWeightsInvalid = false;
		vm.isWeightsNotApplied = false;
		vm.isApplyWeightsInvalidIndividual = false;
		$scope.weightMasterInput = "";
		$.each($scope.gstDataTableMappings, function(index, gst) {
			angular.element(document.querySelector('#' + gst.gstWeightName + "_value")).removeClass("error");
		});
	}
	
	vm.saveSettings = function() {
		vm.isFormSubmitted = !0;
		if(vm.validateOnSave() && $scope.modelSettingsForm.$valid) {
			vm.clearErrorIndicators();
			
			var modelSettingsProto = new ModelSettingsPrototype();
			var settings = new ModelMarketSettingsPrototype();
			modelSettingsProto.loggedInUserId=vm.user;
			modelSettingsProto.marketKey = vm.selectedMarket;
			modelSettingsProto.modelYear = vm.selectedModelYear;
			modelSettingsProto.modelKey = vm.selectedModel;
			modelSettingsProto.businessProcess = vm.businessProcess;
			modelSettingsProto.marketGroup = vm.marketGroup;
			settings.salesHorizon = $scope.salesHorizon;
			settings.projectionHorizon = $scope.projectionHorizon;
			settings.mixThreshold = $scope.mixThreshold;
			modelSettingsProto.modelMarketSettings = settings;
			
			$.each($scope.gstDataTableMappings, function(index, gstWeightObj) {
				var gstProto = new ModelGlobalSalesTypePrototype();
				var scopeWeightNgModel = gstWeightObj.gstWeightName + "_value";
				gstProto.gstWeightName = gstWeightObj.gstWeightName;
				gstProto.gstWeightValue = $scope[scopeWeightNgModel];
				modelSettingsProto.modelGSTSettings.push(gstProto);
			});
			ModelSettingsService.saveSettings(JSON.stringify(modelSettingsProto));
		}
	};
	
	vm.setMasterWeightValue = function() {
		if($scope.weightMasterInput == undefined || $scope.weightMasterInput === "" || $scope.weightMasterInput === ".") {
			vm.isApplyWeightsInvalid = true;
			vm.isWeightsNotApplied = false;
		} else if($scope.weightMasterInput < 0 || $scope.weightMasterInput > 1) {
			vm.isApplyWeightsInvalid = true;
			vm.isWeightsNotApplied = false;
		} else if(vm.gstValues.length === 0 && ($scope.weightMasterInput >= 0 && $scope.weightMasterInput <= 1)) {
			vm.isApplyWeightsInvalid = false;
			vm.isWeightsNotApplied = true;
		} else if(vm.gstValues.length > 0 && ($scope.weightMasterInput >= 0 && $scope.weightMasterInput <= 1)) {
			$.each(vm.gstValues,function(index, gstWeightName) {
				var scopeWeightNgModel = gstWeightName + "_value";
				$scope[scopeWeightNgModel] = $scope.weightMasterInput;
				var scopeWeightNgCheckbox = "checkbox_" + gstWeightName;
				document.getElementById(scopeWeightNgCheckbox).checked = false;
				angular.element("#" + scopeWeightNgCheckbox).parent().parent().removeClass("selected");
				angular.element(document.querySelector("#" + scopeWeightNgModel)).removeClass("error");
			});
			document.getElementById("toggleAll").checked = false;
			$scope.weightMasterInput = "";
			vm.gstValues.length = 0;
			vm.isApplyWeightsInvalid = false;
			vm.isWeightsNotApplied = false;
			vm.checkAndClearIndividualGST();
		}
	};
	
	vm.checkAndClearIndividualGST = function() {
		if($scope.gstDataTableMappings.length > 0 && ($scope.weightMasterInput >= 0 && $scope.weightMasterInput <= 1)) {
			var showError = false;
			$.each($scope.gstDataTableMappings, function(index, gst) {
				var weightValueElement = angular.element('#' + gst.gstWeightName + "_value");
				var gstWeightValue = weightValueElement.val();
				if(weightValueElement.hasClass("error")) {
					showError = true;
				}
			});
			vm.isApplyWeightsInvalidIndividual = showError;
		}
	}
	
	vm.goToVehicleSettingsList = function() {
		ModelSettingsService.operation = "backToViewModels";
		$state.go('view-models', {}, {reload: true});
	};
	
}]);
