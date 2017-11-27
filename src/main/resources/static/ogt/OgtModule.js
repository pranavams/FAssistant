'use strict';

angular.module('OgtModule', [
                                'WebCoreModule',
                                'Ogt.ComponentsModule',
                                'VehicleLineMappingModule',
                                'RenditionProposalModule',
                                'ManageMarketJobsModule',
                                'ModelSettingsModule',
                                'WersEntityMappingModule',
                                'EntityMappingModule',
                                'ChangeoverRatesModule',
                                'ChangeoverMappingModule',
                                'ManageFamiliesModule',
                                'PreferencePatternModule',
                                'ForecastParameterModule',
                                'PlannedVolumesModule',
                                'EntityMixModule',
                                'ForecastvsMPWModule',
                                'VolumesDropdownModule',
                                'MidModelYearMappingModule',
                                'IndependentMatrixModule'
                              ]).value('ogtVars',{vehicleLines:[]});
angular.module('OgtModule').config(['WcTranslateConfiguratorServiceProvider','$urlRouterProvider','$stateProvider',function(WcTranslateConfiguratorServiceProvider,$urlRouterProvider,$stateProvider){
	$stateProvider.state('ogt-ui-app', {
		'abstract': true,
		url: '',
		templateUrl: 'ogt/ogtTemplate.html',
		controller: 'OgtController',
		controllerAs: 'ogtCtrl'
	}).state('ogt-ui-home', {
		parent: 'ogt-ui-app',
		url: '/ogt-ui-home',
		templateUrl: 'ogt/modules/dashboard/Dashboard.html',
		controller: 'OgtController',
		controllerAs: 'ogtCtrl' ,
	});
	$urlRouterProvider.otherwise("/ogt-ui-home");
	//console.log('Before configureTranslateService');
	WcTranslateConfiguratorServiceProvider.configureTranslateService();
	//console.log('After configureTranslateService');
}]).run(['WcHttpRequestService','WcTranslateConfiguratorService','VehicleLineService','ogtVars','$location', function(WcHttpRequestService,WcTranslateConfiguratorService,VehicleLineService,ogtVars,$location){
	//console.log('Inside Run');
	var env = getEnvironment($location.absUrl());
	//console.log(env);
	WcTranslateConfiguratorService.loadPartAndRefresh('Ogt');
	WcTranslateConfiguratorService.loadPartAndRefresh('environments/common');
	WcTranslateConfiguratorService.loadPartAndRefresh('environments/' + env);
	//console.log('After Loading Translations');
	if(env === 'desktop') {
		WcHttpRequestService.configureDefaults({baseUrl: 'http://localhost:21682/OGTWeb/api/',timeout: 60000});
	} else {
		var restClientUrl = $location.absUrl().substr(0, $location.absUrl().search('OGTUI')) + "OGTWeb/api/";
		WcHttpRequestService.configureDefaults({baseUrl: restClientUrl,timeout: 60000});
	}
}]);


function getEnvironment(url) {
	var dns = url.split(":")[1];
	var env = "";
	if(dns.indexOf('dev') != -1) {
		env = 'dev';
	} else if(dns.indexOf('qa') != -1) {
		env = 'qa';
	} else if(dns.indexOf('edu') != -1) {
		env = 'edu';
	} else if(dns.indexOf('localhost') != -1) {
		env = 'desktop';
	} else {
		env = 'prod';
	}
	return env;
}
