'use strict';

angular.module('PreferencePatternModule').factory('PlantCellPrototype',function() {
	
	function PlantCellPrototype(plantCellObj) {
		this.uniquePlantVolume = {
				"value" : '',
				"key" : '',
				"name" : '',
				"vehiclePlantKey": ''
		}
		this.recollectVolume = '';
		this.weekName = '';
		this.editable = true;
		this.plantType = '';
		
		if(plantCellObj) {
			angular.extend(this, plantCellObj);
		}
	};
	return PlantCellPrototype;
	
});