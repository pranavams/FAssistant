'use strict';

describe('Ogt.ComponentsModule:', function() {
	var OgtUiComponentsModule;

	beforeEach(function() {
		OgtUiComponentsModule = angular.module('Ogt.ComponentsModule');
	});

	it('should be registered', function() {
		expect(OgtUiComponentsModule).toBeDefined();
	});

});