'use strict';

angular.module('ManageFamiliesModule').service('ManageFamiliesService',['$q','WcHttpEndpointPrototype','$http',
         '$translate','WcAlertConsoleService','$uibModal','UserService',
         function($q,WcHttpEndpointPrototype,$http,$translate,WcAlertConsoleService,$uibModal,UserService){
	
	var self=this;
	//self.marketsModelModelYearEndpoint = new WcHttpEndpointPrototype('marketInfo/WERSEntityMapping/markets');
	self.marketsModelModelYearEndpoint = new WcHttpEndpointPrototype('marketInfo/ManageFamilies/markets/business');
	self.selectedMarket = '';
	self.selectedModel = '';
	self.selectedModelYear = '';
	self.isReload = undefined;
	self.features=[];
	self.modifiedFamiliesArray = [];
	self.user = '';
	self.familyName = '';
	self.isReload = undefined;
	self.businessProcess='';
	self.message='';
	this.getMarketsModelsModelYear = function(businessProcess,marketGroup) {
		var deferred = $q.defer();
			this.marketsModelModelYearEndpoint.get({params: {'marketGroup': marketGroup,'businessProcess':businessProcess}}).then(angular.bind(this, function(response){
				deferred.resolve(response.data);
		}));
		return deferred.promise;
	};
	
	
	
	self.getMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/manageFamilies/retrieve/');
	self.getFamilyList = function(market,model,modelYear,businessProcess,marketGroup){
			var deferred = $q.defer();
			self.getMappingsEndpoint.get({params: {'market':market,'model':model,'modelYear' :modelYear,'businessProcess' :businessProcess,'marketGroup' :marketGroup}}).then(function(response){
				deferred.resolve(response.data);
			},function(error){
				deferred.reject(error);
			});
			return deferred.promise;
		}
	
	self.open = function(){
	var modalInstance = $uibModal.open({
		templateUrl: './ogt/modules/manageFamilies/components/modals/showFeatures.html',
		controller: 'FeaturesController as featuresCtrl',
		backdrop: 'static',
		keyboard: false
	});
	return modalInstance.result.then(angular.bind(this, function() {
		return "OK";
	}));
	};
	
	
	self.saveFamiliesEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/manageFamilies/save/');
	
	self.saveFamilies = function(userId,families){
		self.modifiedFamiliesArrayJson = {"loggedInUserId":userId,
				"familyList":[]};
		self.modifiedFamiliesArrayJson.familyList = families;
		return this.saveFamiliesEndpoint.post(JSON.stringify(self.modifiedFamiliesArrayJson)).then(angular.bind(this, function(response) {
			WcAlertConsoleService.addMessage({
	            message: $translate.instant('application.success.familysavesuccess'),
	            type: 'success'
	          });
			return response.data;
		}), function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.familiesSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
			return $q.reject(error);
		});
	};
}])