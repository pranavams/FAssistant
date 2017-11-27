'use strict';

angular.module('EntityMixModule').service('EntityMixService',['WcHttpEndpointPrototype','MarketGroupSelectModalService','$q',
                                                              'WcAlertConsoleService','UserService','$translate','$uibModal',
         function(WcHttpEndpointPrototype,MarketGroupSelectModalService,$q,WcAlertConsoleService,UserService,$translate,$uibModal){
	var self= this;
	self.getModelsMonthsEndpoint = new WcHttpEndpointPrototype('marketInfo/EntityMix/markets/business');
	self.getModelsMonthsMockEndPoint = new WcHttpEndpointPrototype('ogt/productAdmin/entityMix/models');
	self.getEntityMixDataEndPoint = new WcHttpEndpointPrototype('ogt/productAdmin/entityMix');
	self.getApplyWeeklyVolumesEndPoint = new WcHttpEndpointPrototype('ogt/productAdmin/entityMix/applyWeeklyVolumes');
	
	self.getModels = function(){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getModelsMonthsEndpoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess}}).then(function(response){
				//self.getModelsMonthsMockEndPoint.get().then(function(response){
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
	
	self.getEntityMixData = function(reqObj){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getEntityMixDataEndPoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
			'model': reqObj.modelKey, 'modelyear': reqObj.modelYear,'channel':reqObj.channelKey, 'startMonth': reqObj.startMonth, 'endMonth': reqObj.endMonth, 'loggedInUserId' : UserService.getUserId()}}).then(function(response){
			deferred.resolve(response.data.entityMix);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.entityMixGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.getAppliedWeeklyVolumes = function(reqObj){
		self.selectedMarketGroup=MarketGroupSelectModalService.selectedMarketGroup;
		self.selectedBusinessProcess=MarketGroupSelectModalService.selectedBusiness;
		var deferred = $q.defer();
		self.getApplyWeeklyVolumesEndPoint.get({params: {'marketGroup': self.selectedMarketGroup,'businessProcess':self.selectedBusinessProcess,
			'model': reqObj.modelKey, 'modelyear': reqObj.modelYear,'channel':reqObj.channelKey, 'startMonth': reqObj.startMonth, 'endMonth': reqObj.endMonth, 'loggedInUserId' : UserService.getUserId()}}).then(function(response){
			deferred.resolve(response.data.entityMix);
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.entityMixGetError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
	
	self.openModal = function(){
		var modalInstance = $uibModal.open({
			templateUrl: './ogt/modules/entityMix/components/modals/entityMixAlert.html',
			controller: 'EntityMixAlertController as entityMixAlertCtrl',
			backdrop: 'static',
			keyboard: false
		});
		return modalInstance.result.then(angular.bind(this, function() {
			return "OK";
		}));
	};
}]);
