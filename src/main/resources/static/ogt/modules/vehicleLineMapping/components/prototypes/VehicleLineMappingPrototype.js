'use stict';

angular.module('VehicleLineMappingModule').factory('VehicleLineMappingPrototype',function() {
	
	function VehicleLineMappingPrototype(vehicleLineMappingObject) {
		this.marketKey = '';
		this.marketName = '';
		this.modelKey = '';
		this.modelName = '';
		this.modelYear = '';
		this.currentStatus = '';
		this.uniqueKey = '';
		this.updatedStatus = '';
		this.surrogateModelKey='';
		this.surrogateModelName='';
		this.surrogateModelYear='';
		this.surrogateModel={};
		this.isSurrogate = '';
		this.surrogateModels=[];
		if(vehicleLineMappingObject) {
			angular.extend(this,vehicleLineMappingObject);
		}
	};
	
	VehicleLineMappingPrototype.prototype = {
		createFrom: function(vehicleLineMappingObject) {
			if (vehicleLineMappingObject) {
				angular.extend(this, vehicleLineMappingObject);
			}
		},
		compareTo: function(vehicleLineMappingObject) {
			return (this.uniqueKey == vehicleLineMappingObject.uniqueKey);
		},	
	};
	
	return VehicleLineMappingPrototype;
	
});