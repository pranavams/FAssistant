'use strict';

angular.module('PreferencePatternModule').factory('ChannelWrapper',function() {
	
	function ChannelWrapper(channelObj) {
		this.key = '';
		this.name = '';
		this.allocationPercentage = []; // single dimensional array holding one record of CellPrototype
		if(channelObj) {
			angular.extend(this, channelObj);
		}
	};
	return ChannelWrapper;
	
});