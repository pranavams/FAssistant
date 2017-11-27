'use stict';

angular.module('VehicleLineMappingModule').factory('VehicleLineMappingModelsPrototype',function() {
	
	function VehicleLineMappingModelsPrototype(VehicleLineMappingModelsPrototypeObj) {
		this.key = '';
		this.modelYear = '';
		this.surrogateModel={};
		if(VehicleLineMappingModelsPrototypeObj) {
			angular.extend(this,VehicleLineMappingModelsPrototypeObj);
		}
	};
	return VehicleLineMappingModelsPrototype;
	
});