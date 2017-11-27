'use strict';

angular.module('EntityMappingModule').service('EntityMappingListService',
		['$q','WcHttpEndpointPrototype','$http','$translate','WcAlertConsoleService','RenditionEntityMappingPrototype','MarketGroupSelectModalService',
        function($q,WcHttpEndpointPrototype,$http,$translate,WcAlertConsoleService,RenditionEntityMappingPrototype,MarketGroupSelectModalService){
	
	var self = this;
	self.selectedMarket = undefined;
	self.selectedModel = undefined;
	self.isReload = undefined;
	self.businessProcess ='';
	self.marketGroup ='';
	self.marketsModelModelYearEndpoint = new WcHttpEndpointPrototype('marketInfo/EntityEntityMapping/markets/business');
	self.getMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/entityMapping');
	self.saveMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productAdmin/entityMapping/save');
	
	self.entityMappingListJson = [];
	
	self.getMarketsModelsModelYear = function(){
		self.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		self.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		var deferred = $q.defer();
		self.marketsModelModelYearEndpoint.get({params: {'marketGroup': self.marketGroup,'businessProcess':self.businessProcess}}).then(function(response){
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}

	self.getEntityMappingList = function(selectedMarket,selectedModel){
		return this.getMappingsEndpoint.get({params: {'market': selectedMarket.key,'model':selectedModel.key,'marketGroup': self.marketGroup,'businessProcess':self.businessProcess}}).then(angular.bind(this, function(response) {
			return self.buildEntityMappingList(response.data);
		}),function(error) {
			return $q.reject(error);
		});
	};
	
	self.buildEntityMappingList = function (response){
		self.entityMappingListJson = [];
		$.each(response.mappedEntities, function(index, mappedEntityObj){
			$.each(mappedEntityObj.descriptions, function(index, descriptionObj){
				self.buildFromAndToEntity(descriptionObj.pmyObject, descriptionObj.cmyObject);
			});
		});
		return self.entityMappingListJson;
	}
	
	
	self.buildFromAndToEntity = function(fromEntityObject,toEntityObject){
		var entityObject = new RenditionEntityMappingPrototype();
		var fromEntitySplittedDesc = fromEntityObject.desc.split(',');
		var toEntitySplittedDesc = toEntityObject.desc.split(',');
		entityObject.pTransmission = fromEntitySplittedDesc[4];
		entityObject.pEngine = fromEntitySplittedDesc[3];
		entityObject.pSvp = fromEntitySplittedDesc[2];
		entityObject.pDerivative = fromEntitySplittedDesc[1];
		entityObject.pBody = fromEntitySplittedDesc[0];
		entityObject.pModelYear = fromEntityObject.modelYear;
		entityObject.fromEntity = fromEntityObject.code;
		entityObject.toEntity = toEntityObject.code;
		entityObject.cModelYear = toEntityObject.modelYear;
		entityObject.cBody = toEntitySplittedDesc[0];
		entityObject.cDerivative = toEntitySplittedDesc[1];
		entityObject.cSvp = toEntitySplittedDesc[2];
		entityObject.cEngine = toEntitySplittedDesc[3];
		entityObject.cTransmission = toEntitySplittedDesc[4];
		self.entityMappingListJson.push(entityObject);
	}
	
	self.getMycoMappings = function(){
		var deferred = $q.defer();
		self.getMappingsEndpoint.get({params: {'market': self.selectedMarket.key,'model':self.selectedModel.key,'marketGroup': self.marketGroup,'businessProcess':self.businessProcess}}).then(function(response){
			deferred.resolve(response.data);
		},function(error){
			deferred.reject(error);
		});
		return deferred.promise;
	}
	
	self.saveMycoMappings = function(mycoMappingJSON){
		var deferred = $q.defer();
		self.saveMappingsEndpoint.post(mycoMappingJSON).then(function(response){
			deferred.resolve(response.data);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.success.entityToEntityMappingSaveSuccess'),
				type: 'success',
			});
		},function(error){
			deferred.reject(error);
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.entityToEntityMappingSaveError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
		});
		return deferred.promise;
	}
}]);	