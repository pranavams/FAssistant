'use strict';

angular.module('RenditionProposalModule').factory('SaveOverridesPrototype',function() {
	
	function SaveOverridesPrototype(saveOverridesObj) {
		this.market = '';
		this.model = '';
		this.modelYear = '';
		this.businessProcess = '';
		this.marketGroup ='';
		this.userID ='';
		this.productionMonth = '';
		this.constraints = [];
		this.overrides = [];
		
		if(saveOverridesObj) {
			angular.extend(this, saveOverridesObj);
		}
	};
	return SaveOverridesPrototype;
});