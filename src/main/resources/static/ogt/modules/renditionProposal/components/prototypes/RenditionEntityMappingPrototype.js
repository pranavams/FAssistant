'use strict';

angular.module('RenditionProposalModule').factory('RenditionEntityMappingPrototype',function() {
	
	function RenditionEntityMappingPrototype(renditionEntityMappingObj) {
		this.pTransmission = '';
		this.pEngine = '';
		this.pSvp = '';
		this.pDerivative = '';
		this.pBody = '';
		this.pModelYear = '';
		this.fromEntity = '';
		this.toEntity = '';
		this.cModelYear = '';
		this.cBody = '';
		this.cDerivative = '';
		this.cSvp = '';
		this.cEngine = '';
		this.cTransmission = '';

		if(renditionEntityMappingObj) {
			angular.extend(this, renditionEntityMappingObj);
		}
	};
	return RenditionEntityMappingPrototype;
	
});