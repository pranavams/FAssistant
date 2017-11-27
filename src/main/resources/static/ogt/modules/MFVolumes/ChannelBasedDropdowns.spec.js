"use strict";

fdescribe('ChannelBasedDropdownsFactory',function(){
	var dropdownFactory;
	
	beforeEach(function(){
		module('OgtModule',function($provide){
			$provide.value('WcTranslateConfiguratorService',{
				loadPartAndRefresh:function(){
				}
			});
			$provide.value('$state',{
			});
		});
		module('VolumesDropdownModule');
		inject(function($injector){
			dropdownFactory = $injector.get('ChannelBasedDropdownsFactory');
		});
	});
	
	it('should define ChannelBasedDropdownsFactory',function(){
		expect(dropdownFactory).toBeDefined();
	});
	
	describe('getModelYears',function(){
		it('should return the list of modelYears for the given list',function(){
			var input = [{modelYear:"2017",modelKey : "2"},
			             {modelYear:"2018",modelKey : "3"}];
			var expected = ["2017","2018"];
			expect(dropdownFactory.getModelYears(input)).toEqual(expected);
		});
		it('should return the unique list of modelYears',function(){
			var input = [{modelYear:"2017",modelKey : "2"},
			             {modelYear:"2017",modelKey : "3"}];
			var expected = ["2017"];
			expect(dropdownFactory.getModelYears(input)).toEqual(expected);
		});
	});
});