'use strict';

angular.module('RenditionProposalModule').factory('RenditionProposalOverridesPrototype',function() {
	
	function RenditionProposalOverridesPrototype(renditionProposalOverridesObj) {
		this.overrideValue = '';
		this.overrideReason = '';
		this.optimizationValue = '';
		this.optimizationReason = '';

		if(renditionProposalOverridesObj) {
			angular.extend(this, renditionProposalOverridesObj);
		}
	};
	return RenditionProposalOverridesPrototype;
	
});