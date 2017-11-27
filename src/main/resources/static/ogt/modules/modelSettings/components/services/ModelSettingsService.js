'use strict';

angular.module('ModelSettingsModule').service('ModelSettingsService', 
		['$q','$translate','WcAlertConsoleService','WcHttpEndpointPrototype','$http',
		 function($q,$translate,WcAlertConsoleService,WcHttpEndpointPrototype,$http) {
			
	this.selectedMarket = "";
	this.selectedModelYear = "";
	this.selectedModel = "";
	
	this.modelYears = [];
	this.models = [];
	
	this.modelSettings = undefined;
	this.operation = "";
	this.linkStatus = true;
	this.isFromViewPage = false;

	this.loadModels = function(array,selectedMarket) {
		this.selectedMarket = selectedMarket;
		var models = [];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				models = market.models
			}
		});
		this.models = models;
		return this.models;
	}
	
	this.loadModelYears = function(array, selectedMarket,selectedModel) {
		this.selectedModel = selectedModel;
		var modelYears = [];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				angular.forEach(market.models, function(model, index){
					if(model.key == selectedModel){
						$.each(model.modelYears,function(index,modelYear){
							if(modelYear.modelYear!=="ALL"){
								modelYears.push(modelYear.modelYear);
							}
						});
					}
				});
			}
		});
		this.modelYears = modelYears;
		return this.modelYears;
	}
	
	
	this.getModels = function(businessProcess,marketGroup) {
		var deferred= $q.defer();
		var viewModelsEndPoint = new WcHttpEndpointPrototype('/ogt/productManager/modelSettings/ViewModels/view');
		viewModelsEndPoint.get({params: {'marketGroup': marketGroup,'businessProcess':businessProcess}}).then(function(response){
			console.log('response.data' + response.data);
			deferred.resolve(response.data);
		}, function(error) {
			if(error.status === 0 ) {
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.corsError', {error: error}),
					type: 'danger'
				});
			}
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelSettingsListError', {error: error}),
				type: 'danger'
			});
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	this.getModelSettingsMarkets = function(businessProcess,marketGroup) {
		var deferred = $q.defer();
		var rest = new WcHttpEndpointPrototype('marketInfo/ModelSettings/markets/business');
		rest.get({params: {'marketGroup': marketGroup,'businessProcess':businessProcess}}).then(function(response){
			deferred.resolve(response.data);
		}, function(error) {
			if(error.status === 0 ) {
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.corsError', {error: error}),
					type: 'danger'
				});
			}
			deferred.reject(error);
		});
		return deferred.promise;
	}
	
			
	this.getModelSettings = function(selectedMarket, selectedModelYear, selectedModel, businessProcess, marketGroup) {
		var rest = new WcHttpEndpointPrototype('/ogt/productManager/modelSettings');
		if(selectedMarket === undefined) selectedMarket = "";
		return rest.get({params : {'market' : selectedMarket, 'modelYear' : selectedModelYear, 'model' : selectedModel, 'businessProcess':businessProcess, 'marketGroup': marketGroup}}).then(angular.bind(this, function(response) {
			this.modelSettings = response.data;
			return response.data;
		}), function(error) {
			error = error.data.exception;
			if(error.status === 0 ) {
				WcAlertConsoleService.addMessage({
					message: $translate.instant('conflictNotification.corsError', {error: error}),
					type: 'danger'
				});
			}
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelSettingsEditError', {error: error}),
				type: 'danger'
			});
			return $q.reject(error);
		});
	};
	
	this.saveSettings = function(modelSettingsProto) {
		var rest = new WcHttpEndpointPrototype('/ogt/productManager/modelSettings/save');
		return rest.post(modelSettingsProto).then(angular.bind(this, function(response) {
			WcAlertConsoleService.addMessage({
	            message: $translate.instant('application.success.settingsSaveSuccess'),
	            type: 'success'
	          });
			return response;
		}), function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.modelSettingsSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
			return $q.reject(error);
		});
	};
	
}]);