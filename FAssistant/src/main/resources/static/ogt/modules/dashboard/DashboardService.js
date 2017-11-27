'use strict';

angular.module('OgtModule').service('DashboardService', 
		['WcHttpEndpointPrototype', 'WcAlertConsoleService', 'UserService', '$translate', 
		 function(WcHttpEndpointPrototype, WcAlertConsoleService, UserService, $translate) {
			this.init = function() {
				UserService.getUserInformation().then(angular.bind(this, function(response) {
					WcAlertConsoleService.addMessage({
						message: $translate.instant('application.welcomeUser', response) + "!",
						type: 'success',
						multiple: false
					});
				}))
			}
		}]);
