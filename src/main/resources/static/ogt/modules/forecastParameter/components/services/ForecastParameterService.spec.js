'use strict';

describe('ForecastParameterService',function(){
	var $httpBackend,
	forecastParameterService,
	marketGroupSelectModalService;
	
	beforeEach(function(){
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
			$provide.value('$state',{
			});
		});
		module('ForecastParameterModule');
		inject(function($injector){
			forecastParameterService = $injector.get('ForecastParameterService');
			marketGroupSelectModalService = $injector.get('MarketGroupSelectModalService');
			marketGroupSelectModalService.selectedMarketGroup = 'NA';
			marketGroupSelectModalService.selectedBusiness = 'MF';
			$httpBackend = $injector.get('$httpBackend');
		});
	});
	it('should call the endpoint for getting dropdown values for Forecast Parameter',function(){
		var url = 'OGTWeb/api/marketInfo/ForecastParameters/markets/business?businessProcess=MF&marketGroup=NA'
		$httpBackend.whenGET(url).respond({});
		forecastParameterService.getModelYears().then(function(response){
			expect(response).toEqual({});
		},function(error){
			fail('The http request returned bad status code');
		});
		$httpBackend.flush();
	});
});