'use strict';

describe('Ogt.ComponentsModule UserService:', function() {

	//Dependencies
	var UserService, $q, $rootScope, WcHttpEndpointPrototype, $httpBackend, WcHttpRequestService, $window;


	var userInformationMock = {
		firstName: 'Fred',
		initials: 'T',
		lastName: 'Flintstone',
		email: 'testCust@ford.com'
	};

	beforeEach(function() {

		// Module & Providers
		module('Ogt.ComponentsModule');

		inject(function($injector) {
			UserService = $injector.get('UserService');
			$q = $injector.get('$q');
			$rootScope = $injector.get('$rootScope');
			WcHttpEndpointPrototype = $injector.get('WcHttpEndpointPrototype');
			$httpBackend = $injector.get('$httpBackend');
			WcHttpRequestService = $injector.get('WcHttpRequestService');
			$window = $injector.get('$window');
		});

		WcHttpRequestService.configureDefaults({baseUrl: 'http://www.ford.com/'});

		$httpBackend.whenGET('http://www.ford.com/user').respond(200, userInformationMock);

		$window.localStorage.clear();
		$window.sessionStorage.clear();
	});

	it('establishes a restangular endpoint for user information', function() {
		expect(UserService.userInformationEndpoint.route).toEqual('user');
	});

	describe('getUserInformation():', function() {
		it('should query user information endpoint for current user information', function() {
			spyOn(UserService.userInformationEndpoint, 'get').and.callThrough();

			var actualResponse;
			UserService.getUserInformation().then(function(response) {
				actualResponse = response;
			}, function() {
				console.error('This should not happen');
			});

			$httpBackend.flush();

			expect(actualResponse).toEqual(userInformationMock);
		});
		it('should return error when request for user information fails', function() {
			var userInformationResponse;

			spyOn(UserService.userInformationEndpoint, 'get').and.callFake(function() {
				return $q.reject('Server Error');
			});

			UserService.getUserInformation().then(function() {
				console.error('This should not happen');
			}, function(response) {
				userInformationResponse = response;
			});

			$rootScope.$apply();

			expect(userInformationResponse).toEqual('Server Error');
		});
	});

});