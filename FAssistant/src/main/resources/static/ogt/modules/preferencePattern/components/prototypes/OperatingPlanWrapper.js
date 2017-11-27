'use strict';

angular.module('PreferencePatternModule').factory('OperatingPlanWrapper',function() {
	
	function OperatingPlanWrapper(opPlanObj) {
		this.key = '';
		this.weekKey = '';
		this.weekName = '';
		this.value = '';
		this.plants = []; // store the uniquePlantCell explicitly. As and when we store this object on change,
		//store to the operating plan array preference pattern prototype 
		if(opPlanObj) {
			angular.extend(this, opPlanObj);
		}
	};
	return OperatingPlanWrapper;
	
});