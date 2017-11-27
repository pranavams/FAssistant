'use strict';

angular.module('RenditionProposalModule').factory('ConstraintsPrototype',function() {
	
	function ConstraintsPrototype(constraintsObj) {
	
		this.featureCode = undefined;
		this.constraintValue = undefined;
		if(constraintsObj) {
			angular.extend(this, constraintsObj);
		}
	};
	return ConstraintsPrototype;
});