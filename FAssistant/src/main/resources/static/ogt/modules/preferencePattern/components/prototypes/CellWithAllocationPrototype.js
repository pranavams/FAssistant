'use strict';

angular.module('PreferencePatternModule').factory('CellWithAllocationProtorype',function() {
	
	function CellWithAllocationProtorype(cellObj) {
		this.key = '';
		this.allocation = '';
		this.rowIndex = '';
		this.columnIndex = '';
		this.weekKey = '';
		this.weekName = '';
		this.editable = true;
		this.colour = 'green';
		this.wrongAllocation = false;
		this.hasBeenClickedToEdit = false;
		//this.lockedInPeriod = false;

		if(cellObj) {
			angular.extend(this, cellObj);
		}
	};
	return CellWithAllocationProtorype;
	
});