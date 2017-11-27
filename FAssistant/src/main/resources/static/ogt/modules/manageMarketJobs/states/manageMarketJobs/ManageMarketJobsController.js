'use strict';

angular.module('ManageMarketJobsModule').controller('ManageMarketJobsController', ['ManageMarketJobModelAndMYService','MarketJobStatusService',
               'WcAuthorizationService','$scope','$state','$filter','UserService','WcAlertConsoleService','$translate','$timeout', 'ManageMarketJobModalService','marketList','MarketGroupSelectModalService',
               function(ManageMarketJobModelAndMYService,MarketJobStatusService,WcAuthorizationService,$scope,$state,$filter,UserService,WcAlertConsoleService,$translate,$timeout,ManageMarketJobModalService,marketList,MarketGroupSelectModalService) {

	var vm = this;
	this.isDisplayDataTable= false;
	$scope.jobStatusMappings=[];
	this.modelModelYearList=[];
	this.processMonths = [];
	this.processTypes = [{code:"MRKT",name:"Market"}];
	this.jobStatusList = [];
	this.processType = 'MRKT';
	this.processMonth ='';
	this.jobStatus = ['All'];
	var date = new Date();
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	this.selectedMarket = '';
	this.selectedModel = ''; 
	this.selectedModelYear = '';
	this.modelYears =[];
	this.models =[];
	this.isAuthorizedLink = false;
	this.markets = [];
	this.marketJSON = [];
	this.status='';
	this.vehiclesToUpdate =[];
	this.protectedResource = '';
	vm.marketJSON = marketList;
	vm.markets = marketList.markets;
	this.businessProcess = MarketGroupSelectModalService.selectedBusiness;
	
	

	
	UserService.getUserInformation().then(angular.bind(this, function(userObj) {
		vm.user = userObj.userId;
		if(this.businessProcess === 'MF'){
			
			this.protectedResource = 'ManageForecastJobs:execute';
		}else{
			this.protectedResource = 'ManageMarketJobs:execute';
		}
	}));
	
	

	this.manageMarketJob = {
			market:'', 
			model:'', 
			modelYear:'', 
			processMonth:'',
			processType:'',
		    jobStatus:''
	};
	
	this.clearSelectedModelValues=function()
	{
		this.selectedMarket = '';
		this.selectedModel = '';
		this.selectedModelYear = '';
		this.modelYears =[];
		this.models =[];
		this.isFormSubmitted = false;
	};
	
	
	
	this.loadModels=function(){
		this.models= ManageMarketJobModelAndMYService.getModels(this.marketJSON,this.selectedMarket);
			this.selectedModel = '';
			this.selectedModelYear = '';
			this.modelYears =[];
			this.isFormSubmitted = false;
			this.businessProcess = MarketGroupSelectModalService.selectedBusiness;
		
			if(isEmpty(this.selectedMarket))
			{
					this.processMonths = [];
					this.jobStatusList = [];
					
			}else
			{
				this.getProcesscurrentMonthData();
				this.jobStatus = ['All'];
			}
			$scope.$broadcast('isAuthorized',MarketGroupSelectModalService.isAuthorisedParam(this.selectedMarket)+":WRITE");
	};
	
	this.loadModelYears = function(){
		this.selectedModelYear = '';
		this.jobStatusList = [];
		this.modelYears=  ManageMarketJobModelAndMYService.getModelYears(this.marketJSON,this.selectedMarket,this.selectedModel);
		this.isDisplayDataTable= false;
		if(this.jobStatusList.length <=0) {
			this.jobStatus = ['All'];
		}
	};
	
	if(!isEmpty(this.selectedMarket)) {
		this.getProcesscurrentMonthData();
	} else {
		this.processMonths = [];
		this.jobStatus = ['All'];
	}
	
	this.createMarketJob = function() {
		if(!isEmpty(this.selectedMarket) && !isEmpty(this.selectedModel) && !isEmpty(this.selectedModelYear)){
			this.getManageMarketJobVOForcreate();
			MarketJobStatusService.showLoadingIndicator(true);
			MarketJobStatusService.createManageMarketJob(this.manageMarketJob).then(angular.bind(this, function(response){
				this.models =[];
				this.modelYears =[];
				this.clearMarketJobs();
			})).finally(function() {
				MarketJobStatusService.showLoadingIndicator(false);
			}); 
		}
	}
	
	this.backTosearchJob = function()
    {
       if(MarketGroupSelectModalService.selectedBusiness == 'MF')
       {
           $state.go('search-jobs');
        }
        else
         {
           $state.go('manage-market-jobs');
        }
    }


	
	this.searchMarketJobs=function(){
		if(!isEmpty(this.selectedMarket) && !isEmpty(this.processMonth)) {
			WcAuthorizationService.isAuthorized([(this.protectedResource+"_")+MarketGroupSelectModalService.isAuthorisedParam(this.selectedMarket)+":WRITE"],null).then(angular.bind(this, function(authorized) {
				this.isAuthorizedLink = authorized;
				 if(this.jobStatusList.length <= 0) {
					 WcAlertConsoleService.addMessage({
						 message: $translate.instant('application.errors.serarchMarketJobNoData', {    }),
						 type: 'danger',
						 multiple: false
					 });
					 this.jobStatus = ['All'];
					 this.isDisplayDataTable= false;
				 } else {
					 if (this.jobStatus.indexOf('All') ==! -1) {
						 this.jobStatus = this.jobStatusList;
					 }
					 this.getManageMarketJobVO();
					 vm.isDisplayDataTable= false;
					 MarketJobStatusService.showLoadingIndicator(true);
					 return MarketJobStatusService.getManagemarketjobList(this.manageMarketJob).then(angular.bind(this, function(response) {
						 $scope.jobStatusMappings = response.jobs;
						 $timeout(function() {
							 if(!isEmpty(response.jobs)) {
								 vm.isDisplayDataTable= true;
							 }
						 },0);
						 if(!isEmpty(response.jobs)) {
							 vm.isDisplayDataTable= true;
							 $scope.isDataReceivedFromOgm = true;
						 }
					})).finally(function() {
						MarketJobStatusService.showLoadingIndicator(false);
					});
				 }
			 }));
		} else {
			$scope.jobStatusMappings=[];
			this.isDisplayDataTable= false;
		}
	};
	
	this.clearMarketJobs=function()
	{
		this.selectedMarket = '';
		this.selectedModel = ''; 
		this.selectedModelYear = '';
		this.jobStatus = ['All'];
		this.jobStatusList = [];
		this.processMonths = [];
		$scope.jobStatusMappings=[];
		this.isDisplayDataTable= false;
		this.isFormSubmitted = false;
	};
	
	function isEmpty(val){
	    return (val === undefined || val == null || val.length <= 0) ? true : false;
	};

	$scope.status =  function(sessionId,rowId){
		var arrElement=$filter('filter')($scope.jobStatusMappings, { ruid: rowId  }, true)[0];
		var point = $scope.jobStatusMappings.indexOf(arrElement);
		$scope.jobStatusMappings[point] = arrElement;
		MarketJobStatusService.showLoadingIndicator(true);
		MarketJobStatusService.getStatus(sessionId).then(angular.bind(this, function(response){
			arrElement.status = response.data.status;
		})).finally(function() {
			MarketJobStatusService.showLoadingIndicator(false);
		});
	};
	$scope.abort = function(sessionId,rowId){
		ManageMarketJobModalService.open("ABORT").then(angular.bind(this, function(response){
		MarketJobStatusService.showLoadingIndicator(true);
		MarketJobStatusService.getAbort(sessionId,vm.user).then(angular.bind(this, function(response){
			var arrElement=$filter('filter')($scope.jobStatusMappings, { ruid: rowId  }, true)[0];
			var point = $scope.jobStatusMappings.indexOf(arrElement);
			$scope.jobStatusMappings[point] = arrElement;
			arrElement.status = "ABORTED";
			arrElement.hpcStatus = "JOBABORTED";
			arrElement.hpcjobid = "";
			arrElement.endDate="";
			//arrElement.endDate=$filter('date')(new Date(),'yyyy-MM-dd HH:mm:ss.sss');
		})).finally(function() {
			MarketJobStatusService.showLoadingIndicator(false);
		});
		}));
	};
	$scope.rerun =  function(sessionId,rowId){
		ManageMarketJobModalService.open("RERUN").then(angular.bind(this, function(response){
		MarketJobStatusService.showLoadingIndicator(true);
		MarketJobStatusService.getRerun(sessionId,vm.user).then(angular.bind(this, function(response){
			var arrElement=$filter('filter')($scope.jobStatusMappings, { ruid: rowId  }, true)[0];
			var point = $scope.jobStatusMappings.indexOf(arrElement);
			$scope.jobStatusMappings[point] = arrElement;
			arrElement.status = "SUBMITTED";
			arrElement.endDate = null;
			arrElement.hpcjobid = "-";
			arrElement.hpcStatus = null;
		})).finally(function() {
			MarketJobStatusService.showLoadingIndicator(false);
		});
		}));
	};
	this.displayDataTable=function(){
		this.isDisplayDataTable= false;
		this.loadJobStatus();
	};
	
	this.loadContent = function() {
		if(!isEmpty(this.selectedMarket)) {
			this.isDisplayDataTable= false;
			this.getManageMarketJobVO();
			MarketJobStatusService.showLoadingIndicator(true);
			 MarketJobStatusService.getProcessDatesForMarket(this.manageMarketJob).then(angular.bind(this, function(response) {
				if(isEmpty(response))	{
					this.getProcesscurrentMonthData();
					this.jobStatus = ['All'];
				}else{
					this.processMonths = response;
				}
				 this.processMonth =  this.processMonths[0]; 
				 this.loadJobStatus();
			})).finally(function() {
				MarketJobStatusService.showLoadingIndicator(false);
			});
		}
	};

	this.processDateJobStatusforMarket = function(){
		this.loadContent();
	};
	
	this.loadJobStatus = function(){
		this.jobStatusList = MarketJobStatusService.loadJobStatus(this.processMonth);
		this.jobStatus = ['All'];
	};
	
	this.getProcesscurrentMonthData = function(){
		this.processCurrentMonths = [monthNames[date.getMonth()] +'-'+ date.getFullYear()];
		this.processMonth = this.processCurrentMonths[0];
		this.processMonths = this.processCurrentMonths;
	};
	
	this.getManageMarketJobVOForcreate = function(){
		this.manageMarketJob = {
				market:this.selectedMarket, 
				model:this.selectedModel, 
				modelYear:this.selectedModelYear, 
				processMonth:$filter('date')(new Date(),'yyyy-MM-dd'), 
				processType:this.processType,
			    jobStatus:[],
			    loggedInUserId:vm.user
		};
	};
	
	this.getManageMarketJobVO =function(){
		this.manageMarketJob = {
				market:this.selectedMarket, 
				model:this.selectedModel, 
				modelYear:this.selectedModelYear, 
				processMonth:this.processMonth, 
				processType:this.processType,
			    jobStatus:this.jobStatus,
			    loggedInUserId:''
		};
	};
		
}]);