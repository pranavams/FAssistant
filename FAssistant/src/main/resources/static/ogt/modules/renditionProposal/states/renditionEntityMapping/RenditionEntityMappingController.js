'use strict';

angular.module('RenditionProposalModule').controller('RenditionEntityMappingController',
		['$scope','RenditionProposalService','modelsList','MarketGroupSelectModalService',
		 function($scope,RenditionProposalService,modelsList,MarketGroupSelectModalService) {
			
			this.modelsList = modelsList;
			this.markets = [];
			this.vehicleLines = []; 
			this.selectedMarket = RenditionProposalService.selectedMarket;
			this.selectedModel = RenditionProposalService.selectedModel;
			this.isDisplayDataTable = false;
			this.populateDataTable = [];
			this.vehiclesToUpdate = [];
			
			this.clearSelectedModelValues=function() {
				this.selectedMarket = '';
				this.selectedModel = '';
				this.models =[];
				this.isFormSubmitted = false;
			};
			
			this.markets = RenditionProposalService.getMarkets(this.modelsList);
			RenditionProposalService.getModels(this.modelsList,this.selectedMarket).then(angular.bind(this, function(response){
				this.models=response;
			}));
			
			this.searchEntityMappingList = function(){
				this.populateDataTable = [];
				if(!isEmpty(this.selectedMarket) && !isEmpty(this.selectedModel)) {
					$scope.isLoadingIndicator = true;
					return RenditionProposalService.getEntityMappingList(this.selectedMarket,this.selectedModel).then(angular.bind(this, function(response) {
						$scope.isLoadingIndicator = false;
						this.populateDataTable = response;
						this.isDisplayDataTable= true;
					}));
				} else{
					this.isDisplayDataTable= false;
				}
			};
			
			this.searchEntityMappingList();
			
			function isEmpty(val){
			    return (val === undefined || val == null || val.length <= 0) ? true : false;
			};
			
			this.hideDataTable=function(){
				this.isDisplayDataTable= false;
			};
			
			var marketsObj=this.markets;
			if(marketsObj.length == 1) {
				this.selectedMarket = marketsObj[0].key;	
				RenditionProposalService.selectedMarket=this.selectedMarket ;
				RenditionProposalService.getModels(this.modelsList,this.selectedMarket).then(angular.bind(this, function(response){
					this.models=response;
				}));
			}
			
			this.loadModels=function(){
					$scope.$broadcast('display-tabs',false);
					return RenditionProposalService.getModels(this.modelsList,this.selectedMarket).then(angular.bind(this, function(response){
						this.models=response;
						this.selectedModel = '';
						this.isDisplayTabs = false;
						this.isFormSubmitted = false;
						$scope.$broadcast('isAuthorized',MarketGroupSelectModalService.isAuthorisedParam(this.selectedMarket)+":WRITE");
					}))
				};
		}]);