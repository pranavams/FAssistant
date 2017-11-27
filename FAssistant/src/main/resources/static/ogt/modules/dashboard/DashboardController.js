'use strict';

angular.module('OgtModule').controller('DashboardController', 
		['DashboardService', 'UserService',
		 function(DashboardService, UserService) {
			this.authorized = undefined;

			this.load = function() {
				DashboardService.init();
				UserService.isAuthorized().then(angular.bind(this, function(response) {
					this.authorized = response;
				}));
			};
		}]);