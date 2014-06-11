(function () {

    'use strict';

    var app = angular.module('lime.header', []);

    app.directive('header', function ($http) {

        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/templates/header',
            scope: true,
            controller: function ($scope, $attrs, $timeout) {

                $scope.func = {
                    toggleHeader: function() {

                        $scope.status.headerOpen = $scope.status.headerOpen ? false : true;
                    },
                    toggleSelectMode: function() {

                        $scope.status.selectable = $scope.status.selectable ? false : true
                    }
                };
            }
        };
    });

})();