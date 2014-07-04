/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var $ = jQuery;

    var app = angular.module('benzema', [
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
            EDIT_BOARD: '/benzema/edit/list',
            VIEW_BOARD: '/benzema/board/:boardId/view',
            NOTE_CREATE: '/benzema/board/:boardId/note/edit',
            NOTE_MODIFY: '/benzema/board/:boardId/note/:_id/edit'
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
                .when('/benzema/board/:boardId/view', {
                    templateUrl: '/templates/benzema-board-view',
                    controller: 'benzemaCtrl_boardView'
                })
                


                .when('/benzema/view/:shareId', {
                    templateUrl: '/templates/benzema-view',
                    controller: 'benzema.controller.view'
                })
                .when(CONFIG.URI.EDIT_BOARD, {
                    templateUrl: '/templates/benzema-edit-list',
                    controller: 'benzema.controller.board.edit'
                })
                .when(CONFIG.URI.VIEW_BOARD, {
                    templateUrl: '/templates/benzema-board-view',
                    controller: 'benzema.controller.board.view'
                })
                .when(CONFIG.URI.NOTE_CREATE, {
                    templateUrl: '/templates/benzema-note-edit',
                    controller: 'benzema.controller.board.view'
                })
                .when(CONFIG.URI.NOTE_MODIFY, {
                    templateUrl: '/templates/benzema-note-edit',
                    controller: 'benzema.controller.board.view'
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
        '$rootScope', '$location', 'CONSTANT', 'CONFIG', 'benzemaUser', 'User', 'Share',
        function ($rootScope, $location, CONSTANT, CONFIG, benzemaUser, User, Share) {

            $rootScope.data = {
                myId: null,
                boardList: []
            };

            $rootScope.func = {
                addBoard: function () {


                    $location.path(CONFIG.URI.EDIT_BOARD);
                    //alert('add list 2');
                    //$location.path();
                },
                removeBoard: function (board) {

                    Share.remove({
                        shareId: board.shareId
                    }, function (data) {

                        //console.log(data);
                        $rootScope.func.refresh();
                    });

                },
                moveToBoard: function (board) {

                    //alert('해당 보드로 이동');
                    $location.path(CONFIG.URI.VIEW_BOARD.replace(/:boardId/, board.shareId));

                },
                refresh: function () {

                    function arrayReplaceByObjectId(arr1, arr2) {



                        var inx, key, dict = {},
                            newArr = [];

                        for (inx = 0; inx < arr2.length; inx++) {
                            dict[arr2[inx]._id] = arr2[inx];
                        }

                        // replace
                        for (inx = 0; inx < arr1.length; inx++) {
                            if (dict[arr1[inx]._id]) {
                                dict[arr1[inx]._id].$$hashKey = arr1[inx].$$hashKey;
                                newArr.push(dict[arr1[inx]._id]);
                                delete dict[arr1[inx]._id];
                            }
                        }

                        // append
                        for (key in dict) {
                            if (dict.hasOwnProperty(key)) {
                                newArr.push(dict[key]);

                            }
                        }
                        console.log(angular.copy(newArr));
                        return newArr;
                    }

                    if ($rootScope.data.myId) {

                        User.get({
                            userId: $rootScope.data.myId
                        }, function (response) {

                            var shared = {},
                                inx;



                            for (inx = 0; inx < response.data.shared; inx++) {

                            }



                            if (CONSTANT.SUCCESS === response.status) {

                                //console.log($rootScope.data.boardList);

                                $rootScope.data.boardList = arrayReplaceByObjectId($rootScope.data.boardList, response.data.shared);
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
        function ($scope) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};


        }
    ]);


    app.controller('benzema.controller.board.view', [
        '$scope',
        '$routeParams',
        '$location',
        'CONFIG',
        function ($scope, $routeParams, $location, CONFIG) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.data.board = {};

            $scope.func.addCard = function() {

                //alert('카드 추가');
                $location.path(CONFIG.URI.NOTE_MODIFY
                    .replace(/:boardId/, $routeParams.boardId)
                    .replace(/:_id/, ''));

            };

            $scope.$watch('data.boardList', function (newValue, oldValue) {

                var inx;

                if (newValue && newValue.length) {
                    for (inx = 0; inx < newValue.length; inx++) {
                        if ($routeParams.boardId === newValue[inx].shareId) {
                            $scope.data.board = newValue[inx];
                            break;
                        }
                    }
                }

            });

        }
    ]);

    app.controller('benzema.controller.board.edit', [
        '$scope',
        '$rootScope',
        'Share',
        function ($scope, $rootScope, Share) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.data.pageClass = 'page-edit';
            $scope.data.createdBy = $rootScope.data.myId;

            $scope.func.submit = function () {

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

        angular.bootstrap(document, ['benzema']);
    });



}());