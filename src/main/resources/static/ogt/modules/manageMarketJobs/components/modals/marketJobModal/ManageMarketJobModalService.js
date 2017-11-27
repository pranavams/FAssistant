'use strict';

angular.module('ManageMarketJobsModule').service('ManageMarketJobModalService', ['$uibModal', 
                                                                            function($uibModal) {
	this.modalType = '';
	this.open = function(modalType){
		 if(modalType == "RERUN")
		{
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/modules/manageMarketJobs/components/modals/marketJobModal/manageJobRerunTemplate.html',
				controller: 'ManageMarketJobModalController as manageMarketJobModalCtrl',
				backdrop: 'static',
				keyboard: false
			});
			return modalInstance.result.then(angular.bind(this, function() {
				return "OK";
			}));
		}
		else if(modalType == "ABORT")
		{
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/modules/manageMarketJobs/components/modals/marketJobModal/manageJobAbortTemplate.html',
				controller: 'ManageMarketJobModalController as manageMarketJobModalCtrl',
				backdrop: 'static',
				keyboard: false
			});
			return modalInstance.result.then(angular.bind(this, function() {
				return "OK";
			}));
		}
	};
	
}]);