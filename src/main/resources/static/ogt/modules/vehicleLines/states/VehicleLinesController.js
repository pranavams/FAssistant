'use strict';

angular.module('Ogt.ComponentsModule').controller('VehicleLinesController', ['WcHttpEndpointPrototype','VehicleLineService','ogtVars','$scope','$rootScope','MarketGroupSelectModalService',
                                                                             function(WcHttpEndpointPrototype,VehicleLineService,ogtVars,$scope,$rootScope,MarketGroupSelectModalService) {

	this.vehicleLineMappingTable = {};
	this.selectedMarket = '';
	this.selectedModel = '';
	this.selectedModelYear = '';
	this.modelYears =[];
	this.models =[];
	this.isDisplayTabs = true;
	this.clearSelectedModelValues=function()
	{
		this.selectedMarket = '';
		this.selectedModel = '';
		this.selectedModelYear = '';
		this.modelYears =[];
		this.models =[];
		this.isFormSubmitted = false;
	};
		
	this.markets = VehicleLineService.getMarkets(ogtVars.vehicleLines);
	var marketsObj=this.markets;
	if(marketsObj.length == 1) {
		this.selectedMarket = marketsObj[0].key;	
		VehicleLineService.selectedMarket=this.selectedMarket ;
		VehicleLineService.getModels(ogtVars.vehicleLines,this.selectedMarket).then(angular.bind(this, function(response){
			this.models=response;
		}));




	}
	this.loadModels=function(){
		$rootScope.$broadcast('display-tabs',false);
		return VehicleLineService.getModels(ogtVars.vehicleLines,this.selectedMarket).then(angular.bind(this, function(response){
			this.models=response;
			this.selectedModel = '';
			this.selectedModelYear = '';
			this.modelYears =[];
			this.isDisplayTabs = false;
			this.isFormSubmitted = false;
			$scope.$broadcast('isAuthorized',MarketGroupSelectModalService.isAuthorisedParam(this.selectedMarket)+":WRITE");
		
		}))
	};
	
	this.loadModelYears=function(){
		this.selectedModelYear = '';
		$rootScope.$broadcast('display-tabs',false);
			return  VehicleLineService.getModelYears(ogtVars.vehicleLines,this.selectedMarket,this.selectedModel).then(angular.bind(this, function(response){
				this.modelYears= response;
				var modelYearsObj=this.modelYears;
				var maxModelYear = 0;
				this.isDisplayTabs = false;
			
				angular.forEach(modelYearsObj,function(modelYearOb, modelYearIndex) {
					if(parseFloat(maxModelYear) < parseFloat(modelYearOb.modelYear)) {
						maxModelYear = parseFloat(modelYearOb.modelYear);
					}
				});
				VehicleLineService.currentModelYear = maxModelYear;
			}))
			
	};

	 this.orderByValue = function (value) {
	        return value;
	    }; 
	    
}]);
