angular.module('VolumesDropdownModule',[]);
angular.module('VolumesDropdownModule').service('VolumesDropdownService',VolumesDropdownService);

function VolumesDropdownService(){
	var self = this;
	self.selectedModelYear;
	self.selectedModel;
	self.selectedStartMonth;
	self.selectedEndMonth;
	self.modelName;
	self.startMonthDate;
	self.endMonthDate;
	self.market;
	self.channel;
	
	self.setDropdownValues = function(model,modelYear,startMonth,endMonth){
		self.selectedModel = model;
		self.selectedModelYear = modelYear;
		self.selectedStartMonth = startMonth;
		self.selectedEndMonth = endMonth;
		self.startMonthDate = new Date(startMonth.substring(0,4), parseInt(startMonth.substring(4))-1);
		self.endMonthDate = new Date(endMonth.substring(0,4), parseInt(endMonth.substring(4))-1);
	}
	
}