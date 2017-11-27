'use strict';

angular.module('RenditionProposalModule').
service('RenditionProposalService', ['WcHttpEndpointPrototype','$http','$q','WhatIfSubmitJobPrototype', 'WhatIfRenditionInputsPrototype','RenditionEntityMappingPrototype',
                                     'UserService','WcAlertConsoleService','$translate','EntityMappingListService','MarketGroupSelectModalService',
                                     function(WcHttpEndpointPrototype, $http, $q, WhatIfSubmitJobPrototype, WhatIfRenditionInputsPrototype,RenditionEntityMappingPrototype,
                                    		 UserService, WcAlertConsoleService, $translate,EntityMappingListService,MarketGroupSelectModalService) {

	this.marketInformationEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/models');
	this.renditionProposalEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/');
	this.renditionProposalCompletionStatusEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/sessions/job/status');
	this.renditionProposalCommitEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/commit');
	this.renditionProposalUnlockEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/unlock');
	this.commitStatusCheckEndpoint =  new WcHttpEndpointPrototype('/ogt/productManager/rendition/commitStatus');
	this.whatifAnalysisJobSubmissionEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/whatIfAnalysis');
	this.saveOverridesEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/saveOverrides');
	this.getMappingsEndpoint = new WcHttpEndpointPrototype('/ogt/productManager/rendition/getMycoMappings');
	this.renditionProposals='';
	this.selectedMarket='';
	this.selectedModel='';
	this.selectedModelYear='';
	this.modelYears='';
	this.sessionId='';
	this.modifiedOverdOptmArray = [];
	this.changedOverrides = {};
	this.overridesData = undefined;
	this.productionMonth = '';
	this.totalOrdersToGenerate = 0;
	this.initialTotalOrdersToGenerate = 0;	//Only set when first time response comes from OGM.
	this.loggedInUserId = '';
	var self = this;
	this.currentModelYear = '';
	self.businessProcess = '';
	self.marketGroup = '';
	
	this.getMarketInformation = function() {
		self.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		self.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		return this.marketInformationEndpoint.get({params: {'marketGroup': self.marketGroup,'businessProcess': self.businessProcess}}).then(function(response){
			return response.data;
		});
	};
	
	this.getModels = function(array,selectedMarket)
	{
		this.selectedMarket = selectedMarket;
		var deferred = $q.defer();
		var  models=[];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				models=market.models
			}
		});
		deferred.resolve(models);
		return deferred.promise;
	};
	
	
	this.getModelYears = function(array,selectedMarket,selectedModel)
	{
		this.selectedModel=selectedModel;
		var deferred = $q.defer();
		var  modelYears=[];
		angular.forEach(array.markets,function(market,index){
			if(selectedMarket == market.key){
				angular.forEach(market.models, function(model, index){
					if(model.key == selectedModel){
						modelYears = model.modelYears;
					}
				});
			}
		});
		this.modelYears=modelYears;
		deferred.resolve(modelYears);
		return deferred.promise;
	}
	
	this.getMarkets = function(marketsArray) {
		this.markets = marketsArray.markets;
		return marketsArray.markets;
	}
	
	this.getEntityMappingList = function(selectedMarket,selectedModel){
		return this.getMappingsEndpoint.get({params: {'market': selectedMarket,'model':selectedModel, 'businessProcess':self.businessProcess, 'marketGroup': self.marketGroup}}).then(angular.bind(this, function(response) {
			return EntityMappingListService.buildEntityMappingList(response.data);
		}),function(error) {
			return $q.reject(error);
		});
	};
	
	this.getMarketInformationJSON = function() {
		var deferred = $q.defer();
		return  $http.get("ogt/marketInfo.json").then(function(response){
			deferred.resolve(response.data);
			return deferred.promise;
		});
	};
	this.getSessionDetails = function(selectedModelYear) {
		var deferred = $q.defer();
		var CommittedFlag ='';
		var sessionDetails = [];
		this.selectedModelYear=selectedModelYear;
		angular.forEach(this.modelYears, function(modelYr, index){
			if(selectedModelYear == modelYr.modelYear) {
				sessionDetails.push(modelYr.sessionId);
			}
		});
		deferred.resolve(sessionDetails);
		return deferred.promise;
	};
	
	this.commit = function(commitMessage) {
		console.log("commitMessage  "+commitMessage);
		return this.renditionProposalCommitEndpoint.post(commitMessage).then(function(response){
			return response.data;
		});
	};
	this.unlock = function(commitMessage) {
		console.log("commitMessage  "+commitMessage);
		return this.renditionProposalUnlockEndpoint.post(commitMessage).then(function(response){
			return response.data;
		});
	};
	this.getCommitStatus =  function(sessionId) {
		return this.commitStatusCheckEndpoint.get({params: {'sessionId': sessionId}}).then(function(response){
			return response.data;
		});
	};
	this.getRenditionProposals = function(modelYear,sessionId) {
		return this.renditionProposalEndpoint.get({params: {'modelYear':modelYear, 'sessionId': sessionId}}).then(function(response){
			return response.data;
		});
	};
	
	this.saveOverridesData = function(saveOverridesData) {
		showLoadingIndicator(true);
		return this.saveOverridesEndpoint.post(saveOverridesData).then(function(response){
			return response.data;
		}).finally(function() {
			showLoadingIndicator(false);
		});
	};
	
	this.submitWhatIfAnalysisJob = function() {
		var whatIfJobJSON = this.prepareSubmitJobJSON();
		showLoadingIndicator(true);
		return this.whatifAnalysisJobSubmissionEndpoint.post(whatIfJobJSON).then(function(response) {
			WcAlertConsoleService.addMessage({
	            message: $translate.instant('conflictNotification.whatIfAnalysisJobSubmissionSuccess'),
	            type: 'success'
	          });
			return response.data;
		}, function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('conflictNotification.submitJobError', {error: error}),
				type: 'danger',
				multiple: false,
				removeErrorOnStateChange: true
			});
			return $q.reject(error);
		}).finally(function() {
			showLoadingIndicator(false);
		});
	}
	
	function showLoadingIndicator(isShow) {
		if(isShow) {
			$("#loading-cover").show().animate({
	            opacity: 1
	        }, 300), $("#loading-indicator").show().animate({
	            opacity: 1
	        }, 300);
		} else {
			$("#loading-indicator").hide().animate({
                opacity: 0
            }, 10), $("#loading-cover").hide().animate({
                opacity: 0
            }, 10);
		}
	}
	
	this.prepareSubmitJobJSON = function() {
		var submitJobProto = new WhatIfSubmitJobPrototype();
		var self = this;
		var entityIdArr = [];
		
		/*
		 * 1. Check for previous Total Optimization value.
		 * 2. If changed then look for all Optimization array elements.
		 * 3. Calculate the new optimization values and update it in array. 
		 */
		if(self.modifiedOverdOptmArray.length == 0) {
			submitJobProto.loggedInUserId = self.loggedInUserId;
			submitJobProto.sessionId = self.sessionId;
			submitJobProto.productionMonth = self.productionMonth;
			submitJobProto.totalOrdersToGenerate = self.totalOrdersToGenerate;
			submitJobProto.market = self.selectedMarket;
			
			var inputsProto = new WhatIfRenditionInputsPrototype();
			inputsProto.entityId = '';
			inputsProto.overrideValue = '';
			inputsProto.overrideReason = '';
			inputsProto.optimizationValue = '';
			inputsProto.optimizationReason = '';
			submitJobProto.renditionInputs.push(inputsProto);
		}
		
		angular.forEach(self.modifiedOverdOptmArray, function(jobArrObj, index) {
			if(index == 0) {
				submitJobProto.loggedInUserId = self.loggedInUserId;
				submitJobProto.sessionId = self.sessionId;
				submitJobProto.productionMonth = self.productionMonth;
				submitJobProto.totalOrdersToGenerate = self.totalOrdersToGenerate;
				submitJobProto.market = self.selectedMarket;
			}
			var inputsProto = new WhatIfRenditionInputsPrototype();
			inputsProto.entityId = jobArrObj.entityid;
			entityIdArr.push(jobArrObj.entityid);
			inputsProto.overrideValue = jobArrObj.weightedsalesmixoverride != undefined ? jobArrObj.weightedsalesmixoverride : '';
			inputsProto.overrideReason = jobArrObj.weightedsalesmixoverridereason != undefined ? jobArrObj.weightedsalesmixoverridereason : '';
			inputsProto.optimizationValue = jobArrObj.ordermixoverride != undefined ? parseInt((jobArrObj.ordermixoverride * self.totalOrdersToGenerate)/100) + '' : '';
			if(inputsProto.optimizationValue == 0 && inputsProto.optimizationReason =='' )
			{
			inputsProto.optimizationValue ='';
			}
			inputsProto.optimizationReason = jobArrObj.ordermixoverridereason != undefined ? jobArrObj.ordermixoverridereason : '';
			submitJobProto.renditionInputs.push(inputsProto);
		});
		
		angular.forEach(self.renditionProposals, function(renditionObj, index) {
			if(entityIdArr.indexOf(renditionObj.entityid) == -1 && 
					((renditionObj.recollectweightedsalesmixoverride != undefined && renditionObj.recollectweightedsalesmixoverridereason != '') || 
							(renditionObj.recollectordermixoverride != undefined && renditionObj.recollectordermixoverride != ''))) {
				var inputsProto = new WhatIfRenditionInputsPrototype();
				inputsProto.entityId = renditionObj.entityid;
				inputsProto.overrideValue = renditionObj.recollectweightedsalesmixoverride != undefined ? renditionObj.recollectweightedsalesmixoverride : '';
				inputsProto.overrideReason = renditionObj.recollectweightedsalesmixoverridereason != undefined ? renditionObj.recollectweightedsalesmixoverridereason : '';
				inputsProto.optimizationValue = renditionObj.recollectordermixoverride != undefined ? 
						parseInt((renditionObj.recollectordermixoverride * self.totalOrdersToGenerate)/100) + '' : '';
				inputsProto.optimizationReason = renditionObj.recollectordermixoverridereason != undefined ? renditionObj.recollectordermixoverridereason : '';
				if(inputsProto.optimizationValue == 0 && inputsProto.optimizationReason =='' )
					{
					inputsProto.optimizationValue ='';
					}
				submitJobProto.renditionInputs.push(inputsProto);
			}
		});
		
		console.log(' ----- JSON.stringify(submitJobProto) ----' + JSON.stringify(submitJobProto));
		return JSON.stringify(submitJobProto);
	}
	
	this.checkStatus = function(sessionId){
		return this.renditionProposalCompletionStatusEndpoint.get({params: {'sessionId': sessionId}}).then(function(response){
			return response.data;
		});
	};
	
	this.getSumOfOverrides = function(flag){
		
		var   sum=0;
		angular.forEach(this.renditionProposals, function(overrides, index){
			if(flag == "WEIGHTED_SALES")
			{
				sum = sum  + parseFloat(overrides.weightedsalesmixoverride);
			
			}
			else if(flag == "ORDER_MIX")
			{
				sum = sum  + parseFloat(overrides.ordermixoverride);
				
			}
		});
		return sum;
	}

}]);
