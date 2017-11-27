'use strict',

angular.module('ModelSettingsModule').factory('ModelSettingsListPrototype',function() {
	
	function ModelSettingsListPrototype(modelSettingsListObject) {
		this.marketKey = '';
		this.marketName = '';
		this.modelKey = '';
		this.modelName = '';
		this.modelYear = '';
		this.status = '';
		this.editLink = '';
		
		if(modelSettingsListObject) {
			angular.extend(this,modelSettingsListObject);
		}
		
	};
	ModelSettingsListPrototype.prototype = {
		createFrom: function(modelSettingsListObject) {
			if (modelSettingsListObject) {
				angular.extend(this, modelSettingsListObject);
			}
		},
		compareTo: function(modelSettingsListObject) {
			return (this.modelKey == modelSettingsListObject.modelKey);
		}
	};
	return ModelSettingsListPrototype;
	
});