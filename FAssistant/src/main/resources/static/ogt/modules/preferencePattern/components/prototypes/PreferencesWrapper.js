'use strict';

angular.module('PreferencePatternModule').factory('PreferencesWrapper',function() { // To be set explicitly only onchange.
	//As and when u set this object, add this to the array of parent prototype
	
	function PreferencesWrapper(preferenceObj) {
		this.market = '';
		this.channels = [];
		if(preferenceObj) {
			angular.extend(this, preferenceObj);
		}
	};
	return PreferencesWrapper;
	
});