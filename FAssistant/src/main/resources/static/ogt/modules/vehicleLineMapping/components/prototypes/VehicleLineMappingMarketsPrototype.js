'use stict';

angular.module('VehicleLineMappingModule').factory('VehicleLineMappingMarketsPrototype',
		['VehicleLineMappingModelsStatusPrototype',function(VehicleLineMappingModelsStatusPrototype) {
	
	function VehicleLineMappingMarketsPrototype(VehicleLineMappingMarketsPrototypeObj) {
		this.key = '';
		this.name = '';
		this.loggedInUserId = '';
		this.businessProcess = '';
		this.marketGroup = '';
		//this.modelsByStatus = new VehicleLineMappingModelsStatusPrototype();
		this.modelsByStatus = [];		
		if(VehicleLineMappingMarketsPrototypeObj) {
			angular.extend(this,VehicleLineMappingMarketsPrototypeObj);
		}
	};
	return VehicleLineMappingMarketsPrototype;
	
}]);