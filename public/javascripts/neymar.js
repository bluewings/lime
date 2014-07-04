/*jslint browser: true, devel: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var app = angular.module('neymar', [
        'ngRoute',
        'ngResource',
        'ngSanitize',
        //'ngAnimate',
        'ui.bootstrap',
        'angularFileUpload'
    ]);

    app.constant('CONFIG', {
        ARCHIVE_MY_ID_KEY: 'lime-my-id',
        URI: {
            MAIN: '/neymar',
            BOARD_VIEW: '/neymar/board/:boardId/view',
            BOARD_CREATE: '/neymar/board/edit',
            BOARD_MODIFY: '/neymar/board/:boardId/edit',
            NOTE_VIEW: '/neymar/board/:boardId/note/:_id/view',
            NOTE_CREATE: '/neymar/board/:boardId/note/edit',
            NOTE_MODIFY: '/neymar/board/:boardId/note/:_id/edit'
        }
    });

    app.constant('ERROR', {
        USER_NOT_FOUND: {
            TYPE: 'user_not_found',
            URI: '/neymar/error/userNotFound/:userId'
        }
    });

    app.constant('CONSTANT', {
        SUCCESS: 'success',
        ERROR: 'error'
    });

    app.config([
        '$locationProvider', '$routeProvider', '$compileProvider', 'CONFIG', 'ERROR',
        function ($locationProvider, $routeProvider, $compileProvider, CONFIG, ERROR) {

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
                .when(ERROR.USER_NOT_FOUND.URI, {
                    templateUrl: '/templates/error-user-not-found',
                    controller: 'errorCtrl_userNotFound'
                });

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);
        }
    ]);

    app.controller('neymarCtrl_main', [
        '$scope', '$routeParams', 'CONSTANT', '$timeout',
        function ($scope, $routeParams, CONSTANT, $timeout) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};
        }
    ]);

    app.controller('neymarCtrl_boardView', [
        '$scope', '$routeParams', 'CONSTANT', 'UserBoards',
        function ($scope, $routeParams, CONSTANT, UserBoards) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            $scope.$watch('data.boards', function (newValue, oldValue) {

                var i, found = false;

                if (newValue && newValue.length > 0) {
                    for (i = 0; i < newValue.length; i++) {
                        if ($routeParams.boardId === newValue[i].boardId) {
                            $scope.data.board = newValue[i];
                            found = true;
                            break;
                        }
                    }
                    if (found === false) {

                        UserBoards.save({
                            userId: $scope.data.myId,
                            boardId: $routeParams.boardId
                        }, {}, function (response) {

                            if (CONSTANT.SUCCESS !== response.status) {
                                alert(response.message);
                            } else {
                                $scope.func.refresh();
                            }
                        });

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
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            $scope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $scope.data.createdBy = newValue;
                }
            });

            if ($routeParams.boardId) {

                Board.get({
                    boardId: $routeParams.boardId
                }, function (response) {

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
                        //$scope.func.board.move(response.data);
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
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

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
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

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
        '$scope', '$routeParams', 'CONSTANT', 'limeUser',
        function ($scope, $routeParams, CONSTANT, limeUser) {

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            $scope.data.userId = $routeParams.userId;

            $scope.func.reset = function () {

                limeUser.reset().then(function (userId) {

                    history.back();
                });
            };
        }
    ]);

    app.service('limeUser', [
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
                setMyId: function (userId) {

                    var deferred = $q.defer();

                    localStorage.removeItem(CONFIG.ARCHIVE_MY_ID_KEY);
                    instance.myId = null;

                    User.get({
                        userId: userId
                    }, {}).$promise.then(function (response) { // get issued 'myId' from server

                        if (CONSTANT.SUCCESS === response.status) {
                            instance.myId = response.data.userId;
                            localStorage.setItem(CONFIG.ARCHIVE_MY_ID_KEY, instance.myId);
                            $rootScope.data.myId = instance.myId;
                            deferred.resolve(response.data.userId);
                        } else {
                            deferred.reject(response.message);
                        }
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

    app.service('limeUtil', [
        '$q',
        function ($q) {

            return {
                uri: function (url, params) {

                    var prop;

                    for (prop in params) {
                        if (params.hasOwnProperty(prop)) {
                            url = url.replace(':' + prop, params[prop]);
                        }
                    }
                    return url;
                },
                arrayReplaceByObjectId: function (arr1, arr2) {

                    var inx, key, dict = {},
                        newArr = [];

                    for (inx = 0; inx < arr2.length; inx++) {
                        dict[arr2[inx]._id] = arr2[inx];
                    }
                    for (inx = 0; inx < arr1.length; inx++) { // replace
                        if (dict[arr1[inx]._id]) {
                            dict[arr1[inx]._id].$$hashKey = arr1[inx].$$hashKey;
                            newArr.push(dict[arr1[inx]._id]);
                            delete dict[arr1[inx]._id];
                        }
                    }
                    for (key in dict) { // append
                        if (dict.hasOwnProperty(key)) {
                            newArr.push(dict[key]);
                        }
                    }
                    return newArr;
                }
            };
        }
    ]);

    app.service('limeError', [
        '$location', 'ERROR', 'limeUtil',
        function ($location, ERROR, limeUtil) {

            return {
                print: function (type, params) {

                    var path;

                    switch (type) {
                    case ERROR.USER_NOT_FOUND.TYPE:
                        path = ERROR.USER_NOT_FOUND.URI;
                        break;
                    }

                    if (path) {
                        $location.path(limeUtil.uri(path, params));
                    }
                }
            };
        }
    ]);

    app.factory('User', [
        '$resource',
        function ($resource) {

            return $resource('/user/:userId');
        }
    ]);

    app.factory('UserBoards', [
        '$resource',
        function ($resource) {

            return $resource('/user/:userId/boards/:boardId', null, {
                update: {
                    method: 'PUT',
                    params: {
                        userId: '@userId',
                        boardId: '@boardId'
                    }
                }
            });
        }
    ]);

    app.factory('Board', [
        '$resource',
        function ($resource) {

            return $resource('/board/:boardId', null, {
                update: {
                    method: 'PUT',
                    params: {
                        boardId: '@boardId'
                    }
                }
            });
        }
    ]);

    app.factory('Note', [
        '$resource',
        function ($resource) {

            return $resource('/board/:boardId/note/:_id', null, {
                update: {
                    method: 'PUT',
                    params: {
                        boardId: '@boardId',
                        _id: '@_id'
                    }
                }
            });
        }
    ]);

    app.run([
        '$rootScope', '$location', '$interval', '$modal', 'CONSTANT', 'CONFIG', 'ERROR', 'User', 'Board', 'Note', 'limeUser', 'limeUtil', 'limeError',
        function ($rootScope, $location, $interval, $modal, CONSTANT, CONFIG, ERROR, User, Board, Note, limeUser, limeUtil, limeError) {

            $rootScope.data = {
                myId: null,
                now: new Date(),
                user: {},
                boards: []
            };

            $interval(function() {

                $rootScope.data.now = new Date();
            }, 60000);

            $rootScope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $rootScope.func.refresh();
                }
            });

            $rootScope.modal = {
                user: function (event) {

                    var controller = function ($scope, $modalInstance, userData) {

                        $scope.userData = userData;

                        $scope.func = {
                            change: function () {

                                limeUser.setMyId($scope.userData.userId).then(function (userId) {

                                    $scope.func.close();
                                }, function(err) {

                                    alert('존재하지 않는 사용자입니다.');
                                });
                            },
                            reset: function () {

                                limeUser.reset().then(function (userId) {

                                    $scope.func.close();
                                });
                            },
                            close: function () {
                                $modalInstance.dismiss();
                            }
                        };
                    };

                    if (event) {
                        event.stopPropagation();
                    }

                    controller.$inject = ['$scope', '$modalInstance', 'userData'];

                    return $modal.open({
                        templateUrl: '/templates/modal-user',
                        size: 'sm',
                        resolve: {
                            userData: function () {
                                return angular.copy($rootScope.data.user || []);
                            }
                        },
                        controller: controller
                    });
                },
                json: function (jsonData, event) {

                    var controller = function ($scope, $modalInstance, jsonData) {

                        $scope.jsonData = jsonData;

                        $scope.func = {
                            close: function () {
                                $modalInstance.dismiss();
                            }
                        };
                    };

                    if (event) {
                        event.stopPropagation();
                    }

                    controller.$inject = ['$scope', '$modalInstance', 'jsonData'];

                    return $modal.open({
                        templateUrl: '/templates/modal-json',
                        size: 'sm',
                        resolve: {
                            jsonData: function () {
                                return angular.copy(jsonData || []);
                            }
                        },
                        controller: controller
                    });
                }
            };

            $rootScope.func = {
                refresh: function () {

                    if ($rootScope.data.myId) {

                        User.get({
                            userId: $rootScope.data.myId
                        }, function (response) {

                            if (CONSTANT.SUCCESS === response.status) {
                                $rootScope.data.user = {
                                    userId: response.data.userId,
                                    created: response.data.created,
                                    userAgents: response.data.userAgents
                                };
                                $rootScope.data.boards = limeUtil.arrayReplaceByObjectId($rootScope.data.boards, response.data.boards);
                            } else {
                                limeError.print(ERROR.USER_NOT_FOUND.TYPE, {
                                    userId: $rootScope.data.myId
                                });
                                throw response.message;
                            }
                        });
                    }
                },
                board: {
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
                },
                note: {
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
                }
            };

            limeUser.getMyId().then(function (myId) {

                $rootScope.data.myId = myId;
            });
        }
    ]);

    angular.element(document).ready(function () {

        angular.bootstrap(document, ['neymar']);
    });

}());