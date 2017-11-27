'use stict';

angular.module('VehicleLineMappingModule').factory('VehicleLineMappingModelsStatusPrototype',['VehicleLineMappingModelsPrototype',function(VehicleLineMappingModelsPrototype) {
	
	function VehicleLineMappingModelsStatusPrototype(VehicleLineMappingModelsStatusPrototypeObj) {
		this.status = '';
		//this.models = new VehicleLineMappingModelsPrototype();
		this.models = [];		
		if(VehicleLineMappingModelsStatusPrototypeObj) {
			angular.extend(this,VehicleLineMappingModelsStatusPrototypeObj);
		}
	};
	return VehicleLineMappingModelsStatusPrototype;
	
}]);