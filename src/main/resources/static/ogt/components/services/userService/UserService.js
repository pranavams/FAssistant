'use strict';

angular.module('Ogt.ComponentsModule').
service('UserService', ['WcHttpEndpointPrototype', function(WcHttpEndpointPrototype) {
	
	this.loggedInUserId;
	
	this.userInformationEndpoint = new WcHttpEndpointPrototype('user');
	
	this.getUserInformation = function() {
		return this.userInformationEndpoint.get().then(angular.bind(this, function(response){
			this.loggedInUserId = response.data.userId;
			return response.data;
		}));
	};
	this.getUserId = function(){
		return this.loggedInUserId;
	}
	this.auth = new WcHttpEndpointPrototype('authorization/auth');
	this.isAuthorized = function() {
		return this.auth.get().then(function(response) {
			return response.data;
		})
	};

}]);
