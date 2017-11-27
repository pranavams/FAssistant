'use strict';

angular.module('PreferencePatternModule').factory('MonthPrototype',function() {
	
	function MonthPrototype(monthObj) {
		this.name = '';
		this.weekIndexes = [];
		this.columnIndex = '';
		this.colspan = '';
		this.lockedInPeriod = false;
		this.getColspan = function(){
			return this.weekIndexes.length + 2;
		}
		if(monthObj) {
			angular.extend(this, monthObj);
		}
	};
	return MonthPrototype;
	
});