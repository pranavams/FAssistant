'use strict';

angular.module('RenditionProposalModule').controller('RenditionModalController',['$uibModalInstance','RenditionModalService', function($uibModalInstance,RenditionModalService) {
	this.modalType= RenditionModalService.modalType;
	this.resolve = function(userAction) {
		$uibModalInstance.close(userAction);
	};
	
	this.onKeyPress = function($event){
		if(event.which === 13) {
			$("#modal-submit").click();
		}
	};
	
	this.reject = function() {
		$uibModalInstance.dismiss();
	};
	
}]);