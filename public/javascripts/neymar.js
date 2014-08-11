/*jslint browser: true, devel: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true, jindo: true */
(function () {

    'use strict';

    /*window.onerror = function (err) {
        alert(err);
    }*/

    function unescapeHTML(str) {

        return str.replace(/\&lt;/g, '<')
            .replace(/\&gt;/g, '>')
            .replace(/\&quot;/g, '"')
            .replace(/\&#039;/g, "'")
            .replace(/\&amp;/g, '&');
    }

    var $ = jQuery;

    var app = angular.module('neymar', [
        'ngRoute',
        'ngResource',
        'ngAnimate',
        'ui.bootstrap',
        'monospaced.qrcode',
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
        },
        //BOARD_COLORS: ['#3c70e9', '#39b64e', '#e64a64', '#f5564e', '#805eb9', '#9297a8', '#b25eb9', '#fcb60c']
        BOARD_COLORS: ['#3c70e9', '#39b64e', '#e64a64', '#9297a8', '#b25eb9', '#fcb60c'],
        BOARD_BACKGROUND_IMAGES: ['/images/bg_01_sm.jpeg', '/images/bg_02_sm.jpeg', '/images/bg_03_sm.jpeg', '/images/bg_04_sm.jpeg', '/images/bg_05_sm.jpeg', '/images/bg_06_sm.jpeg', '/images/bg_07_sm.jpeg']
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
            $routeProvider.when(CONFIG.URI.MAIN, {
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
                })
                .otherwise({
                    templateUrl: '/templates/error-user-not-found',
                    controller: 'errorCtrl_userNotFound'
                });

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);


        }
    ]);

    app.controller('neymarCtrl_main', [
        '$scope', '$routeParams', 'CONSTANT', '$timeout',

        function ($scope, $routeParams, CONSTANT, $timeout) {

            $scope.pageClass = 'page-main';

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};
        }
    ]);

    app.controller('neymarCtrl_boardView', [
        '$scope', '$routeParams', 'CONSTANT', 'CONFIG', '$timeout', '$location', '$upload', '$q', 'UserBoards', 'Note',

        function ($scope, $routeParams, CONSTANT, CONFIG, $timeout, $location, $upload, $q, UserBoards, Note) {

            var masonry, timer;

            $scope.pageClass = 'page-main';

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            // 사진 바로 올리기 기능을 위해서 넣음
            $scope.note = {};

            function isotope() {

                if (!masonry) {
                    masonry = $('.masonry'); //.width(document.documentElement.clientWidth + 20);

                    masonry.find('img').each(function (index, item) {
                        //console.log(item);                 
                        item.onload = function () {
                            //console.log('img');             
                            clearTimeout(timer);
                            timer = setTimeout(function () {
                                masonry.isotope();
                            }, 100);
                        };

                    });

                    //alert();
                    masonry.isotope({
                        //   columnWidth: masonry.find('.masonry-brick').outerWidth() - 10,
                        itemSelector: '.masonry-brick',
                        gutter: 0,
                        onLayout: function() {
                            masonry.css('overflow', 'visible');
                        }
                    });
                } else {
                    //console.log('>>>>>>> 1');
                    try {
                        masonry.isotope('reloadItems').isotope({
                        //   columnWidth: masonry.find('.masonry-brick').outerWidth() - 10,
                            itemSelector: '.masonry-brick',
                            gutter: 0,
                            onLayout: function() {
                                masonry.css('overflow', 'visible');
                            }
                        });
                    } catch (err) {
                        masonry = null;
                        //console.log('>>>>>>> err');
                    }

                    //console.log('>>>>>>> 2');
                }

                return;

                if (!masonry._sortable) {
                    try {
                        masonry.sortable('destroy');
                    } catch(ignore) {

                    }
                    masonry._sortable = true;
                    masonry.sortable({
                        cursor: 'move',
                        start: function(event, ui) {
                            ui.item.addClass('grabbing moving').removeClass('masonry-brick');
                            ui.placeholder.addClass('starting')
                                .removeClass('moving')
                                .css({
                                    top: ui.originalPosition.top,
                                    left: ui.originalPosition.left
                                });

                            masonry.isotope('reloadItems');  

                        },                        
                        change: function(event, ui) {
                            masonry
                                .isotope('reloadItems')
                                .isotope({ sortBy: 'original-order'});
                        },
                        stop: function(event, ui) {

                            ui.item.removeClass('grabbing').addClass('masonry-brick');

                        }
                    });
                    /*
                        cursor: 'move',
                        start: function(event, ui) {
                            ui.item.addClass('grabbing moving').removeClass('masonry-brick');
                            ui.placeholder.addClass('starting')
                                .removeClass('moving')
                                .css({
                                    top: ui.originalPosition.top,
                                    left: ui.originalPosition.left,
                                    backgroundColor: 'yellow'
                                });

                            masonry.isotope('reloadItems');  

                        },
                        change: function(event, ui) {
                            ui.placeholder.removeClass('starting');
                            masonry
                                .isotope('reloadItems')
                                .isotope({ sortBy: 'original-order'});
    

                        },
                        beforeStop: function(event, ui) {
                            //in this event, you still have access to the placeholder. this means
                            //you know exactly where in the DOM you're going to place your element.
                            //place it right next to the placeholder. jQuery UI Sortable removes the
                            //placeholder for you after this event, and actually if you try to remove
                            //it in this step it will throw an error.
                            //ui.placeholder.after(ui.item);                    
                        },
                        stop: function(event, ui) {

                            console.log(ui);
    
                            ui.item.removeClass('grabbing').addClass('masonry-brick');
    
        
                            masonry.isotope('reloadItems')
                                .isotope({ sortBy: 'original-order' }, function(){
        
                                    if (!ui.item.is('.grabbing')) {
                                        ui.item.removeClass('moving');                        
                                    }
                                });
                        }
                    });
*/
                    console.log('sortable');
                }
            }

            $scope.$watchCollection('data.board.notes', function (newValue, oldValue) {

                if (newValue && newValue.length > 0) {

                    

                    $timeout(function () {

                        isotope();

                        $timeout(function () {

                            isotope();
                        }, 1000);


                    }, 100);
                }

            });

            var onlyOnce = true;

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

                }
                if (onlyOnce && found === false) {

                    onlyOnce = false;

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
            });



            $scope.func.changeOrder = function(note, type, event) {

                //alert('www');

                if (event) {
                    event.stopPropagation();
                }

                var i, noteIndex;

                //console.log(note);

                for (i = 0; i < $scope.data.board.notes.length; i++) {
                    
                    if ($scope.data.board.notes[i] === note) {
                        //console.log(note);
                        noteIndex = i;
                        break;
                    }
                }

                var note1, note2;

                if (noteIndex !== undefined) {
                    if (type === 'right' && noteIndex < $scope.data.board.notes.length - 1) {

                        var dOrder1 = $scope.data.board.notes[noteIndex].displayOrder,
                            dOrder2 = $scope.data.board.notes[noteIndex + 1].displayOrder;

                        $scope.data.board.notes[noteIndex].displayOrder = dOrder2;
                        $scope.data.board.notes[noteIndex + 1].displayOrder = dOrder1;

                        note1 = $scope.data.board.notes[noteIndex];
                        note2 = $scope.data.board.notes[noteIndex + 1];

                        $scope.data.board.notes.sort(function(a, b) {
                            if (a.displayOrder === b.displayOrder) {
                                return 0;
                            }
                            return a.displayOrder > b.displayOrder ? 1 : -1;
                        });
                    } else if (type === 'left' && noteIndex > 0) {
                        var dOrder1 = $scope.data.board.notes[noteIndex].displayOrder,
                            dOrder2 = $scope.data.board.notes[noteIndex - 1].displayOrder;

                        $scope.data.board.notes[noteIndex].displayOrder = dOrder2;
                        $scope.data.board.notes[noteIndex - 1].displayOrder = dOrder1;

                        note1 = $scope.data.board.notes[noteIndex];
                        note2 = $scope.data.board.notes[noteIndex - 1];

                        $scope.data.board.notes.sort(function(a, b) {
                            if (a.displayOrder === b.displayOrder) {
                                return 0;
                            }
                            return a.displayOrder > b.displayOrder ? 1 : -1;
                        });
                    }
                }

                //console.log(note1, note2);
                if (note1 && note2) {
                    var promises = [];
                    promises.push(Note.update({
                        boardId: note1.boardId,
                        _id: note1._id
                    }, {
                        displayOrder: note1.displayOrder
                    }));
                    promises.push(Note.update({
                        boardId: note2.boardId,
                        _id: note2._id
                    }, {
                        displayOrder: note2.displayOrder
                    }));

                    $q.all(promises).then(function(test) {

                        //console.log(test);

                    });
                    //console.log(pms1, pms2);

/*
                    , function (response) {

                        if (CONSTANT.SUCCESS !== response.status) {
                            alert(response.message);
                        } else {
                            $scope.func.refresh();
                            $scope.func.close();
                        }
                    });*/

                }
               

                //console.log($scope.data.board.notes);
                //console.log($rootScope);
            };

            $scope.func.removeSharedBoard = function (event) {

                //   remove: function (board, event) {

                if (event) {
                    event.stopPropagation();
                }

                UserBoards.remove({
                    userId: $scope.data.myId,
                    boardId: $routeParams.boardId
                }, function (response) {

                    if (CONSTANT.SUCCESS !== response.status) {
                        alert(response.message);
                    } else {
                        //$scope.data.boards = [];
                        //$scope.func.refresh();
                        //$timeout(function() {

                        $timeout(function() {
                            $scope.func.refresh();

                        }, 100);
                        $location.path(CONFIG.URI.MAIN);
                        
                        //}, 500);

                    }
                });
                //  }

            };


            // 사진 바로 올리는 기능을 넣음 (공통으로 뺄지 고려)

            function cbUploadFile(response) {

                //alert('cbUploadFile upload');

                if (response.status === 'success') {

                    $scope.note.createdBy = $scope.data.myId;

                    //if (!$scope.note.attachment) {
                    $scope.note.attachment = [];
                    //}
                    $scope.note.attachment.unshift({
                        path: response.data.path,
                        mimetype: response.data.mimetype,
                        size: response.data.size,
                        width: response.data.width,
                        height: response.data.height,
                        thumbPath: response.data.thumbPath,
                        thumbWidth: response.data.thumbWidth,
                        thumbHeight: response.data.thumbHeight
                    });

                    Note.save({
                        boardId: $routeParams.boardId
                    }, $scope.note, function (response) {

                        if (CONSTANT.SUCCESS !== response.status) {
                            alert(response.message);
                        } else {
                            masonry.isotope('destroy');
                            masonry = null;
                            //setTimeout(function() {
                            //masonry.isotope('destroy');
                            $scope.func.refresh();



                            //}, 100);

                        }
                    });
                }
            }

            $scope.func.uploadFileAndCreate = function ($files) {

                var i;

                //alert('before upload');
                $timeout(function () {



                    for (i = 0; i < $files.length; i++) {



                        $upload.upload({
                            url: '/user/' + $scope.note.myId + '/upload',
                            method: 'POST',
                            file: $files[i]
                        }).success(cbUploadFile);
                    }
                }, 500);
            };
        }
    ]);

    app.controller('neymarCtrl_boardEdit', [
        '$scope', '$routeParams', 'CONSTANT', 'CONFIG', 'Board',

        function ($scope, $routeParams, CONSTANT, CONFIG, Board) {

            $scope.pageClass = 'page-edit';

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            $scope.data.colors = CONFIG.BOARD_COLORS;
            $scope.data.backgroundImages = CONFIG.BOARD_BACKGROUND_IMAGES;

            $scope.$watch('data.myId', function (newValue, oldValue) {

                if (newValue) {
                    $scope.data.createdBy = newValue;
                }
            });

            $scope.$watch('data.boardId', function (newValue, oldValue) {

                if (!$scope.data.backgroundColor) {
                    $scope.data.backgroundColor = $scope.data.colors[parseInt(Math.random() * $scope.data.colors.length, 10)];
                }
                if (!$scope.data.backgroundImage) {
                    $scope.data.backgroundImage = $scope.data.backgroundImages[parseInt(Math.random() * $scope.data.backgroundImages.length, 10)];
                }
            });

            $scope.$watch('data.title', function (newValue, oldValue) {

                $scope.data.titleForHeader = newValue || '메모판 만들기';
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
                        $scope.data.backgroundColor = response.data.backgroundColor;
                        $scope.data.backgroundImage = response.data.backgroundImage;
                        $scope.data.private = response.data.private;
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
                            $scope.data.board = newValue[i];
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
        '$scope', '$routeParams', 'CONSTANT', '$http', '$timeout', '$upload', 'Board', 'Note',

        function ($scope, $routeParams, CONSTANT, $http, $timeout, $upload, Board, Note) {

            $scope.pageClass = 'page-edit';

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};
            $scope.board = {};

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
                        $scope.board.boardId = response.data.boardId;
                        $scope.board.title = response.data.title;
                        $scope.board.note = response.data.note;
                        $scope.board.backgroundColor = response.data.backgroundColor;
                        $scope.board.backgroundImage = response.data.backgroundImage;
                        $scope.board.private = response.data.private;

                        if ($routeParams._id) {

                            Note.get({
                                boardId: $routeParams.boardId,
                                _id: $routeParams._id
                            }, function (response) {

                                if (CONSTANT.SUCCESS !== response.status) {
                                    alert(response.message);
                                } else {
                                    //$scope.data.boardId = response.data.boardId;
                                    $scope.data._id = response.data._id;
                                    $scope.data.title = response.data.title;
                                    $scope.data.note = response.data.note;
                                    $scope.data.url = response.data.url;
                                    $scope.data.attachment = response.data.attachment;
                                }
                            });
                        }
                    }
                });
            }

            function cbUploadFile(response) {

                if (response.status === 'success') {

                    if (!$scope.data.attachment) {
                        $scope.data.attachment = [];
                    }
                    $scope.data.attachment.unshift({
                        path: response.data.path,
                        mimetype: response.data.mimetype,
                        size: response.data.size,
                        width: response.data.width,
                        height: response.data.height,
                        thumbPath: response.data.thumbPath,
                        thumbWidth: response.data.thumbWidth,
                        thumbHeight: response.data.thumbHeight
                    });
                }
            }

            $scope.func.inspectURL = function (event) {

                if (!event || event.keyCode == 13) {

                    $http.get('/link/' + encodeURIComponent($scope.data.url)).success(function (response) {

                        var imgEl;

                        if (response.code === 200) {



                            $scope.data.url = response.result.url;
                            $scope.data.title = unescapeHTML(unescapeHTML(response.result.title));
                            $scope.data.note = unescapeHTML(unescapeHTML(response.result.note));

                            if (response.result.image) {
                                imgEl = document.createElement('IMG');
                                imgEl.onload = function () {

                                    if (!$scope.data.attachment) {
                                        $scope.data.attachment = [];
                                    }
                                    $scope.$apply(function () {

                                        var THUMB_HEIGHT = 150;

                                        var thumbWidth, thumbHeight = THUMB_HEIGHT;

                                        thumbWidth = parseInt(thumbHeight * imgEl.width / imgEl.height, 10);

                                        if (thumbWidth / thumbHeight < 4 / 6) {
                                            thumbWidth = parseInt(4 / 6 * thumbHeight, 10);
                                        } else if (thumbWidth / thumbHeight > 6 / 4) {
                                            thumbWidth = parseInt(6 / 4 * thumbHeight, 10);
                                        }


                                        $scope.data.attachment.unshift({
                                            path: response.result.image,
                                            width: imgEl.width,
                                            height: imgEl.height,
                                            thumbPath: response.result.image,
                                            thumbWidth: thumbWidth,
                                            thumbHeight: thumbHeight
                                        });
                                    });
                                };
                                imgEl.src = response.result.image;
                            }



                        }
                    });
                }
            };

            $scope.func.uploadFile = function ($files) {

                var i;

                $timeout(function () {

                    for (i = 0; i < $files.length; i++) {

                        $upload.upload({
                            url: '/user/' + $scope.data.myId + '/upload',
                            method: 'POST',
                            file: $files[i]
                        }).success(cbUploadFile);
                    }
                }, 500);
            };

            $scope.func.removeFile = function (attached) {

                var newAttachment;

                if ($scope.data.attachment) {
                    newAttachment = [];
                    angular.forEach($scope.data.attachment, function (item) {
                        if (attached !== item) {
                            newAttachment.push(item);
                        }
                    });
                    $scope.data.attachment = newAttachment;
                }
            };

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

    app.filter('reverse', function () {

        return function (items) {

            var newItems = [];
            angular.forEach(items, function (item) {
                newItems.unshift(item);
            });
            return newItems;
        };
    });

    app.filter('timeElapsed', function () {

        return function (time, stdTime) {

            var MIN = 60 * 1000,
                HOUR = MIN * 60,
                DAY = HOUR * 24,
                MONTH = DAY * 30,
                YEAR = DAY * 365;

            time = new Date(time);

            if (!stdTime) {
                stdTime = new Date();
            }

            var date = time.getFullYear() + '.' + (time.getMonth() + 1) + '.' + time.getDate();
            var result, interval = stdTime - time;

            if (interval < 50000) {
                result = '조금 전';
            } else if (parseInt(interval / YEAR, 10) > 0) {
                result = date;
                //result = '약 ' + parseInt(interval / YEAR, 10) + '년전';
            } else if (parseInt(interval / MONTH, 10) > 0) {
                result = date;
                //result = '약 ' + parseInt(interval / MONTH, 10) + '달전';
            } else if (parseInt(interval / DAY, 10) > 0) {
                //result = date;
                result = parseInt(interval / DAY, 10) + '일전';
            } else if (parseInt(interval / HOUR, 10) > 0) {
                result = parseInt(interval / HOUR, 10) + '시간 전';
            } else if (parseInt(interval / MIN, 10) > 0) {
                result = parseInt(interval / MIN, 10) + '분 전';
            } else {
                result = '조금 전';
            }

            return result;
        };

    });

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

            $interval(function () {

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
                                }, function (err) {

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
                },
                qrcode: function (data, event) {

                    var controller = function ($scope, $modalInstance, url) {

                        $scope.url = url + '?' + (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 6);

                        $scope.func = {
                            close: function () {
                                $modalInstance.dismiss();
                            }
                        };
                    };

                    if (event) {
                        event.stopPropagation();
                    }

                    controller.$inject = ['$scope', '$modalInstance', 'url'];

                    return $modal.open({
                        templateUrl: '/templates/modal-qrcode',
                        size: 'sm',
                        resolve: {
                            url: function () {
                                return $location.absUrl();
                            }
                        },
                        controller: controller
                    });
                }
            };

            $rootScope.func = {
                /*move: function (path, animation, event) {



                    if (event) {
                        event.stopPropagation();
                    }

                    $location.path(limeUtil.uri(CONFIG.URI.NOTE_VIEW, {
                        boardId: note.boardId,
                        _id: note._id
                    }));
                },*/
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
                                $location.path(limeUtil.uri(CONFIG.URI.MAIN, {}));
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
                                $rootScope.func.board.move({
                                    boardId: note.boardId
                                });
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

    app.directive('boardPreview', function () {

        var controller = function ($scope, $routeParams, CONSTANT, $element, $timeout) {

            var oScroll;

            $scope.data = $scope.$root.data ? Object.create($scope.$root.data) : {};
            $scope.func = $scope.$root.func ? Object.create($scope.$root.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            $timeout(function () {

                if (!oScroll) {
                    oScroll = new jindo.m.Scroll('preview-' + $scope.board.boardId, {
                        bUseHScroll: true,
                        bUseVScroll: false,
                        bUseCss3d: jindo.m._isUseCss3d(),
                        bUseScrollbar: false,
                        nZIndex: 800
                    });
                }
            });
        };
        controller.$inject = ['$scope', '$routeParams', 'CONSTANT', '$element', '$timeout'];

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/neymar-board-preview',
            scope: {
                board: '='
            },
            controller: controller
        };
    });

    app.directive('notePreview', function () {

        var controller = function ($scope, $routeParams, CONSTANT, $element, $timeout) {

            $scope.data = $scope.$parent.data ? Object.create($scope.$parent.data) : {};
            $scope.func = $scope.$parent.func ? Object.create($scope.$parent.func) : {};
            $scope.modal = $scope.$root.modal ? Object.create($scope.$root.modal) : {};

            //console.log($scope.data);





        };
        controller.$inject = ['$scope', '$routeParams', 'CONSTANT', '$element', '$timeout'];

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/neymar-note-preview',
            scope: {
                note: '='
            },
            controller: controller
        };
    });

    /*app.directive('masonry', function () {
        var NGREPEAT_SOURCE_RE = '<!-- ngRepeat: ((.*) in ((.*?)( track by (.*))?)) -->';
        return {
            compile: function (element, attrs) {
                // auto add animation to brick element
                var animation = attrs.ngAnimate || "'masonry'";
                var $brick = element.children();
                $brick.attr('ng-animate', animation);

                // generate item selector (exclude leaving items)
                var type = $brick.prop('tagName');
                var itemSelector = type + ":not([class$='-leave-active'])";

                ////console.log(itemSelector);

                return function (scope, element, attrs) {
                    var options = angular.extend({
                        itemSelector: itemSelector
                    }, scope.$eval(attrs.masonry));

                    // try to infer model from ngRepeat
                    if (!options.model) {
                        var ngRepeatMatch = element.html().match(NGREPEAT_SOURCE_RE);
                        if (ngRepeatMatch) {
                            options.model = ngRepeatMatch[4];
                        }
                    }

                    // initial animation
                    element.addClass('masonry');

                    console.log(element.size());
                    console.log(element.find('> *').size());

                    var timer;

                    $(window).off('resize.masonry').on('resize.masonry', function () {

                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            element.masonry("reload");
                        });

                    });

                    //setTimeout(function () {
                        //element.masonry("reload");
                    //}, 500);

                    

                    // Wait inside directives to render
                    setTimeout(function () {
                        element.masonry(options);

                        ////console.log('masonry');

                        element.on("$destroy", function () {
                            element.masonry('destroy');
                        });

                        if (options.model) {
                            scope.$apply(function () {
                                scope.$watchCollection(options.model, function (_new, _old) {
                                    if (_new == _old) return;

                                    // Wait inside directives to render
                                    setTimeout(function () {
                                        element.masonry("reload");
                                    });
                                    setTimeout(function () {
                                        element.masonry("reload");
                                    }, 100);
                                    setTimeout(function () {
                                        element.masonry("reload");
                                    }, 200);
                                });
                            });
                        }
                    });
                };
            }
        };
    });*/


    angular.element(document).ready(function () {

        angular.bootstrap(document, ['neymar']);
    });

}());