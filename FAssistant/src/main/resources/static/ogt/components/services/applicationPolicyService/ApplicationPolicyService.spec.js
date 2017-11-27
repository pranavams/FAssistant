'use strict';

describe('Ogt.ComponentsModule ApplicationPolicyService:', function() {

	var ApplicationPolicyService, WcHttpEndpointPrototype, WcAuthorizationService, WcAuthorizationCacheHelper, $state, WcHttpRequestService, UserService, $q, $rootScope;

	beforeEach(function() {
		// Module & Providers
		module('Ogt.ComponentsModule');

		inject(function($injector) {
			ApplicationPolicyService = $injector.get('ApplicationPolicyService');
			WcHttpEndpointPrototype = $injector.get('WcHttpEndpointPrototype');
			WcAuthorizationService = $injector.get('WcAuthorizationService');
			WcAuthorizationCacheHelper = $injector.get('WcAuthorizationCacheHelper');
			$state = $injector.get('$state');
			WcHttpRequestService = $injector.get('WcHttpRequestService');
			UserService = $injector.get('UserService');
			$q = $injector.get('$q');
			$rootScope = $injector.get('$rootScope');
		});
	});

	it('should define a ApplicationPolicyService', function() {
		expect(ApplicationPolicyService).toBeDefined();
	});

	it('should define an user information object', function() {
		expect(ApplicationPolicyService.userInformation).toBeDefined();
	});

	describe('getUserInformation():', function() {

		it('should leverage the UserService to populate the userInformation object', function() {
			spyOn(UserService,'getUserInformation').and.returnValue($q.when({firstName:'bob', lastName: 'bobbers', email: 'bobb@ford.com'}));

			ApplicationPolicyService.getUserInformation();

			$rootScope.$apply();

			expect(UserService.getUserInformation).toHaveBeenCalled();
			expect(ApplicationPolicyService.userInformation).toEqual({firstName:'bob', lastName: 'bobbers', email: 'bobb@ford.com', cdsid: 'bobb', role: 'agent'});
		});

	});

	describe('toggleRole():', function() {

		it('should swap user roles based on current role', function() {
			ApplicationPolicyService.userInformation.role = 'default';
			ApplicationPolicyService.toggleRole();
			expect(ApplicationPolicyService.userInformation.role).toEqual('agent');
		});

		it('should configure WcHttpEndpointPrototype headers for the updated role', function() {
			ApplicationPolicyService.userInformation.role = 'default';
			spyOn(WcHttpRequestService, 'configureDefaults');

			ApplicationPolicyService.toggleRole();
			expect(WcHttpRequestService.configureDefaults).toHaveBeenCalledWith({
				headers: {
					Role: 'Agent'
				}
			});
		});

		it('should clear the policy cache', function() {
			ApplicationPolicyService.userInformation.role = 'agent';
			spyOn(WcAuthorizationCacheHelper, 'resetCache');

			ApplicationPolicyService.toggleRole();
			expect(WcAuthorizationCacheHelper.resetCache).toHaveBeenCalled();
		});

	});

});