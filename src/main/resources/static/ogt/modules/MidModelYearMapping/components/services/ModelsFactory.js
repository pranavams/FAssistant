"use strict";

angular.module('MidModelYearMappingModule')
	.factory('ModelsFactory',ModelsFactory);

function ModelsFactory(){
	var forMarket = function(selectedMarket){ return function(marketObj){ return marketObj.key === selectedMarket;} };
	var forModel = function(selectedModel){ return function(modelObj){ return modelObj.key === selectedModel;}; };
	var forModelYear = function(selectedModelYear){ return function(modelYearObj){
		return modelYearObj.modelYear === selectedModelYear;
	}; };
	return {
		getMarkets : function(marketsList){
			return marketsList;
		},
		getModels : function(marketsList,selectedMarket){
			return selectedMarket && marketsList.length > 0 ? marketsList.filter(forMarket(selectedMarket))[0].models : [];
		},
		getModelYears : function(modelsList,selectedModel){
			return selectedModel && modelsList.length > 0 ? modelsList.filter(forModel(selectedModel))[0].modelYears : [];
		},
		getBusinessKey : function(modelYearsList,selectedModelYear){
			return selectedModelYear && modelYearsList.length > 0 ? modelYearsList.filter(forModelYear(selectedModelYear))[0].businessKey :'';
		}
		
	};
}