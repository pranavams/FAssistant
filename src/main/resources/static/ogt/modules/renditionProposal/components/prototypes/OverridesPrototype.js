'use strict';

angular.module('RenditionProposalModule').factory('OverridesPrototype',function() {
	
	function OverridesPrototype(overridesObj) {
	
		this.featureCode = undefined;
		this.overrideValue = undefined;
		if(overridesObj) {
			angular.extend(this, overridesObj);
		}
	};
	return OverridesPrototype;
});