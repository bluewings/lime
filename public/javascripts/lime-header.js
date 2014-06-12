(function () {

    'use strict';

    var app = angular.module('lime.header', []);

    app.directive('limeHeader', function ($http) {

        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/templates/header',
            scope: true,
            controller: function ($scope, $attrs, $timeout) {

                $scope.func = Object.create($scope.$parent.$root.func);
                
                $scope.func.toggleHeader = function () {

                    $scope.status.headerOpen = $scope.status.headerOpen ? false : true;
                };
                $scope.func.toggleSelectMode = function () {

                    $scope.status.selectMode = $scope.status.selectMode ? false : true
                };
                


                //};
                return;

                console.log('>>>>>hdr');

                console.log($scope.$parent.$root);

                console.log($scope.$parent.$root.func);

                $scope.func.prototype = $scope.$parent.$root.func;

                console.log($scope.$parent.$root);
            }
        };
    });

})();