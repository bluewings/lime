/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var $ = jQuery;

    var app = angular.module('limeNote', [
        'ngRoute', 'ngSanitize', 'ngAnimate',
        'lime.resource'
    ]);

    // limeNote-constant
    app.constant('CONFIG', {
        ARCHIVE_MY_ID_KEY: 'lime-my-id',
        ARCHIVE_NOTES_KEY: 'lime-notes',
        SYNC_INTERVAL: 3000,
        STYLE: {
            COVER_HEIGHT: 220,
            NAV_BAR_HEIGHT: 47
        },
        URI: {
            EDIT_LIST: '/benzema/edit/list'
        }
    });

    app.constant('CONSTANT', {
        SUCCESS: 'success',
        ERROR: 'error'
    });
    // //limeNote-constant

    app.config([
        '$locationProvider', '$routeProvider', '$compileProvider', 'CONFIG',
        function ($locationProvider, $routeProvider, $compileProvider, CONFIG) {

            $locationProvider.html5Mode(true);
            $routeProvider
                .when('/benzema', {
                    templateUrl: '/templates/benzema-main',
                    controller: 'benzema.controller.list',
                    animation: 'slide'
                })
                .when('/benzema/view/:shareId', {
                    templateUrl: '/templates/benzema-view',
                    controller: 'benzema.controller.view'
                })
                .when(CONFIG.URI.EDIT_LIST, {
                    templateUrl: '/templates/benzema-edit-list',
                    controller: 'benzema.controller.edit.list'
                })
                .otherwise({
                    redirectTo: '/benzema'
                });

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);
        }
    ]);

    app.service('benzemaUser', [
        '$q', 'CONSTANT', 'CONFIG', 'User',
        function ($q, CONSTANT, CONFIG, User) {

            var instance = {};

            instance.myId = null;

            return {
                getMyId: function () {

                    var deferred = $q.defer();

                    if (instance.myId) { // already know 'myId'
                        deferred.resolve(instance.myId);
                        return deferred.promise;
                    }

                    instance.myId = localStorage.getItem(CONFIG.ARCHIVE_MY_ID_KEY);
                    if (instance.myId) { // found 'myId' from localStorage
                        deferred.resolve(instance.myId);
                        return deferred.promise;
                    }

                    User.save({}, {}).$promise.then(function (response) { // get issued 'myId' from server
                        if (CONSTANT.SUCCESS === response.status) {
                            instance.myId = response.data.userId;
                            localStorage.setItem(CONFIG.ARCHIVE_MY_ID_KEY, instance.myId);
                            deferred.resolve(response.data.userId);
                        } else {
                            throw response.message;
                        }
                    });

                    return deferred.promise;
                }
            };
        }
    ]);

    app.run([
        '$rootScope', '$location', 'CONSTANT', 'CONFIG', 'benzemaUser', 'User',
        function ($rootScope, $location, CONSTANT, CONFIG, benzemaUser, User) {

            $rootScope.data = {
                myId: null,
                boardList: []
            };

            $rootScope.func = {
                addList: function () {


                    $location.path(CONFIG.URI.EDIT_LIST);
                    //alert('add list 2');
                    //$location.path();
                },
                refresh: function() {

                    if ($rootScope.data.myId) {

                    User.get({
                        userId: $rootScope.data.myId
                    }, function (response) {
                        if (CONSTANT.SUCCESS === response.status) {
                            $rootScope.data.boardList = response.data.shared;
                        } else {
                            throw response.message;
                        }
                    });
                }
                }
            };

            $rootScope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $rootScope.func.refresh();
                }
            });

            benzemaUser.getMyId().then(function (myId) {

                $rootScope.data.myId = myId;
            });

            /*$rootScope.status = {
            myId: null,
            headerOpen: false,
            selectMode: false,
            hasChanges: false,
            syncFromRemote: false,
            notesHashCode: '',
            filterTag: ''
        };*/
        }
    ]);

    app.controller('benzema.controller.list', [
        '$scope',
        '$rootScope',
        function ($scope, $rootScope) {

            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};


        }
    ]);

    app.controller('benzema.controller.edit.list', [
        '$scope',
        '$rootScope',
        'Share',
        function ($scope, $rootScope, Share) {


            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};

            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.data.createdBy = $rootScope.data.myId;

            $scope.func.submit = function() {

                Share.save($scope.data, function (response) {

                    $scope.func.refresh();

                    history.back();
                    //});
                });                


                

            };






        }

    ]);



    angular.element(document).ready(function () {

        ///console.log(arguments);

        angular.bootstrap(document, ['limeNote']);
    });



}());