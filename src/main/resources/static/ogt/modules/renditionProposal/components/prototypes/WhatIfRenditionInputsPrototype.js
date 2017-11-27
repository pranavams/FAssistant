'use strict';

angular.module('RenditionProposalModule').factory('WhatIfRenditionInputsPrototype',function() {
	
	function WhatIfRenditionInputsPrototype(whatIfRenditionInputsObj) {
		this.entityId = '';
		this.overrideValue = '';
		this.overrideReason = '';
		this.optimizationValue = '';
		this.optimizationReason = '';

		if(whatIfRenditionInputsObj) {
			angular.extend(this, whatIfRenditionInputsObj);
		}
	};
	return WhatIfRenditionInputsPrototype;
});