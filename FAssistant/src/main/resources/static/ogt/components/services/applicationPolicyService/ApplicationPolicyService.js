'use strict';

angular.module('Ogt.ComponentsModule').
	service('ApplicationPolicyService', ['WcHttpRequestService', '_', 'WcAuthorizationService', 'WcAuthorizationCacheHelper', 'UserService', '$window',
		function(WcHttpRequestService, _, WcAuthorizationService, WcAuthorizationCacheHelper, UserService, $window) {

			this.userInformation = {role: 'agent'};

			this.getUserInformation = function() {
				return 	UserService.getUserInformation().then(angular.bind(this, function(userInfo) {
					this.userInformation = _.extend(this.userInformation, userInfo);
					this.userInformation.cdsid = userInfo.email.substring(0, userInfo.email.indexOf('@'));
					return this.userInformation;
				}));
			};

			this.toggleRole = function() {
				if(this.userInformation.role != 'agent') {
					this.userInformation.role = 'agent';
					WcHttpRequestService.configureDefaults({
						headers: {
							Role: 'Agent'
						}
					});
				} else {
					this.userInformation.role = 'default';
					WcHttpRequestService.configureDefaults({
						headers: {}
					});
				}
				WcAuthorizationCacheHelper.resetCache();
			};

		}]);