/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    //var $ = jQuery;

    var app = angular.module('neymar', [
        'ngRoute', 'ngSanitize', 'ngAnimate',
        'lime.resource'
    ]);

    app.constant('CONFIG', {
        ARCHIVE_MY_ID_KEY: 'lime-my-id',
        ARCHIVE_NOTES_KEY: 'lime-notes',
        URI: {
            MAIN: '/neymar',
            BOARD_VIEW: '/neymar/board/:boardId/view',
            BOARD_CREATE: '/neymar/board/edit',
            BOARD_MODIFY: '/neymar/board/:boardId/edit',
            NOTE_VIEW: '/neymar/board/:boardId/note/:_id/view',
            NOTE_CREATE: '/neymar/board/:boardId/note/edit',
            NOTE_MODIFY: '/neymar/board/:boardId/note/:_id/edit',
            ERROR: {
                USER_NOT_FOUND: '/neymar/error/userNotFound/:userId'
            }
        }
    });

    app.constant('CONSTANT', {
        SUCCESS: 'success',
        ERROR: 'error'
    });

    app.service('limeUtil', function () {

        return {
            uri: function (url, params) {

                var prop;

                for (prop in params) {
                    if (params.hasOwnProperty(prop)) {
                        url = url.replace(':' + prop, params[prop]);
                    }
                }
                return url;
            }
        };
    });



    app.config([
        '$locationProvider', '$routeProvider', '$compileProvider', 'CONFIG',
        function ($locationProvider, $routeProvider, $compileProvider, CONFIG) {

            $locationProvider.html5Mode(true);
            $routeProvider
                .when(CONFIG.URI.MAIN, {
                    templateUrl: '/templates/neymar-main',
                    controller: 'neymarCtrl_main'
                })
                .when(CONFIG.URI.BOARD_VIEW, {
                    templateUrl: '/templates/neymar-board-view',
                    controller: 'neymarCtrl_boardView'
                })
                .when(CONFIG.URI.BOARD_CREATE, {
                    templateUrl: '/templates/neymar-board-edit',
                    controller: 'neymarCtrl_boardEdit'
                })
                .when(CONFIG.URI.BOARD_MODIFY, {
                    templateUrl: '/templates/neymar-board-edit',
                    controller: 'neymarCtrl_boardEdit'
                })
                .when(CONFIG.URI.NOTE_VIEW, {
                    templateUrl: '/templates/neymar-note-view',
                    controller: 'neymarCtrl_noteView'
                })
                .when(CONFIG.URI.NOTE_CREATE, {
                    templateUrl: '/templates/neymar-note-edit',
                    controller: 'neymarCtrl_noteEdit'
                })
                .when(CONFIG.URI.NOTE_MODIFY, {
                    templateUrl: '/templates/neymar-note-edit',
                    controller: 'neymarCtrl_noteEdit'
                })
                .when(CONFIG.URI.ERROR.USER_NOT_FOUND, {
                    templateUrl: '/templates/error-user-not-found',
                    controller: 'errorCtrl_userNotFound'
                });



            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);
        }
    ]);

    app.controller('neymarCtrl_main', [
        '$scope', '$routeParams', 'CONSTANT',
        function ($scope, $routeParams, CONSTANT) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
        }
    ]);

    app.controller('neymarCtrl_boardView', [
        '$scope', '$routeParams', 'CONSTANT',
        function ($scope, $routeParams, CONSTANT) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.$watch('data.boards', function (newValue, oldValue) {

                var i;

                if (newValue) {
                    for (i = 0; i < $scope.data.boards.length; i++) {
                        if ($routeParams.boardId === $scope.data.boards[i].boardId) {
                            $scope.data.board = $scope.data.boards[i];
                            break;
                        }
                    }
                }
            });
        }
    ]);

    app.controller('neymarCtrl_boardEdit', [
        '$scope', '$routeParams', 'CONSTANT', 'Board',
        function ($scope, $routeParams, CONSTANT, Board) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $scope.data.createdBy = newValue;
                }
            });

            if ($routeParams.boardId) {

                Board.get({
                    boardId: $routeParams.boardId
                }, function (response) {

                    var prop;

                    if (CONSTANT.SUCCESS !== response.status) {
                        alert(response.message);
                    } else {
                        $scope.data.boardId = response.data.boardId;
                        $scope.data.title = response.data.title;
                        $scope.data.note = response.data.note;
                    }
                });
            }

            $scope.func.create = function () {

                Board.save($scope.data, function (response) {

                    if (CONSTANT.SUCCESS !== response.status) {
                        alert(response.message);
                    } else {
                        $scope.func.refresh();
                        $scope.func.close();
                    }
                });
            };

            $scope.func.modify = function () {

                if ($routeParams.boardId) {

                    Board.update({
                        boardId: $routeParams.boardId
                    }, $scope.data, function (response) {

                        if (CONSTANT.SUCCESS !== response.status) {
                            alert(response.message);
                        } else {
                            $scope.func.refresh();
                            $scope.func.close();
                        }
                    });
                }
            };

            $scope.func.cancel = function () {

                $scope.func.close();
            };

            $scope.func.close = function () {

                history.back();
            };
        }
    ]);

    app.controller('neymarCtrl_noteView', [
        '$scope', '$routeParams', 'CONSTANT',
        function ($scope, $routeParams, CONSTANT) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.$watchCollection('data.boards', function (newValue, oldValue) {

                var i, j;

                if (newValue) {
                    for (i = 0; i < $scope.data.boards.length; i++) {
                        if ($routeParams.boardId === $scope.data.boards[i].boardId) {
                            for (j = 0; j < $scope.data.boards[i].notes.length; j++) {
                                if ($routeParams._id === $scope.data.boards[i].notes[j]._id) {
                                    $scope.data.note = $scope.data.boards[i].notes[j];
                                    break;
                                }
                            }
                        }
                    }
                }
            });
        }
    ]);    

    app.controller('neymarCtrl_noteEdit', [
        '$scope', '$routeParams', 'CONSTANT', 'Note',
        function ($scope, $routeParams, CONSTANT, Note) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $scope.data.createdBy = newValue;
                }
            });

            if ($routeParams._id) {

                Note.get({
                    boardId: $routeParams.boardId,
                    _id: $routeParams._id
                }, function (response) {

                    var prop;

                    if (CONSTANT.SUCCESS !== response.status) {
                        alert(response.message);
                    } else {
                        $scope.data.boardId = response.data.boardId;
                        $scope.data._id = response.data._id;
                        $scope.data.title = response.data.title;
                        $scope.data.note = response.data.note;
                    }
                });
            }

            $scope.func.create = function () {

                Note.save({
                    boardId: $routeParams.boardId
                }, $scope.data, function (response) {

                    if (CONSTANT.SUCCESS !== response.status) {
                        alert(response.message);
                    } else {
                        $scope.func.refresh();
                        $scope.func.close();
                    }
                });
            };

            $scope.func.modify = function () {

                if ($routeParams._id) {

                    Note.update({
                        boardId: $routeParams.boardId,
                        _id: $routeParams._id
                    }, $scope.data, function (response) {

                        if (CONSTANT.SUCCESS !== response.status) {
                            alert(response.message);
                        } else {
                            $scope.func.refresh();
                            $scope.func.close();
                        }
                    });
                }
            };

            $scope.func.cancel = function () {

                $scope.func.close();
            };

            $scope.func.close = function () {

                history.back();
            };
        }
    ]);

    app.controller('errorCtrl_userNotFound', [
        '$scope', '$routeParams', 'CONSTANT', 'neymarUser',
        function ($scope, $routeParams, CONSTANT, neymarUser) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.data.userId = $routeParams.userId;

            $scope.func.reset = function () {

                neymarUser.reset().then(function (userId) {

                    history.back();
                });
            };
        }
    ]);



    app.service('error', [
        '$location', 'CONFIG', 'limeUtil',
        function ($location, CONFIG, limeUtil) {

            return {
                print: function (type, params) {

                    var path;

                    switch (type) {
                    case 'USER_NOT_FOUND':
                        path = CONFIG.URI.ERROR.USER_NOT_FOUND;
                        break;
                    }

                    if (path) {
                        $location.path(limeUtil.uri(path, params));
                    }
                }
            };
        }
    ]);

    app.service('neymarUser', [
        '$q', '$rootScope', 'CONSTANT', 'CONFIG', 'User',
        function ($q, $rootScope, CONSTANT, CONFIG, User) {

            var instance = {};

            instance.myId = null;

            return {
                reset: function () {

                    var deferred = $q.defer();

                    localStorage.removeItem(CONFIG.ARCHIVE_MY_ID_KEY);
                    instance.myId = null;
                    this.getMyId().then(function (myId) {

                        $rootScope.data.myId = myId;
                        deferred.resolve(myId);
                    });

                    return deferred.promise;
                },
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

                        console.log(response);
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
        '$rootScope', '$location', 'CONSTANT', 'CONFIG', 'neymarUser', 'User', 'Board', 'Note',
        'error', 'limeUtil',
        function ($rootScope, $location, CONSTANT, CONFIG, neymarUser, User, Board, Note, error, limeUtil) {

            $rootScope.data = {
                myId: null,
                boards: []
            };

            $rootScope.func = {
                addBoard: function () {


                    $location.path(CONFIG.URI.EDIT_BOARD);
                    //alert('add list 2');
                    //$location.path();
                },
                removeBoard: function (board) {

                    Board.remove({
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

                        //console.log('>>>>>>>>>');

                        User.get({
                            userId: $rootScope.data.myId
                        }, function (response) {

                            var boards = {},
                                inx;

                            console.log(response);



                            if (CONSTANT.SUCCESS === response.status) {

                                //console.log($rootScope.data.boards);

                                $rootScope.data.boards = arrayReplaceByObjectId($rootScope.data.boards, response.data.boards);
                            } else {
                                error.print('USER_NOT_FOUND', {
                                    userId: $rootScope.data.myId
                                });
                                throw response.message;
                            }
                        });
                    }
                }
            };

            $rootScope.func.board = {

                move: function (board, event) {

                    if (event) {
                        event.stopPropagation();
                    }

                    $location.path(limeUtil.uri(CONFIG.URI.BOARD_VIEW, {
                        boardId: board.boardId
                    }));
                },

                remove: function (board, event) {

                    if (event) {
                        event.stopPropagation();
                    }

                    Board.remove({
                        boardId: board.boardId
                    }, function (response) {

                        if (CONSTANT.SUCCESS !== response.status) {
                            alert(response.message);
                        } else {
                            $rootScope.func.refresh();
                        }
                    });
                }
            };


            $rootScope.func.note = {

                move: function (note, event) {

                    if (event) {
                        event.stopPropagation();
                    }

                    $location.path(limeUtil.uri(CONFIG.URI.NOTE_VIEW, {
                        boardId: note.boardId, 
                        _id: note._id
                    }));
                },

                remove: function (note, event) {

                    if (event) {
                        event.stopPropagation();
                    }

                    Note.remove({
                        boardId: note.boardId, 
                        _id: note._id
                    }, function (response) {

                        if (CONSTANT.SUCCESS !== response.status) {
                            alert(response.message);
                        } else {
                            $rootScope.func.refresh();
                        }
                    });
                }
            };


            $rootScope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $rootScope.func.refresh();
                }
            });

            neymarUser.getMyId().then(function (myId) {

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

    app.controller('neymar.controller.list', [
        '$scope',
        function ($scope) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};


        }
    ]);


    app.controller('neymar.controller.board.view', [
        '$scope',
        '$routeParams',
        '$location',
        'CONFIG',
        function ($scope, $routeParams, $location, CONFIG) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.data.board = {};

            $scope.func.addCard = function () {

                //alert('카드 추가');
                $location.path(CONFIG.URI.NOTE_MODIFY
                    .replace(/:boardId/, $routeParams.boardId)
                    .replace(/:_id/, ''));

            };

            $scope.$watch('data.boards', function (newValue, oldValue) {

                var inx;
                console.log('<><<<<<<<<<<<<<');
                console.log(newValue);

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

    app.controller('neymar.controller.board.edit', [
        '$scope',
        '$rootScope',
        'Board',
        function ($scope, $rootScope, Board) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};

            $scope.data.pageClass = 'page-edit';
            $scope.data.createdBy = $rootScope.data.myId;

            $scope.func.submit = function () {

                Board.save($scope.data, function (response) {

                    $scope.func.refresh();

                    history.back();
                    //});
                });



            };



        }

    ]);



    angular.element(document).ready(function () {

        ///console.log(arguments);

        angular.bootstrap(document, ['neymar']);
    });



}());