'use strict';

angular.module('PreferencePatternModule').factory('OperatingPlanPrototype',['OperatingPlanWrapper',function(OperatingPlanWrapper) {
	
	function OperatingPlanPrototype(opPlanObj) {
		this.recollectVolume = '';
		this.columnIndex = 0;
		this.rowspan = 1;
		this.endOfMonth = false;
		this.opPlanWrapper = new OperatingPlanWrapper();
		this.lockedInPeriod = false;
		this.columnName = '';
		this.SPCPSVolume = '';
		this.SPCPSOverriddenVolume = '';
		this.monthName = '';
		
		if(opPlanObj) {
			angular.extend(this, opPlanObj);
		}
	};
	return OperatingPlanPrototype;
	
}]);