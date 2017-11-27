'use strict';

angular.module('ForecastParameterModule').factory('ForecastParameterPrototype',function() {
	
	function ForecastParameterPrototype(forecastParameterObj) {
		this.modelKey = '';
		this.modelName = '';
		this.startMonthKey = '';
		this.endMonthKey = '';
		this.forecastParametersKey = '';
		this.startMonthDesc = '';
		this.endMonthDesc = '';
		this.monthsSpan = []; 
		this.lockedInMonths = [];
		this.rowIndex = 0;
		this.datePickerOptions = {};
		this.monthRange = {};
		this.endMonths=[];
		if(forecastParameterObj) {
			angular.extend(this, forecastParameterObj);
		}
	};
	return ForecastParameterPrototype;
	
});