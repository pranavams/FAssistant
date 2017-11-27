'use stict';

angular.module('ModelSettingsModule').factory('ModelMarketSettingsPrototype',function() {
	
	function ModelMarketSettingsPrototype(modelMarketSettingsObject) {
		this.salesHorizon = '';
		this.projectionHorizon = '';
		this.mixThreshold = '';
		
		if(modelMarketSettingsObject) {
			angular.extend(this,modelMarketSettingsObject);
		}
	};
	return ModelMarketSettingsPrototype;
	
});