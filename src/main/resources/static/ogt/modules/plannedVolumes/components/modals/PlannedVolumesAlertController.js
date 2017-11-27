'use strict';

angular.module('PlannedVolumesModule')
	   .controller('PlannedVolumesAlertController',['$uibModalInstance','PlannedVolumesService',PlannedVolumesAlertController]);

function PlannedVolumesAlertController($uibModalInstance,PlannedVolumesService){
	var vm = this;
	vm.model = PlannedVolumesService.selectedModel;
	vm.modelYear = PlannedVolumesService.selectedModelYear;
	var startMon = PlannedVolumesService.selectedStartMonth;
	var endMon = PlannedVolumesService.selectedEndMonth;
	vm.startMonth = new Date(startMon.substring(0,4), parseInt(startMon.substring(4))-1);
	vm.endMonth = new Date(endMon.substring(0,4), parseInt(endMon.substring(4))-1);
	vm.type = PlannedVolumesService.modalType;
	vm.startHorizon = new Date(PlannedVolumesService.startHorizon.substring(0,4), parseInt(PlannedVolumesService.startHorizon.substring(4))-1);
	vm.endHorizon = new Date(PlannedVolumesService.endHorizon.substring(0,4), parseInt(PlannedVolumesService.endHorizon.substring(4))-1);
	vm.resolve = function() {
		$uibModalInstance.close();
	};
	
	vm.reject = function() {
		$uibModalInstance.dismiss();
	};
}