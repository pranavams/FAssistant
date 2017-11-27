'use strict';

angular.module('ManageFamiliesModule').factory('FamiliesPrototype',function() {
	
	function FamiliesPrototype(familyObj) {
		this.key = '';
		this.code = '';
		this.name='';
		this.superFamily = '';
		this.baseVehicle='';
		this.equipmentGroup='';
		this.familyToProcess='';
		this.familyWeightage='';
		this.familyVarietyAdjustment='';
		this.description = '';
		this.correlationProcess = '';
		this.featuresArray=[];
		this.showEditLink='';
		this.enableFields='Y';
		this.equipmentGroupArray=[];
		this.equipmentFlag='';
		this.sortFlag='';
		this.familyBelongToSuperFamily='';
		this.begFamily='';
		
		if(familyObj) {
			angular.extend(this, familyObj);
		}
	};
	return FamiliesPrototype;
	
});