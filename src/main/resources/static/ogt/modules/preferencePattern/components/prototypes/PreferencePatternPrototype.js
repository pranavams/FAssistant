'use strict';

angular.module('PreferencePatternModule').factory('PreferencePatternPrototype',function() {
	
	function PreferencePatternPrototype(preferencePatternObj) {
		this.operatingPlan = [];  
		this.preferences = [];
		this.loggedInUser = '';
		this.isCrewNonCrew = '';
		this.modelKey = '';
		this.modelYear = '';
		if(preferencePatternObj) {
			angular.extend(this, preferencePatternObj);
		}
	};
	return PreferencePatternPrototype;
	
});