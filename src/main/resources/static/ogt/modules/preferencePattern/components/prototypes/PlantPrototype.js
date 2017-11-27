'use strict';

angular.module('PreferencePatternModule').factory('PlantPrototype',function() {
	
	function PlantPrototype(plantObj) {
		this.name = '';
		this.subName = '';
		this.displayName = '';
		this.volumeAcrossWeeks = [];
		this.editable = true;
		this.rowIndex = 0;
		
		if(plantObj) {
			angular.extend(this, plantObj);
		}
	};
	return PlantPrototype;
	
});