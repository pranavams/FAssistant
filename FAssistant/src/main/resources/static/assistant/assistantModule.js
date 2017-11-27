'use strict';

angular.module('assistantModule', ['WebCoreModule']);

angular.module('assistantModule').config(['WcTranslateConfiguratorServiceProvider','$urlRouterProvider','$stateProvider',function(WcTranslateConfiguratorServiceProvider,$urlRouterProvider,$stateProvider){
	$stateProvider.state('assistant-ui-app', {
		'abstract': true,
		url: '',
		templateUrl: 'assistant/index.html',
		controller: 'assistantController',
		controllerAs: 'asstCtrl'
	});
	$urlRouterProvider.otherwise("/assistant-ui-home");
	//console.log('Before configureTranslateService');
	WcTranslateConfiguratorServiceProvider.configureTranslateService();
	//console.log('After configureTranslateService');
}]).run(['WcHttpRequestService','WcTranslateConfiguratorService','$location', function(WcHttpRequestService,WcTranslateConfiguratorService,$location){
	var restClientUrl = $location.absUrl().substr(0, $location.absUrl().search('OGTUI')) + "OGTWeb/api/";
	WcHttpRequestService.configureDefaults({baseUrl: restClientUrl, timeout: 60000});
}]);
