'use strict';

angular.module('ManageMarketJobsModule').controller('ManageMarketJobModalController',['$uibModalInstance','ManageMarketJobModalService', function($uibModalInstance,ManageMarketJobModalService) {
	this.modalType= ManageMarketJobModalService.modalType;
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