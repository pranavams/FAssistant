'use strict';
angular.module("WebCoreModule").directive("ogtNavMenu", ["$compile", function($compile) {
    return {
        restrict: "A",
        scope: {
            menuData: "=menuData",
            menuDataUrl: "@menuDataUrl"
        },
        transclude: !0,
        template: '<nav class="navbar navbar-default" role="navigation"><div class="navbar-header visible-xxs"><button id="toggle-nav-menu-collapse" type="button" class="navbar-toggle collapsed" ng-click="toggleNavbarCollpase()" ng-mouseover="toggleNavbarCollpase()" aria-expanded="false"><span class="sr-only">{{\'application.navigation.toggleTitle\' | translate}}</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button></div><div uib-collapse="navbarCollapsed" class="collapse navbar-collapse" id="primary-nav" role="menu"><ul class="nav navbar-nav"><li role="menuitem" wc-protected-resource="{{menu.protected}}" ng-repeat="menu in menuData" ng-class="{dropdown:menu.secondaryNav}" ui-sref-active="active"><a ng-click="collapseNavbar()" ng-if="!menu.secondaryNav" ui-sref="{{menu.state | translate}}" ui-sref-opts="{reload: true, notify: true}">{{menu.label | translate}}</a><a ng-if="menu.secondaryNav" role="button" aria-expanded="false" href class="dropdown-toggle" data-toggle="dropdown">{{menu.label | translate}}<span ng-if="menu.secondaryNav" class="caret"></span></a><ogt-sub-menu-navigation></ogt-sub-menu-navigation></li></ul><span ng-transclude></span></div></nav>',
        controller: ["$scope", "$element", "$attrs", "$http", function($scope, $element, $attrs, $http) {
            $scope.menuDataUrl && $http.get($scope.menuDataUrl).success(function(response) {
                $scope.menuData = response
            }),
            $scope.$on("$stateChangeStart", function() {
                $("nav .in, nav .open").removeClass("in open")
            }),
            $scope.$on("collapseNavBar", function() {
                $scope.collapseNavbar()
            }),
            $scope.navbarCollapsed = !0,
            $scope.toggleNavbarCollpase = function() {
                $scope.navbarCollapsed = !$scope.navbarCollapsed,
                $scope.navbarCollapsed ? $("button.navbar-toggle").attr("aria-expanded", "false") : $("button.navbar-toggle").attr("aria-expanded", "true")
            },
            $scope.collapseNavbar = function() {
                $scope.navbarCollapsed || $scope.toggleNavbarCollpase();
            }
        }
        ]
    }
}
]).directive("ogtSubMenuNavigation", ["$compile", function($compile) {
    return {
        restrict: "E",
        scope: !0,
        link: function(scope, element) {
            if (scope.subMenu = scope.menu,
            scope.subMenu.secondaryNav && scope.subMenu.secondaryNav.length) {
                var template = angular.element('<ul class="dropdown-menu "><li wc-protected-resource="{{menu.protected}}" ng-repeat="menu in subMenu.secondaryNav" ng-class="{\'dropdown-submenu\':menu.secondaryNav}"><a ng-if="!menu.secondaryNav" ui-sref="{{menu.state | translate}}" ui-sref-opts="{reload: true, notify: true}">{{menu.label | translate}}</a><a ng-if="menu.secondaryNav" role="button" aria-expanded="false" href class="dropdown-toggle" data-toggle="dropdown">{{menu.label | translate}}</a><ogt-sub-menu-navigation subMenu="menu"></ogt-sub-menu-navigation></li></ul>')
                  , linkFunction = $compile(template);
                linkFunction(scope),
                element.replaceWith(template)
            } else
                element.remove();
        }
    }
}
])