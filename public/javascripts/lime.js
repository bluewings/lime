(function () {

    var app = angular.module('limeNote', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'lime.header']);

    var CONFIG = {};

    CONFIG.ARCHIVE_NOTES_KEY = 'keep-notes';

    function unescapeHTML(str) {
        return str.replace(/\&lt;/g, '<')
            .replace(/\&gt;/g, '>')
            .replace(/\&quot;/g, '"')
            .replace(/\&#039;/g, "'")
            .replace(/\&amp;/g, '&');
    };

    app.config(function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $routeProvider.when('/home', {
            templateUrl: '/templates/lime',
            controller: 'lime.content'
        })
            .when('/about', {
                templateUrl: '/templates/about',
                controller: 'lime.content.view'
            })
            .when('/share/:id', {
                templateUrl: '/templates/lime',
                controller: 'lime.content'
            })
            .otherwise({
                redirectTo: '/home'
            });
    });

    // run blocks
    app.run(function($rootScope) {
      // you can inject any instance here
        $rootScope.status = {
            headerOpen: false,
            selectable: false
        };

        $rootScope.data = {
            notes: []
        };


        $rootScope.note = {
            add: function(data) {

                var obj;

                if (data.title || data.note) {
                    obj = {
                        _id: (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 5),
                        title: data.title,
                        note: data.note,
                        created: (new Date()).toISOString(),
                        archived: 0,
                        updated: null,
                        color: '#fff'
                    };
                    /*if ($scope.new.image) {
                        obj.image = $scope.new.image;
                    }
                    if ($scope.new.url) {
                        obj.url = $scope.new.url;
                    }*/
                    $rootScope.data.notes.push(obj);
                    /*$scope.new.title = '';
                    $scope.new.note = '';
                    $scope.new.image = '';
                    $scope.new.url = '';*/
                }                

            }
        };

        $rootScope.$watch('status.headerOpen', function(newValue, oldValue) {

            if (newValue === false) {
                $rootScope.status.selectable = false;
            }
        });



    });    



    app.controller('lime.content', function ($scope, $rootScope, $routeParams, $http, $filter, $timeout, $modal) {

        console.log($scope.data.notes);
        //console.log($scope);
        console.log($scope);

        $scope.func = {

            add: function() {
                $rootScope.note.add({
                    title: 'wow',
                    note: 'aaa'
                });
            }

        };
    });

    app.controller('lime.content.view', function ($scope, $routeParams, $http, $filter, $timeout, $modal) {

        
    });


})();