(function () {

    'use strict';
    
    var $ = jQuery;

    var app = angular.module('lime.content.notes', ['ui.bootstrap']);
    
    var CONFIG = {};
    
    CONFIG = {
        ARCHIVE_MY_ID_KEY: 'lime-my-id',
        ARCHIVE_NOTES_KEY: 'lime-notes',
        SYNC_INTERVAL: 3000,
        STYLE: {
            COVER_HEIGHT: 220,
            NAV_BAR_HEIGHT: 47
            
        }
    };    

    app.directive('limeContentNotes', function ($http) {

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

    app.directive('limeNote', function ($http) {

        return {
            restrict: 'AE',
            replace: false,
            templateUrl: '/templates/note',
            controller: function ($scope, $rootScope, $attrs, $timeout) {

                //console.log('each note');
                //console.log($scope);
                //console.log($attrs);

                $timeout(function () {
                    $scope.shared = $attrs.shared;
                });



                $scope.$watch('note.title + note.note', function (newValue, oldValue) {

                    if (oldValue && oldValue !== newValue) {
                        $scope.note.updated = (new Date()).toISOString();
                    }
                });



                // TODO: 서비스로 뺄 것
                $scope.remove = function (note) {

                    var newItems = [];

                    angular.forEach($scope.$parent.data.notes, function (item) {
                        if (item !== note) {
                            newItems.push(item);
                        }
                    });

                    $scope.$parent.data.notes = newItems;

                    //$scope.$parent.data.notes.splice($scope.$index, 1)[0];

                };
                $scope.keep = function (_note) {

                    //console.log($scope);

                    //console.log($scope.$parent);

                    //console.log($scope.$parent.shares);

                    //return;

                    var note;
                    var newItems = [];

                    angular.forEach($scope.$parent.shares, function(item) {

                        if (item !== _note) {
                            newItems.push(item);
                        } else {
                            note = item;
                        }

                    });

                    //alert(note);

                    if (note) {
                    note = angular.copy(note);

                    delete note.$$hashKey;

                    note.created = (new Date()).toISOString();
                    note.archived = 0;
                    note.updated = null;
                    delete note._already;

                    $scope.$parent.data.notes.push(note);           
                    $scope.$parent.shares = newItems;           
                    }





                    //$scope.$parent.

                };
                $scope.archive = function (note) {

                    if (note.archived === 0) {
                        note.archived = 1;
                    } else {
                        note.archived = 0;
                    }

                    

                };


                $scope.share = function () {

                    $scope.$parent.shareAll($scope.note);



                };

                $scope.selected = function(note) {

                    return $rootScope.note.selected(note) ? true : false;
                };

                //console.log($scope);

            }
        };

    });    

    app.controller('lime.content.notes', function ($scope, $rootScope, $routeParams, $http, $filter, $timeout, $modal) {

    

        console.log($scope.data.notes);
        //console.log($scope);
        console.log($scope);

        $scope.func = {

            add: function () {
                $rootScope.note.add({
                    title: 'wow',
                    note: 'aaa'
                });
            },
            toggleNote: function(note) {

                $rootScope.note.toggle(note);
                //console.log(note);
            }
        };
        

$timeout(function() {
        $(window).scrollTop(CONFIG.STYLE.COVER_HEIGHT -CONFIG.STYLE.NAV_BAR_HEIGHT);    
    }, 100);         
    });     

})();