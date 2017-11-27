'use strict';

angular.module('EntityMixModule')
	   .controller('EntityMixAlertController',['$uibModalInstance','VolumesDropdownService',EntityMixAlertController]);

function EntityMixAlertController($uibModalInstance,VolumesDropdownService){
	var vm = this;
	vm.model = VolumesDropdownService.modelName;
	vm.modelYear = VolumesDropdownService.selectedModelYear;
	vm.startMonth = VolumesDropdownService.startMonthDate;
	vm.endMonth = VolumesDropdownService.endMonthDate;
	vm.resolve = function() {
		$uibModalInstance.close();
	};
	
	vm.reject = function() {
		$uibModalInstance.dismiss();
	};
}