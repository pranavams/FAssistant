'use strict';

angular.module('RenditionProposalModule').factory('WhatIfSubmitJobPrototype',function() {
	
	function WhatIfSubmitJobPrototype(whatIfSubmitJobObj) {
		this.loggedInUserId = '';
		this.sessionId = '';
		this.productionMonth = '';
		this.totalOrdersToGenerate = '';
		this.market = '';
		this.renditionInputs = [];

		if(whatIfSubmitJobObj) {
			angular.extend(this, whatIfSubmitJobObj);
		}
	};
	return WhatIfSubmitJobPrototype;
});