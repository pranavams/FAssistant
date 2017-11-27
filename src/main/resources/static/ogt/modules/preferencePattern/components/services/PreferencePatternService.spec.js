'use strict';

describe('PreferencePatternService',function(){
	var $httpBackend,
	preferencePatternService,
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
		module('PreferencePatternModule');
		inject(function($injector){
			preferencePatternService = $injector.get('PreferencePatternService');
			marketGroupSelectModalService = $injector.get('MarketGroupSelectModalService');
			marketGroupSelectModalService.selectedMarketGroup = 'NA';
			marketGroupSelectModalService.selectedBusiness = 'MF';
			$httpBackend = $injector.get('$httpBackend');
		});
	});
	it('should call the endpoint for getting dropdown values',function(){
		var url = 'OGTWeb/api/marketInfo/PreferencePattern/markets/business?businessProcess=MF&marketGroup=NA'
		$httpBackend.whenGET(url).respond({});
		preferencePatternService.getModelMonths().then(function(response){
			expect(response).toEqual({});
		},function(error){
			fail('The http request returned bad status code');
		});
		$httpBackend.flush();
	});
});