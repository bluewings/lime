(function () {

    'use strict';

    var app = angular.module('lime.header', []);

    app.directive('header', function ($http) {

        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/templates/header',
            controller: function ($scope, $attrs, $timeout) {

                $scope.status = {
                    open: false

                };



                $scope.func = {
                    toggle: function() {
                        
                        //alert('www');

                        $scope.status.open = $scope.status.open ? false : true;
                        $(document.body).toggleClass('header_open');

                    }

                };

                //console.log('each note');
                //console.log($scope);
                //console.log($attrs);


            }


        };

    });

})();