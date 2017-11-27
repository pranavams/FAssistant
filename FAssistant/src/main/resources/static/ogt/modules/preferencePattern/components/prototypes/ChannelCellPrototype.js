'use strict';

angular.module('PreferencePatternModule').factory('ChannelCellPrototype',function() {
	
	function ChannelCellPrototype(cellObj) {
		this.uniqueChannelVolume = {
				"key" : '',
				"value" : '',
				"weekKey" : '',
				"weekName" : ''
		}
		this.recollectVolume = '';
		this.rowIndex = '';
		this.columnIndex = '';
		this.editable = true;
		this.wrongAllocation = false;
		this.hasOpPlan = true;
		this.lockedInPeriod = false;
		this.isTotal = false;

		if(cellObj) {
			angular.extend(this, cellObj);
		}
	};
	return ChannelCellPrototype;
	
});