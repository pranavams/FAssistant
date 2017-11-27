'use strict';

angular.module('PreferencePatternModule').factory('ChannelPrototype',['ChannelWrapper',function(ChannelWrapper) {
	
	function ChannelPrototype(patternObj) {
		this.marketFlag= false;
		this.rowIndex = 0;
		this.market = '';
		this.rowspan = 1;
		this.channelWrapper = new ChannelWrapper();
		
		if(patternObj) {
			angular.extend(this, patternObj);
		}
	};
	return ChannelPrototype;
	
}]);