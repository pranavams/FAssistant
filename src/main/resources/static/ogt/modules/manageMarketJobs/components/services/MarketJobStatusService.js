'use strict';

angular.module('ManageMarketJobsModule').service('MarketJobStatusService',
		['WcHttpEndpointPrototype','$q','WcAlertConsoleService','$translate','MarketGroupSelectModalService', function(WcHttpEndpointPrototype,$q,WcAlertConsoleService,$translate,MarketGroupSelectModalService){
	
		var self = this;
		this.jobStatusJSON = [];
		this.managemarketjobList = new WcHttpEndpointPrototype('/ogt/batchOperator/search/jobs');
		this.createJob = new WcHttpEndpointPrototype('/ogt/batchOperator/createJob');
		this.managemarketjobStatus = new WcHttpEndpointPrototype('/ogt/batchOperator/status');
		this.managemarketjobAbort = new WcHttpEndpointPrototype('/ogt/batchOperator/abortJob');
		this.managemarketjobRerun = new WcHttpEndpointPrototype('/ogt/batchOperator/rerunJob');
		this.managemarketjobProcessdates = new WcHttpEndpointPrototype('/ogt/batchOperator/search/jobs/dates');
	
	this.getManagemarketjobList = function(manageMarketJob){
		manageMarketJob.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		manageMarketJob.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		return this.managemarketjobList.post(manageMarketJob).then(angular.bind(this, function(response) {
			return response.data;
		}), function(error) {
			return $q.reject(error);
		});
	};
	
	this.getProcessDatesForMarket = function(manageMarketJob){
		manageMarketJob.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		manageMarketJob.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		return this.managemarketjobProcessdates.post(manageMarketJob).then(angular.bind(this, function(responseProcess) {
			this.jobStatusJSON = responseProcess.data;
			
			return this.loadContent();
		}), function(error) {
			return $q.reject(error);
		});
	};
	
	
	this.loadContent = function()
	{
		var  processDates=[];
		angular.forEach(this.jobStatusJSON.jobs,function(job){
			processDates.push(job.processdate);
		});
		return processDates;
	};
	
	this.loadJobStatus = function(sProcessDate)
	{
		var  statusList=[];
		angular.forEach(this.jobStatusJSON.jobs,function(job){
			if(job.processdate.indexOf(sProcessDate) ==! -1){
				statusList = job.status;
			}
		});
		return statusList;
	};
	
	this.createManageMarketJob = function(manageMarketJob) {
		manageMarketJob.marketGroup = MarketGroupSelectModalService.selectedMarketGroup;
		manageMarketJob.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	return this.createJob.post(manageMarketJob).then(angular.bind(this, function(response) {
		WcAlertConsoleService.addMessage({
            message: $translate.instant('application.success.createMarketJobSuccess', {    }),
            type: 'success',
            multiple: false
          });
		return response;
	}), function(error) {
		WcAlertConsoleService.addMessage({
			message: $translate.instant('application.errors.createMarketJobFailure', {error: error}),
			type: 'danger',
			multiple: false
		});
		return $q.reject(error);
	});
	};
	
	this.getStatus = function(sessionId) {
		return this.managemarketjobStatus.post(sessionId).then(angular.bind(this, function(response) {
			WcAlertConsoleService.addMessage({
	            message: $translate.instant('application.success.fetchJobStatus', {    }),
	            type: 'success',
	            multiple: false
	          });
			return response;
		}), function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.failureToFetchJobStatus', {error: error}),
				type: 'danger',
				multiple: false
			});
			return $q.reject(error);
		});
		};
		
	this.getAbort = function(sessionId,loggedInUserId) {
		return this.managemarketjobAbort.get({params : {"sessionId" : sessionId, "loggedInUserId" : loggedInUserId}}).then(angular.bind(this, function(response) {
			WcAlertConsoleService.addMessage({
	            message: $translate.instant('application.success.abortJobSuccess', {    }),
	            type: 'success',
	            multiple: false
	          });
			return response;
		}), function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.abortJobFailure', {error: error}),
				type: 'danger',
				multiple: false
			});
			return $q.reject(error);
		});
	};
			
	this.getRerun = function(sessionId,loggedInUserId) {
		return this.managemarketjobRerun.get({params : {"sessionId" : sessionId, "loggedInUserId" : loggedInUserId}}).then(angular.bind(this, function(response) {
			WcAlertConsoleService.addMessage({
		        message: $translate.instant('application.success.rerunJobSuccess', {    }),
		        type: 'success',
		        multiple: false
		      });
			return response;
		}), function(error) {
			WcAlertConsoleService.addMessage({
				message: $translate.instant('application.errors.rerunJobFailure', {error: error}),
				type: 'danger',
				multiple: false
			});
			return $q.reject(error);
		});
	};
	
	this.showLoadingIndicator = function(isShow) {
		if(isShow) {
			$("#loading-cover").show().animate({
	            opacity: 1
	        }, 300), $("#loading-indicator").show().animate({
	            opacity: 1
	        }, 300);
		} else {
			$("#loading-indicator").hide().animate({
                opacity: 0
            }, 10), $("#loading-cover").hide().animate({
                opacity: 0
            }, 10);
		}
	}
	
	
}]);