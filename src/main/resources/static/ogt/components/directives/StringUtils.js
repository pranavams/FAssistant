'use strict',

angular.module('OgtModule').directive('stopCutCopyPaste', function(){
    return {
        scope: {},
        link:function(scope,element){
            element.on('cut copy paste', function (event) {
              event.preventDefault();
            });
        }
    };
});