'use strict';

/*
 * Define booking module
 */
angular.module('ManageMarketJobsModule', ['WebCoreModule']);

angular.module('ManageMarketJobsModule').config(['$stateProvider', function($stateProvider){
	
	$stateProvider.state('create-market-jobs', {
		url: '/create-market-jobs',
		templateUrl: 'ogt/modules/manageMarketJobs/states/createMarketJobs/createMarketJobs.html',
		controller: 'ManageMarketJobsController',
		controllerAs: 'manageMarketJobsCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 marketList: ['ManageMarketJobModelAndMYService',function(ManageMarketJobModelAndMYService) {
	    		 return ManageMarketJobModelAndMYService.getMarketInformation();
				}]
		},
		  data: {
			    policies: ['ManageMarketJobs:execute']
			  }

	});
	
	$stateProvider.state('manage-market-jobs', {
		url: '/manage-market-jobs',
		templateUrl: 'ogt/modules/manageMarketJobs/states/manageMarketJobs/manageMarketJobs.html',
		controller: 'ManageMarketJobsController',
		controllerAs: 'manageMarketJobsCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 marketList: ['ManageMarketJobModelAndMYService',function(ManageMarketJobModelAndMYService) {
					return ManageMarketJobModelAndMYService.getMarketInformation();
				}]
		},
		  data: {
			    policies: ['ManageMarketJobs:execute']
			  }

	});
	
	/*$stateProvider.state('create-jobs', {
		url: '/create-jobs',
		templateUrl: 'ogt/modules/manageMarketJobs/states/createMarketJobs/createMarketJobs.html',
		controller: 'ManageMarketJobsController',
		controllerAs: 'manageMarketJobsCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 marketList: ['ManageMarketJobModelAndMYService',function(ManageMarketJobModelAndMYService) {
	    		 return ManageMarketJobModelAndMYService.getMarketInformation();
				}]
		},
		  data: {
			    policies: ['ManageForecastJobs:execute']
			  }

	});
	
	$stateProvider.state('search-jobs', {
		url: '/search-jobs',
		templateUrl: 'ogt/modules/manageMarketJobs/states/manageMarketJobs/manageMarketJobs.html',
		controller: 'ManageMarketJobsController',
		controllerAs: 'manageMarketJobsCtrl',
		parent: 'ogt-ui-app',
		resolve: {
	    	 marketList: ['ManageMarketJobModelAndMYService',function(ManageMarketJobModelAndMYService) {
					return ManageMarketJobModelAndMYService.getMarketInformation();
				}]
		},
		  data: {
			    policies: ['ManageForecastJobs:execute']
			  }

	});*/
	
}]);

