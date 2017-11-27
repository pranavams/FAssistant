'use strict';

angular.module('RenditionProposalModule').service('RenditionModalService', ['$uibModal','RenditionProposalService', 
                                                                            function($uibModal,RenditionProposalService) {
	this.modalType = '';
	this.open = function(modalType){
		if(modalType == "JOB_SUBMIT")
		{
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/modules/renditionProposal/components/modals/renditionModal/renditionModalTemplate.html',
				controller: 'RenditionModalController as renditionModalCtrl',
			});
			return modalInstance.result.then(angular.bind(this, function() {
				return this.submitWhatIfAnalysisJob();
			}));
		}
		else if(modalType == "COMMIT" || modalType == "UNLOCK")
		{
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/modules/renditionProposal/components/modals/renditionModal/renditionModalCommitTemplate.html',
				controller: 'RenditionModalController as renditionModalCtrl',
				resolve: {
					modalType: function() {
						return modalType;
					}
				}
			});
			return modalInstance.result.then(angular.bind(this, function() {
				return "OK";
			}));
		}
		else if(modalType == "RELOAD_CURRENTSTATE")
		{
			var modalInstance = $uibModal.open({
				templateUrl: './ogt/modules/renditionProposal/components/modals/renditionModal/renditionModalReloadCurrentStateTemplate.html',
				controller: 'RenditionModalController as renditionModalCtrl',
				backdrop: 'static',
				keyboard: false
			});
			return modalInstance.result.then(angular.bind(this, function() {
				return "OK";
			}));
		}
	};
	
	this.submitWhatIfAnalysisJob = function() {
		return RenditionProposalService.submitWhatIfAnalysisJob().then(function(results) {
			return results;
		});
	};
	
}]);