"use strict";

angular.module('VolumesDropdownModule')
	.factory('ChannelBasedDropdownsFactory',ChannelBasedDropdownsFactory);

function ChannelBasedDropdownsFactory(){
	return {
		getModelYears : function(dropdownList){
			var modelYears = dropdownList.map(function(item){
				return item.modelYear;
			}).reduce(function(newList,item){
				if(newList.indexOf(item) === -1)
					newList = newList.concat(item);
				return newList;
			},[]);
			return modelYears;
		}
	};
}


