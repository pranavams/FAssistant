'use stict';

angular.module('ModelSettingsModule').factory('ModelSettingsPrototype',
		['ModelMarketSettingsPrototype', function(ModelMarketSettingsPrototype) {
	
	function ModelSettingsPrototype(modelSettingsObject) {
		this.loggedInUserId='';
		this.marketKey = '';
		this.modelKey = '';
		this.modelYear = '';
		this.businessProcess = '';
		this.marketGroup ='';
		this.modelMarketSettings = new ModelMarketSettingsPrototype();
		this.modelGSTSettings = [];
		
		if(modelSettingsObject) {
			angular.extend(this,modelSettingsObject);
		}
	};
	return ModelSettingsPrototype;
	
}]);