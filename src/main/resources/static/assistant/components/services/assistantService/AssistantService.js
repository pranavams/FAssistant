'use strict';

angular.module('assistantModule').
service('AssistantService', ['WcHttpEndpointPrototype','$http','$q', 'WcAlertConsoleService','$translate', function(WcHttpEndpointPrototype, $http, $q, WcAlertConsoleService, $translate) {
	var vm = this;
	vm.renditionModelsEndpoint = new WcHttpEndpointPrototype('ogt/productManager/rendition/models');
	vm.getRenditionModels = function(businessProcess, marketGroup, markets) {
		var deferred = $q.defer();
		console.log("getRenditionModels::Parameters received for Rendition Models " + 
			JSON.stringify({'businessProcess': businessProcess ,'marketGroup': marketGroup, 'markets': markets}));
         //vm.renditionModelsEndpoint.get( {params: {'businessProcess': businessProcess ,'marketGroup': marketGroup, 'markets': markets}}).then(function(response){
     	$http.get("./assistant/spec/renditionModels.json").then(function(response){
            console.log("getRenditionModels::Response Received " + JSON.stringify(response.data));
            deferred.resolve(response.data);
        },function(error){
        	deferred.resolve({});
        });
        return deferred.promise;
    };								  	
		
	vm.renditionEndpoint = new WcHttpEndpointPrototype('ogt/productManager/rendition/');
	vm.getRendition = function(vehicle) {
		var deferred = $q.defer();
		console.log("getRendition::Parameters received for Rendition " + JSON.stringify(vehicle));
		//vm.renditionEndpoint.get({params: {'modelYear':vehicle..modelYear, 'sessionId': , vehicle.sessionId}}).then(function(response){
		
		var httpFile = "./assistant/spec/rendition." + vehicle.modelKey.toLowerCase() + ".json";
		
		$http.get(httpFile).then(function(response){
        	console.log("getRendition::Response received for Rendition " + JSON.stringify(response.data));
			deferred.resolve(response.data);
		},function(error){
			deferred.resolve({});
		});
        return deferred.promise;
    };								  	
    
    vm.searchJobsEndPoint = new WcHttpEndpointPrototype('/ogt/batchOperator/search/')
    vm.searchJobs = function(searchJobParam){
    	var deferred = $q.defer();
    	//vm.searchJobsEndPoint.post(searchJobParam).then(function(response){
		var httpFile = "./assistant/spec/searchJobs." + searchJobParam.model.toLowerCase() + "." + searchJobParam.marketGroup.toLowerCase() + ".json";
		
		$http.get(httpFile).then(function(response){
    		console.log("searchJobs::Response Received " + JSON.stringify(response.data));
    		deferred.resolve(response.data);
    	}, function(error){
    		deferred.resolve({});
    	});
    	return deferred.promise;
    };
    
    this.loggedInUserId;
	
	this.userInformationEndpoint = new WcHttpEndpointPrototype('user');
	
	this.getUserInformation = function() {
		return this.userInformationEndpoint.get().then(angular.bind(this, function(response){
			console.log("::User Info:: " + JSON.stringify(response.data));
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
