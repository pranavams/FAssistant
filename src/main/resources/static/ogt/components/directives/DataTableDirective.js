'use strict';

angular.module("WcResponsiveTableModule").directive("ogResponsiveTable", 
			["$compile", "_", "$timeout", "$swipe", function($compile, _, $timeout, $swipe) {
    return {
        scope: {
            data: "&",
            rowKey: "@",
            ngModel: "=",
            resultsPerPage: "=",
            paginationControlsPlacement: "@",
            responsiveView: "@",
            columnData: "=",
            selectResultsPerPage: "="
        },
        require: ["?ngModel"],
        controller: ["_", "$scope", "$element", "$attrs", "WcTableScopeService", "WcTableCollectionService", "WcTablePaginationService", 
                     function(_, $scope, $element, $attrs, WcTableScopeService, WcTableCollectionService, WcTablePaginationService) {
        	$scope.ngModel = [];
            var parentScope = $scope.$parent;
            "" === $attrs.required && ($scope.required = !0), 
            "" === $attrs.paginationEnabled && ($scope.paginationEnabled = !0), 
            WcTableCollectionService.setInitialCollection($scope.data()), 
            WcTableCollectionService.setRowKey($scope.rowKey), 
            WcTableScopeService.setParentScope(parentScope), 
            WcTableScopeService.setTableScope($scope),
                $scope.ngModel || ($scope.ngModel = []), $scope.lastCollectionRendered = null, $scope.renderTable = function(resetToPageOne) {
                    $scope.$broadcast("table.pagination.update", resetToPageOne), $scope.$broadcast("table.render.start")
                }, $scope.tableIsLoading = function() {
                    $(".wc-table-loading-indicator").show(), $(".wc-table-loading-cover").show()
                }, $scope.tableIsFinishedLoading = function() {
                    $(".wc-table-loading-indicator").hide(), $(".wc-table-loading-cover").hide()
                }, $scope.tableRendered = function() {
                    $(".wc-table-column-" + $scope.previousSortColumn).removeClass("wc-table-column-highlight"), $(".wc-table-column-" + $scope.activeSortColumn).addClass("wc-table-column-highlight"), $timeout(function() {
                        parentScope.$broadcast("table.render.complete"),
                            $scope.tableIsFinishedLoading()
                    }, 0)
                }, $scope.toggleFilterVisibility = function() {
                    $("div[og-responsive-table] thead input[wc-column-filter], div[og-responsive-table] thead select[wc-column-filter]").toggle();
                    var currentText = $("div[og-responsive-table] .filter-visibility-toggle span:first-child").text();
                    currentText.indexOf("Show") > -1 ? (currentText = currentText.replace("Show", "Hide"), $(".wc-table thead > tr > th").css("vertical-align", "top")) : (currentText = currentText.replace("Hide", "Show"), $(".wc-table thead > tr > th").css("vertical-align", "bottom")), $("div[og-responsive-table] .filter-visibility-toggle span:first-child").text(currentText)
                };
            var ratchetIndex = 2;
            $scope.ratchetCols = function(direction) {
                    window.innerWidth < 1200 && ($scope.$broadcast("ng-swipe"), "left" == direction ? ($(".wc-table.table-ratchet .wc-table-column-" + ratchetIndex).hide(), ratchetIndex < $scope.numberOfCols && ratchetIndex++) : "right" == direction && ($(".wc-table.table-ratchet .wc-table-column-" + (ratchetIndex - 1)).show(), ratchetIndex > 2 && ratchetIndex--))
                }, $scope.$on("ng-swipe", function(event, args) {
                    $scope.animating || ($scope.animating = !0,
                        $(".wc-table.table-ratchet table").animate({
                            opacity: .7
                        }, 150, function() {
                            $(".wc-table.table-ratchet table").animate({
                                opacity: 1
                            }, 200, function() {})
                        }), $scope.animating = !1)
                }), $scope.columnsToHide = [],
                // ==========
                // Pagination
                // ==========
                ($scope.paginationEnabled || $scope.resultsPerPage || $scope.numberOfPageControls || $scope.selectResultsPerPage || $scope.responsiveBreakpoints || $scope.paginationControlsPlacement) && (WcTablePaginationService.setPaginationState(!0), WcTablePaginationService.setPaginationDefaults({
                    numberOfPageControls: $scope.numberOfPageControls,
                    responsiveBreakpoints: $scope.responsiveBreakpoints,
                    selectResultsPerPage: $scope.selectResultsPerPage,
                    resultsPerPage: $scope.resultsPerPage,
                    paginationControlsPlacement: $scope.paginationControlsPlacement
                }))
        }],
        link: function(scope, elem, attrs, ctrl) {
            // jshint unused:true
            var table = elem[0].children[0];
            "TABLE" !== table.tagName && (console.error("Table tag <table> must come right after <og-responsive-table>"), console.error("Directive found " + table[0].tagName + " instead")), elem.addClass("wc-table");
            var dataRow = $(table).find("tbody tr"),
                headerRow = $(table).find("thead tr")[0];
            scope.numberOfCols = headerRow.children.length;
            for (var i = 0; i < headerRow.children.length; i++) scope.columnsToHide[i] = !1, $(headerRow.children[i]).addClass("wc-table-column-" + i);
            for (i = 0; i < dataRow.children().length; i++) {
                var item = $(dataRow.children()[i]);
                //.attr('column-index', i);
                if (item.addClass("wc-table-column-" + i), "list" == scope.responsiveView) {
                    var columnHeading = $(headerRow).find("th")[i],
                        columnHeadingText = $(columnHeading).clone().children().remove().end().text();
                    item.attr("data-title", columnHeadingText)
                }
            }
            if (scope.paginationEnabled && elem.prepend($compile("<og-table-pagination>")(scope)), "scroll" == scope.responsiveView) elem.addClass("table-responsive");
            else if ("ratchet" == scope.responsiveView) {
                elem.addClass("table-ratchet");
                //start block of modified code coming from angular-touch library.
                var startCoords, valid, MAX_VERTICAL_DISTANCE = 75,
                    MAX_VERTICAL_RATIO = .3,
                    MIN_HORIZONTAL_DISTANCE = 30,
                    directionOfSwipe = function(coords) {
                        if (!startCoords) return !1;
                        var deltaY = Math.abs(coords.y - startCoords.y),
                            deltaX = coords.x - startCoords.x; // Short circuit for already-invalidated swipes.
                        return valid && MAX_VERTICAL_DISTANCE > deltaY && 0 != deltaX && Math.abs(deltaX) > MIN_HORIZONTAL_DISTANCE && deltaY / Math.abs(deltaX) < MAX_VERTICAL_RATIO ? deltaX > 0 ? "right" : "left" : !1
                    };
                $swipe.bind($(table), {
                    start: function(coords) {
                        startCoords = coords, valid = !0
                    },
                    cancel: function() {
                        valid = !1
                    },
                    end: function(coords) {
                        var direction = directionOfSwipe(coords);
                        direction && scope.ratchetCols(direction)
                    }
                })
            } else if ("column-toggle" == scope.responsiveView) {
                elem.addClass("column-toggle");
                //add controls to allow the user to hide columns
                var columnToggle = '<span class="dropdown column-toggle"><span name="columnToggleDropdown" data-toggle="dropdown" id="columnToggleDropdown"><span>Hide Columns</span><span class="glyphicon glyphicon-minus-sign"></span></span><ul class="dropdown-menu" role="menu" aria-labelledby="columnToggleDropdown">';
                $(headerRow).children().each(function(index, item) {
                    index > 1 && (columnToggle += '<li role="menuitem" class="show-later"><label for="col' + index + '"><input id="col' + index + '" type="checkbox" ng-model="columnsToHide[' + index + ']"/>' + item.firstChild.data + "</label></li>")
                }), columnToggle += "</ul></span>", scope.$watchCollection(function() {
                    return scope.columnsToHide
                }, function(newValue, oldValue) {
                    if (newValue !== oldValue)
                        for (var i = 0; i < newValue.length; i++) newValue[i] ? $(".wc-table.column-toggle .wc-table-column-" + i).hide() : $(".wc-table.column-toggle .wc-table-column-" + i).show()
                }), $(table).before($compile(columnToggle)(scope))
            } else "list" == scope.responsiveView ? (elem.addClass("table-mobile-stack"), $(".filter-visibility-toggle").hide()) : "drop" == scope.responsiveView;
            if (elem.find("thead input[wc-column-filter], thead select[wc-column-filter]").length) {
                var filterToggle = '<div class="filter-visibility-toggle" ng-click="toggleFilterVisibility()"><span>Show Filters</span><span class="glyphicon glyphicon-filter"></span></div>';
                $(table).before($compile(filterToggle)(scope)), $(table).before('<div class="active-filters"></div>')
            }
            var loadingElement = '<div class="wc-table-loading-cover"><div></div></div><div class="wc-table-loading-indicator"><span class="glyphicon glyphicon-refresh"></span><span>Loading...</span></div>';
            elem.append(loadingElement);
            var setMatchingHeights = function(selector) {
                    $(selector).each(function(index, item) {
                        $(item).css("height", $(item).closest("tr").css("height"))
                    })
                },
                columnResizeHandler = function() {
                    setMatchingHeights(".wc-table-column-0"), setMatchingHeights(".wc-table-column-1")
                };
            if ("scroll" == scope.responsiveView) {
                $(window).on("resize", _.debounce(columnResizeHandler, 250)), scope.$on("table.render.complete", _.debounce(columnResizeHandler, 10));
                var scrollHandler = function(event) {
                    $(".table-responsive .wc-table-column-0").each(function(index, item) {
                        $(item).css("left", event.currentTarget.scrollLeft + "px")
                    }), $(".table-responsive .wc-table-column-1").each(function(index, item) {
                        $(item).css("left", event.currentTarget.scrollLeft + 100 + "px")
                    }), $("div[og-responsive-table].table-responsive .filter-visibility-toggle").each(function(index, item) {
                        $(item).css("left", event.currentTarget.scrollLeft + 15 + "px")
                    })
                };
                elem.scroll(scrollHandler), elem.on("touchmove", scrollHandler)
            } else "ratchet" == scope.responsiveView || "list" == scope.responsiveView || "drop" == scope.responsiveView;
            ctrl[0] && (ctrl[0].$name = "ogResponsiveTable",
                    ctrl[0].$parsers.push(function(viewValue) {
                        return scope.required && (!viewValue || angular.isArray(viewValue) && 0 == viewValue.length ? ctrl[0].$setValidity("tableRequired", !1) : ctrl[0].$setValidity("tableRequired", !0)), viewValue
                    }),
                    ctrl[0].$formatters.push(function(modelValue) {
                        return scope.required && (!modelValue || angular.isArray(modelValue) && 0 == modelValue.length ? ctrl[0].$setValidity("tableRequired", !1) : ctrl[0].$setValidity("tableRequired", !0)), modelValue
                    }),
                    scope.applyModel = function(value) {
                        ctrl[0].$setViewValue(value)
                    },
                    ctrl[0].$$parentForm.$addControl(ctrl[0])),
                scope.dataRowChildren = dataRow.children().clone(), dataRow.children().remove(), dataRow.attr("wc-row-repeat", ""), $compile(dataRow)(scope)
        }
    }
}]),

angular.module("WcResponsiveTableModule").directive("ogRowSelectCheckbox", ["$filter", function($filter) {
    return {
        restrict: "E",
        template: '<input type="checkbox" ng-change="selectRow()" class="wc-checkbox-column" ng-model="isChecked">',
        scope: {},
        controller: ["$scope", "$element", "WcTableScopeService", function($scope, $element, WcTableScopeService) {
            $scope.selectRow = function() {
                var tableScope = WcTableScopeService.getTableScope(),
                    objId = $scope.$parent.rowKey,
                    ngModel = tableScope.ngModel,
                    isInNgModel = 0 !== $filter("filter")(ngModel, objId, !0).length,
                    isCheckBoxExists = ($element.parent().parent().html() != undefined);
               isInNgModel && !$scope.isChecked ? tableScope.ngModel = $filter("filter")(ngModel, function(value) {
                    return value !== objId
                }, !0) : isInNgModel;
                if(isCheckBoxExists && $scope.isChecked)
                	tableScope.ngModel.push(objId), tableScope.applyModel(tableScope.ngModel)
            }, $scope.$on("table.render.complete", function() {
                $scope.$parent.isSelected && ($scope.isChecked = !0)
            }), $scope.$on("table.select.checkbox.all", function() {
                $scope.isChecked = !0, $scope.selectRow()
            }), $scope.$on("table.select.checkbox.none", function() {
                $scope.isChecked = !1, $scope.selectRow()
            })
        }],
        link: function(scope, elem) {
            var highlightRow = function(shouldHighlight) {
                var row = elem.parent().parent().parent();
                shouldHighlight ? $(row).addClass("wc-highlight-row") : $(row).removeClass("wc-highlight-row");
                var tableCells = row.children();
                $(tableCells).each(function(index, cell) {
                    shouldHighlight ? $(cell).addClass("wc-highlight-row") : $(cell).removeClass("wc-highlight-row")
                })
            };
            scope.$watch("isChecked", function(boolean) {
                highlightRow(boolean)
            })
        }
    }
}]),

angular.module("WcResponsiveTableModule").directive("ogRowSelectHeaderCheckbox", function() {
    return {
        restrict: "E",
        template: '<input type="checkbox" ng-click="selectAllRows()" ng-model="isChecked" class="wc-header-checkbox">',
        scope: {
            ogRowSelectHeaderCheckbox: "@"
        },
        controller: ["$scope", "$timeout", "WcTableScopeService", function($scope, $timeout, WcTableScopeService) {
            var tableScope = WcTableScopeService.getTableScope(),
                checkIfAllChecked = function() {
            		var allCheckboxes = angular.element('tbody input[type="checkbox"]');
                    for (var i = 0; i < allCheckboxes.length; i++)
                        if (!angular.element(allCheckboxes[i]).is(":checked")) {
                            $scope.isChecked = !1;
                            break;
                        }
                   if(allCheckboxes.length == 0)	//When there are no checkboxes in data table unselecting the all checkboxes. 
                	   $scope.isChecked = !1;
                };
            $scope.$on("table.render.complete", function() {
                $timeout(function() {
                    $scope.isChecked = !0, checkIfAllChecked()
                })
            }), $scope.$watch(function() {
                return tableScope.ngModel
            }, function() {
                checkIfAllChecked()
            }), $scope.selectAllRows = function() {
                var event = $scope.isChecked ? "table.select.checkbox.all" : "table.select.checkbox.none";
                tableScope.$broadcast(event)
            }, $scope.$on("table.select.button.all", function() {
                $scope.isChecked = !0
            }), $scope.$on("table.select.button.none", function() {
                $scope.isChecked = !1
            })
        }]
    }
}),

angular.module("WcResponsiveTableModule").directive("ogRowActionMultiple", function() {
    return {
        restrict: "A",
        scope: {
            ogRowActionMultiple: "@"
        },
        controller: ["$scope", "WcTableScopeService", function($scope, WcTableScopeService) {
            $scope.multipleAction = function() {
                var ngModel = WcTableScopeService.getTableScope().ngModel,
                    viewScope = WcTableScopeService.getParentScope();
                WcTableScopeService.getTableScope().ngModel = [];
                /*ngModel.length &&*/ viewScope.$emit($scope.ogRowActionMultiple, [].concat(ngModel))
            }
        }],
        link: function(scope, elem) {
            elem.on("click", function() {
                scope.multipleAction()
            })
        }
    }
}),

angular.module("WcResponsiveTableModule").directive("ogTablePagination", ["$compile", function($compile) {
    return {
        scope: {},
        controller: ["$scope", "$window", "_", "WcTableScopeService", "WcTablePaginationService", "WcTableCollectionService", 
                     function($scope, $window, _, WcTableScopeService, WcTablePaginationService, WcTableCollectionService) {
            var pagination, tableScope = WcTableScopeService.getTableScope();
            $scope.pagination = WcTablePaginationService.getPaginationDefaults(), pagination = $scope.pagination, 
            $scope.$on("table.pagination.update", function(event, resetCurrentPage) {
                resetCurrentPage && (pagination.currentPage = 1), pagination.totalItems = WcTableCollectionService.getCollectionLength(), 
                pagination.totalPages = Math.ceil(pagination.totalItems / pagination.resultsPerPage), $scope.updatePaginationControls(pagination.currentPage), 
                $scope.createPaginationControlNumbers()
            }), pagination.boundaryLinks = !0, pagination.currentBreakpoint = "", pagination.currentPage = 1, pagination.paginationPageControls = [], pagination.totalItems = WcTableCollectionService.getCollectionLength(), pagination.totalPages = Math.ceil(pagination.totalItems / pagination.resultsPerPage), $scope.createPaginationControlNumbers = function() {
                for (var array = [], paginationOffset = Math.floor(pagination.numberOfPageControls / 2), 
                		index = 0; index < pagination.numberOfPageControls; index++) 
                	pagination.currentPage - paginationOffset > 0 && pagination.currentPage - paginationOffset <= pagination.totalPages && 
                	array.push(pagination.currentPage - paginationOffset), paginationOffset--;
                if (array.length < pagination.numberOfPageControls) {
                    var pageNumberToAdd, i, checkValue = Math.floor(pagination.currentPage - pagination.numberOfPageControls / 2),
                        numberOfPagesNeeded = Math.abs(array.length - pagination.numberOfPageControls);
                    if (0 >= checkValue) {
                        var lastPageAdded = array[array.length - 1];
                        for (i = 1; numberOfPagesNeeded >= i; i++) pageNumberToAdd = lastPageAdded + i, pagination.totalPages >= pageNumberToAdd && array.push(pageNumberToAdd)
                    } else {
                        var firstPageAdded = array[0];
                        for (i = 1; numberOfPagesNeeded >= i; i++) pageNumberToAdd = firstPageAdded - i, array.unshift(pageNumberToAdd)
                    }
                }
                pagination.paginationPageControls = array
            }, $scope.changeResultsPerPage = function() {
                if ("All" === pagination.resultsPerPage) pagination.resultsPerPage = pagination.totalItems, pagination.pageStart = 0, pagination.pageEnd = pagination.totalItems, pagination.totalPages = 1, $scope.changePage(1);
                else {
                    pagination.totalPages = Math.ceil(pagination.totalItems / pagination.resultsPerPage);
                    var newPage = Math.ceil(pagination.pageStart / pagination.resultsPerPage);
                    $scope.changePage(newPage ? newPage : 1)
                }
            }, $scope.updatePaginationControls = function(pageNumber) {
                pagination.currentPage = pageNumber, pagination.pageStart = pageNumber * pagination.resultsPerPage - pagination.resultsPerPage;
                var newPageEnd = pagination.pageStart + pagination.resultsPerPage;
                newPageEnd > pagination.totalItems ? pagination.pageEnd = pagination.totalItems : pagination.pageEnd = newPageEnd, WcTablePaginationService.setPaginationDefaults({
                    pageStart: pagination.pageStart,
                    pageEnd: pagination.pageEnd
                })
            }, $scope.changePage = function(pageNumber) {
                if (!(pageNumber > 0 && pageNumber <= pagination.totalPages)) throw isNaN(pageNumber) ? "Invaild Page Number: " + pageNumber + ". Must be a number, no other characters allowed" : 0 >= pageNumber ? "Invaild Page Number: " + pageNumber + ". Must be greater than 0" : pageNumber > pagination.totalPages ? "Invaild Page Number: " + pageNumber + ". Must be smaller than " + pagination.totalPages : "Invaild Page Number: " + pageNumber + ". Not sure what you did, but it is invalid";
                $scope.updatePaginationControls(pageNumber), $scope.createPaginationControlNumbers(), tableScope.renderTable()
            }, $scope.nextPage = function() {
                var nextPageNumber = pagination.currentPage;
                nextPageNumber + 1 <= pagination.totalPages && $scope.changePage(++nextPageNumber)
            }, $scope.previousPage = function() {
                var nextPageNumber = pagination.currentPage;
                nextPageNumber - 1 > 0 && $scope.changePage(--nextPageNumber)
            }, $scope.$watch(function() {
                return pagination.currentBreakpoint
            }, function(newValue, oldValue) {
                newValue !== oldValue && ("xs" === newValue ? (pagination.numberOfPageControls = 0, pagination.boundaryLinks = !1) : "sm" === newValue ? (pagination.numberOfPageControls = 0, pagination.boundaryLinks = !1) : "md" === newValue ? (pagination.numberOfPageControls = 0, pagination.boundaryLinks = !1) : "lg" === newValue ? (pagination.numberOfPageControls = 3, pagination.boundaryLinks = !0) : (pagination.numberOfPageControls = WcTablePaginationService.getPaginationDefaults().numberOfPageControls, pagination.boundaryLinks = !0), $scope.createPaginationControlNumbers())
            });
            var resizeHandler = function() {
                //<=430 is default
                window.innerWidth <= pagination.responsiveBreakpoints[0] && "xs" !== pagination.currentBreakpoint ? pagination.currentBreakpoint = "xs" : window.innerWidth > pagination.responsiveBreakpoints[0] && window.innerWidth <= pagination.responsiveBreakpoints[1] && "sm" !== pagination.currentBreakpoint ? pagination.currentBreakpoint = "sm" : window.innerWidth > pagination.responsiveBreakpoints[1] && window.innerWidth <= pagination.responsiveBreakpoints[2] && "md" !== pagination.currentBreakpoint ? pagination.currentBreakpoint = "md" : window.innerWidth > pagination.responsiveBreakpoints[2] && window.innerWidth <= pagination.responsiveBreakpoints[3] && "lg" !== pagination.currentBreakpoint ? pagination.currentBreakpoint = "lg" : window.innerWidth > pagination.responsiveBreakpoints[3] && "xl" !== pagination.currentBreakpoint && (pagination.currentBreakpoint = "xl"), $scope.$digest()
            };
            //debounce this handler to avoid rapid-fire resize events
            angular.element($window).bind("resize", _.debounce(resizeHandler, 300)),
                //finally, call the resizeHandler once to initialize our breakpoint var
                setTimeout(resizeHandler, 0)
        }],
        link: function(scope) {
            var resultsPerPageTemplate = ['<div class="col-xs-3 result-page-count">', "<label>Results Per Page: ", '<select style="width:65px;" class="form-control form-inline input-sm pagination-results-per-page" ng-options="result for result in pagination.selectResultsPerPage"', 'ng-model="pagination.resultsPerPage" ng-change="changeResultsPerPage()">', "</select></label>", "</div>"].join(""),
                paginationLegendTemplate = ['<div class="col-xs-4 text-right">', '<p class="hidden-xs hidden-sm results-data">', "Displaying {{pagination.pageStart + 1}} - {{pagination.pageEnd}} of {{pagination.totalItems}}", "</p>", "</div>"].join(""),
                paginationControlsTemplate = ['<div class="col-xs-5 pagination-control text-right">', '<ul class="hidden-xs pagination pagination-sm">', '<li ng-hide="!pagination.boundaryLinks" class="pagination-page"><button ng-click="changePage(1)">&#xe069</button></li>', '<li class="pagination-page"><button class="previous" ng-click="previousPage()" ng-class="{disabled: pagination.currentPage == 1}">&#xe071</button></li>', '<li class="pagination-page pagination-page-number" ng-class="{active: pagination.currentPage === number}" ng-repeat="number in pagination.paginationPageControls">', '<button ng-click="changePage(number)">{{number}}</button>', "</li>", '<li class="pagination-page"><button class="next" ng-click="nextPage()" ng-class="{disabled: pagination.currentPage == pagination.totalPages}">&#xe075</button></li>', '<li ng-hide="!pagination.boundaryLinks" class="pagination-page"><button ng-click="changePage(pagination.totalPages)">&#xe077</button></li>', "</ul>", "<div>"].join(""),
                navigateToPageTemplate = ['<div class="hidden-sm hidden-md hidden-lg hidden-xl text-center">', '<ul class="pagination pagination-sm">', '<li class="pagination-page" ng-class="{disabled: pagination.currentPage == 1}"><button class="previous" ng-click="previousPage()">&#xe071</button></li>', "<li>", '<input type="text" pattern="[0-9]*" ng-model="pagination.newInputPage" ng-change="changePage(pagination.newInputPage)" placeholder="Jump to Page" />', "</li>", '<li class="pagination-page" ng-class="{disabled: pagination.currentPage == pagination.totalPages}"><button class="next" ng-click="nextPage()">&#xe075</button></li>', "</ul>", '<p class="text-center">Page {{pagination.currentPage}} of {{pagination.totalPages}}</p>', "</div>"].join(""),
                action = $("div[og-responsive-table]").attr("data-table-name"),
                actionDropdownTemplate = [];
            action && (actionDropdownTemplate = ['<div class="col-xs-12 hidden action-dropdown">', '<div class="col-xs-4 pt-10"><strong>Row Actions :</strong></div>', '<div class="col-xs-8">', '<select class="form-control inline">', "<option>--Select--</option>", "<option>Delete</option>", "</select>", '<button class="btn ml-5 mt-neg-3 btn-primary" og-row-action-multiple="delete-' + action + '">Submit</button>', "</div>", "</div>"].join(""));
            var template = ['<div class="col-xs-12">', '<div class="row">', resultsPerPageTemplate, paginationLegendTemplate, paginationControlsTemplate, navigateToPageTemplate, "</div>", "</div>", actionDropdownTemplate].join(""),
                controlsPlacement = scope.pagination.paginationControlsPlacement,
                wrapper = $("div[og-responsive-table]");
            scope.createPaginationControlNumbers(), "top" !== controlsPlacement && "both" !== controlsPlacement || wrapper.before($compile(template)(scope)), "bottom" !== controlsPlacement && "both" !== controlsPlacement || wrapper.after($compile(template)(scope))
        }
    }
}])