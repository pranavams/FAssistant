'use strict';

angular.module('PlannedVolumesModule').service('PlannedVolumesService',['$q','WcHttpEndpointPrototype',
         '$translate','WcAlertConsoleService','MarketGroupSelectModalService','$http','UserService','$uibModal',
         function($q,WcHttpEndpointPrototype,$translate,WcAlertConsoleService,MarketGroupSelectModalService,$http,UserService,$uibModal){
	
	var self=this;
	self.getModelsMonthsEndpoint = new WcHttpEndpointPrototype('marketInfo/WeeklyVolume/markets/business');
	self.getPlannedVolumesEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/preferencePattern/getPlannedVolumes');
	self.getAppliedPrefPatternsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/preferencePattern/applyPreferencePatterns');
	self.savePlannedVolumesEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/preferencePattern/savePlannedVolumes');
	self.deriveEntityVolumesEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/preferencePattern/deriveEntityVolumes');
	self.selectedStartMonth = '';
	self.selectedEndMonth = '';
	self.selectedModel = '';
	self.selectedModelYear = '';
	self.selectedMarketGroup='';
	self.selectedBusinessProcess='';
	self.loggedInUserId = '';
	self.startHorizon = '';
	self.endHorizon = '';
	self.models = [];
	self.modelYears = [];
	self.startMonths = [];
	self.endMonths = [];
	self.isPlannedVolumesSaved = false;
	
	self.getModelMonths = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getModelsMonthsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess}}).then(function(response){
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelsModelYears', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.getPlannedVolumes = function(model,modelYear,startMonth,endMonth){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getPlannedVolumesEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
			'model': model, 'modelyear': modelYear, 'startMonth': startMonth, 'endMonth':endMonth, 'loggedInUserId' : UserService.getUserId()}}).then(function(response){
			deferred.resolve(response.data.plannedVolumes);
		}, function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.plannedVolumesGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.getAppliedPatternsOnPlannedVolumes = function(model,modelYear,startMonth,endMonth){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getAppliedPrefPatternsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
			'model': model, 'modelyear': modelYear, 'startMonth': startMonth, 'endMonth':endMonth, 'loggedInUserId' : UserService.getUserId()}}).then(function(response){
			deferred.resolve(response.data.plannedVolumes);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.applyPatternsGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.savePlannedVolumes = function(plannedVolumesJSON){
		var deferred = $q.defer();
		plannedVolumesJSON.loggedInUser = UserService.getUserId();
		self.savePlannedVolumesEndpoint.post(plannedVolumesJSON).then(function(response){
			deferred.resolve(response);
			WcAlertConsoleService.addMessage({
					message: $translate.instant('application.success.plannedVolumesSaveSuccess'),
					type: 'success'
				});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
					message: $translate.instant('application.errors.plannedVolumesSaveError', {error: error}),
					type: 'danger',
					multiple: false,
					removeErrorOnStateChange: true
				});
		});
		return deferred.promise;
	}
	
	self.deriveEntityVolumes = function(model,modelYear,startMonth,endMonth){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.deriveEntityVolumesEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
			'model': model, 'modelyear': modelYear, 'startMonth': startMonth, 'endMonth':endMonth, 'loggedInUserId' : UserService.getUserId()}}).then(function(response){
			deferred.resolve(response.data);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.success.entityVolDeriveSuccess'),
				type: 'success'
			});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.deriveEntityVolumesGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.openModal = function(model,modelYear,startMonth,endMonth,type){
		self.selectedStartMonth = startMonth;
		self.selectedEndMonth = endMonth;
		self.selectedModel = model;
		self.selectedModelYear = modelYear;
		self.startHorizon = startMonth;
		self.endHorizon = endMonth;
		self.modalType = type;
		var modalInstance = $uibModal.open({
			templateUrl: './ogt/modules/plannedVolumes/components/modals/plannedVolumesAlert.html',
			controller: 'PlannedVolumesAlertController as plannedVolAlertCtrl',
			backdrop: 'static',
			keyboard: false
		});
		return modalInstance.result.then(angular.bind(this, function() {
			return "OK";
		}));
	};
	
}])
