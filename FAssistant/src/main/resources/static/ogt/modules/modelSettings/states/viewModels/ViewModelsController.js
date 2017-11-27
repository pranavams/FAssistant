'use strict';

angular.module('ModelSettingsModule').controller('ViewModelsController', 
	['$scope', '$compile', '$state', '$translate', '$q', '$timeout',
	 	'ModelSettingsService', 'ModelSettingsListPrototype', 'WcAuthorizationService', 'WcDataTableService','MarketGroupSelectModalService' ,
	 function($scope, $compile, $state, $translate, $q, $timeout, 
		 ModelSettingsService, ModelSettingsListPrototype, WcAuthorizationService, WcDataTableService, MarketGroupSelectModalService) {
	
	var vm = this;
	vm.viewModels = [];
	vm.marketsMap = [];
	vm.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	vm.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
	vm.isAuthorizationComplete = false;
	vm.isDataReceivedFromOgm = false;
	$scope.isLoadingText = true;
	
	vm.constructVehicleListPrototype = function() {
		var deferred = $q.defer();
		ModelSettingsService.getModels(vm.businessProcess,vm.marketGroup).then(function(viewModelsObject) {
			vm.viewModelsListObj = viewModelsObject;
			angular.forEach(viewModelsObject,function(marketObject, index) {
				var marketName = marketObject.marketName;
				var modelYearMap = [];
				WcAuthorizationService.isAuthorized(["ViewModels:execute_"+MarketGroupSelectModalService.isAuthorisedParam(marketObject.marketKey)+":WRITE"],null).then(angular.bind(this, function(authorized) {
					angular.forEach(marketObject.modelYears, function(modelYearObject) {
						var modelsArr = [];
						angular.forEach(modelYearObject.models, function(modelObject) {
							var modelSettingsProto = new ModelSettingsListPrototype();
							modelSettingsProto.marketKey = marketObject.marketKey;
							modelSettingsProto.marketName = marketObject.marketName;
							modelSettingsProto.modelYear = modelYearObject.modelYear;
							modelSettingsProto.modelKey = modelObject.key;
							modelSettingsProto.modelName = modelObject.name;
							modelSettingsProto.status = modelObject.status;
							var link= '';
								if(authorized){
									link = '<div><a ng-click="viewModelsCtrl.goToEdit(\''+modelObject.key+'\')">\n\
									 Edit <span class="glyphicon glyphicon-edit"></span></a></div>';	
								} else{
									link = '<div><a ng-click="viewModelsCtrl.goToView(\''+modelObject.key+'\')">\n\
									 View <span class="glyphicon glyphicon-edit"></span></a></div>';
								}
							modelSettingsProto.editLink = link;
							modelsArr.push(modelSettingsProto);
						});
						modelYearMap[modelYearObject.modelYear+"--"+marketObject.marketKey] = modelsArr;
					});
					vm.marketsMap[marketObject.marketKey] = modelYearMap;
				 }));
			});
			deferred.resolve('Data received');
		},function(error){
			deferred.reject('Data not received');
			$scope.isLoadingText = false;
		});
		return deferred.promise;
	}
	
	vm.constructVehicleListPrototype().then(function(result){
		vm.isAuthorizationComplete = true;
		vm.isDataReceivedFromOgm = true;
		$scope.isLoadingText = false;
		if(ModelSettingsService.operation === "backToViewModels") {
			if(!(ModelSettingsService.selectedMarket === "" || ModelSettingsService.selectedMarket === null)) {
				vm.selectedMarket = ModelSettingsService.selectedMarket;
				vm.loadModelYears();
				vm.selectedModelYear = ModelSettingsService.selectedModelYear;
				vm.populateDataTable();
			}
			ModelSettingsService.operation = "";
		}
	}, function(error){
		$scope.isLoadingText = false;
		console.log('Promise failed while returning from constructPrototype');
	});
	
	vm.loadModelYears = function() {
		$scope.modelYears = [];
		if(vm.selectedMarket != null) {
			var modelYearMap = vm.marketsMap[vm.selectedMarket];
			if(modelYearMap != null) {
				var marketModelArr = Object.keys(modelYearMap);
				angular.forEach(marketModelArr,function(marketModelYear) {
					$scope.modelYears.push(marketModelYear.substr(0, marketModelYear.search("--")));
				});
				vm.selectedModelYear = null;
				this.isDisplayDataTable = false;
				vm.viewModels = [];
				$scope.modelYears.sort();
				$scope.modelYears.reverse();
			} 
		}
	};
	
	vm.populateDataTable = function(){
		if(vm.selectedMarket == null || vm.selectedModelYear == null) {
			this.isDisplayDataTable = false;
			vm.viewModels = [];
		} else {
			var modelYearMap = vm.marketsMap[vm.selectedMarket];
			vm.viewModels = modelYearMap[vm.selectedModelYear+"--"+vm.selectedMarket];
			this.isDisplayDataTable = true;
		}
	}
	
	/* List Data table configuration starts here  */
	this.columns = [ {
		'mData': 'modelName',
		'aTargets': [0],
		sDefaultContent: '',
		sClass:"text-center"
	}, {
		'mData': 'status',
		'aTargets': [1],
		sDefaultContent: '',
		sClass:"text-center"
	},{
		'mData': 'editLink',
		'aTargets': [2],
		sDefaultContent: '',
		sClass:"text-center",
		"fnCreatedCell": function (nTd, sData, oData, iRow, iCol){ 
			$compile(nTd)($scope);
         }
	}];
	
	this.columnDefs = [ {
		'bSortable' : true,
		'aTargets' : [ 0 ]
	}, {
		'bSortable' : true,
		'aTargets' : [ 1 ]
	},{
		'bSortable' : false,
		'aTargets' : [ 2 ],
	}];
	
	this.overrideOptions = {
			'bPaginate': true,
			'sPaginationType': 'bootstrap_full_numbers',
			'sAlign': 'center',
			'bLengthChange': true,
			'bFilter': true,
			'bDestroy': true,
			'aaSorting': [
				[0, 'asc']
			],
			'sDom': '<"row paginator paginator-top"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>>',
			'aLengthMenu': [
				[10, 25, 50, 100, -1],
				[10, 25, 50, 100, 'All']
			],
			'oLanguage': {
				'sLengthMenu': 'Mappings per page: _MENU_',
				'sInfo': 'Showing Mappings: _START_ - _END_ of _TOTAL_',
				'sEmptyTable': 'No Mappings available.'
			},
			'stateSave': true
		};
	
	this.responsiveColumnDefs = {
			initial: {
				columns: [],
				paging: true,
				pagination: 'bootstrap_full_numbers',
				showPagingText: false,
				dom: '<"row paginator paginator-top"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-3"l><"col-xs-4 text-right"i><"col-xs-5 text-right"p>>>'
			},
			breakpoints: [300, 400, 600, 800],
			columns: [
				[0,1,2]
			],
			paging: [false, false, true, true],
			pagination: ['', '', 'bootstrap_two_button', 'bootstrap_normal'],
			showPagingText: [true, true, true, false],
			dom: [
				't',
				't',
				'<"row paginator paginator-top"<"col-xs-6"l><"col-xs-6 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-6"l><"col-xs-6 text-right"p>>',
				'<"row paginator paginator-top"<"col-xs-6"l><"col-xs-6 text-right"p>>t<"row paginator paginator-bottom"<"col-xs-6"l><"col-xs-6 text-right"p>>'
			]
		};

	/* List Data table configuration ends here */
	
	this.goToEdit = function(modelKey) {
		ModelSettingsService.linkStatus = false;
		ModelSettingsService.isFromViewPage = true;
		ModelSettingsService.selectedModel = modelKey;
		this.goToLink();
	};
	
	this.goToView = function(modelKey) {
		ModelSettingsService.linkStatus = true;
		ModelSettingsService.isFromViewPage = true;
		ModelSettingsService.selectedModel = modelKey;
		this.goToLink();
	};
		
	this.goToLink = function(){
		ModelSettingsService.selectedMarket = vm.selectedMarket;
		ModelSettingsService.selectedModelYear = vm.selectedModelYear;
		$state.go('model-settings');
	};
	
	$scope.$watch('isLoadingText',function(){
		if($scope.isLoadingText == true){
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
	
}]);