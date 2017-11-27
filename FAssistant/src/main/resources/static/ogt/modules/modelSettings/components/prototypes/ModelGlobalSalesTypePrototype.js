'use stict';

angular.module('ModelSettingsModule').factory('ModelGlobalSalesTypePrototype',function() {
	
	function ModelGlobalSalesTypePrototype(modelGSTObject) {
		this.gstWeightName = '';
		this.gstWeightValue = '';
		
		if(modelGSTObject) {
			angular.extend(this,modelGSTObject);
		}
	};
	return ModelGlobalSalesTypePrototype;
	
});