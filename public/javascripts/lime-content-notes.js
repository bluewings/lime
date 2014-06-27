(function () {

    'use strict';

    var $ = jQuery;

    var app = angular.module('lime.content.notes', [
        'ngSanitize',
        'ui.bootstrap',
        'lime.modal'
    ]);

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
                    toggleHeader: function () {

                        $scope.status.headerOpen = $scope.status.headerOpen ? false : true;
                    },
                    toggleSelectMode: function () {

                        $scope.status.selectable = $scope.status.selectable ? false : true
                    }
                };
            }
        };
    });
    app.filter('autoLink', function () {

        return function (text) {
            if (typeof text === 'string') {

                // 전화번호 패턴 변경

                text = text.replace(/([0-9]{2,4})\-([0-9]{3,4})-([0-9]{4})/g,


                    //'<a onclick="location.href=\'tel:$1$2$3\';return false;"><span class="glyphicon glyphicon-earphone"></span> $1-$2-$3</a>');
                    '<a onclick="alert(\'111\');"><span class="glyphicon glyphicon-earphone"></span> $1-$2-$3</a>');

            }



            return text;

        };

    });
    app.directive('limeNote', function ($http) {

        return {
            restrict: 'AE',
            replace: false,
            templateUrl: '/templates/note',
            controller: function ($scope, $attrs, $timeout, limeModal) {

                console.log('>>>>');
                console.log($scope);

                $scope.modal = $scope.$parent.modal ? Object.create($scope.$parent.modal) : {};

                /*
                $scope.modal.note = {
                    note: function (note) {

                        limeModal.note(note).result.then(function () {
                            $scope.func.refresh();
                        });
                    }
                };
                
  */



                return;

                /*$scope.$watch('note.title + note.note', function (newValue, oldValue) {

                    if (oldValue && oldValue !== newValue) {
                        $scope.note.updated = (new Date()).toISOString();
                    }
                });*/

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

                    angular.forEach($scope.$parent.shares, function (item) {

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

                $scope.selected = function (note) {

                    if (note) {
                        return $rootScope.note.selected(note) ? true : false;
                    }
                    return false;


                };

                //console.log($scope);

            }
        };

    });

    //app.controller('lime.content.notes', function ($scope) {

    app.controller('lime.content.notes', function ($scope, $rootScope, $routeParams, $http, $filter, $timeout, $modal, limeAuth, CONSTANT, User, UserShared, limeModal, $q) {

        //console.log('>>> init lime.content.notes');

        $scope.env = {};

        limeAuth.getUserId().then(function (userId) {

            if ($routeParams && $routeParams.shareId) {


                UserShared.save({
                    userId: userId,
                    shareId: $routeParams.shareId
                }, {}, function (err, data) {

                    //alert('111');
                    $scope.func.refresh($routeParams.shareId).then(function () {



                    });
                    //alert('222');

                });



                //console.log($routeParams);        



            } else {
                //$scope.func.refresh();
            }
        });

        $scope.env.noteWidth = 0;

        $(window).on('resize orientationchange', function (event) {

            //console.log(document.documentElement.clientWidth);

            //document.documentElement.clientWidth;

            var availWidth = document.documentElement.clientWidth - 20;

            if (availWidth <= 300) {
                var eWidth = parseInt(availWidth / 1, 10);
            } else if (availWidth <= 400) {
                var eWidth = parseInt(availWidth / 2, 10);
            } else {
                var eWidth = parseInt(availWidth / 3, 10);
            }


            //console.log(availWidth / 3);


            $timeout(function () {



                $scope.env.noteWidth = eWidth - 10;

                $('style.shim').remove();

                var style = $('<style class="shim">.note-list .note {width:' + eWidth + 'px;}</style>');

                $(document.body).append(style);

            });



        }).trigger('resize');



        $scope.conf = {
            userId: null
        };

        $scope.data = {
            user: null,
            shared: null,
            selected: null,
            noteSelected: {}
        };
        //$scope.selected = {};



        $scope.$root.modal = {
            view: function(note) {



                limeModal.view(note).result.then(function () {
                    $scope.func.refresh();
                });
            },
            note: function (note) {

                if (!note) {
                    note = {};
                    if ($scope.data.selected.userId) {
                        note.userId = $scope.data.selected.userId;
                    } else if ($scope.data.selected.shareId) {
                        note.shareId = $scope.data.selected.shareId;
                    }
                    console.log('>>>>>>>>');
                    console.log(note);
                }

                limeModal.note(note).result.then(function () {
                    $scope.func.refresh();
                });
            },
            share: function () {

                var key, notes = [];

                for (key in $scope.data.noteSelected) {
                    if ($scope.data.noteSelected.hasOwnProperty(key)) {
                        notes.push($scope.data.noteSelected[key]);
                    }
                }

                limeModal.share(notes).result.then(function () {
                    $scope.func.refresh();
                    //$scope.func.refresh();
                });

            },
            json: function (jsonData, event) {

                limeModal.json(jsonData);
                if (event) {
                    event.stopPropagation();
                }
            }
        };
        /*$timeout(function() {

            //$scope.modal.note();
        }, 500);*/

        limeAuth.getUserId().then(function (userId) {

            $scope.conf.userId = userId;

            $scope.func.refresh();
        });


        $scope.$on('toggleheader', function (status, data) {


            //$scope.data.selected = data.selected;

            
            $scope.data.noteSelected = {};
        });

        $scope.$on('waawaa', function (status, data) {


            //$scope.data.selected = data.selected;
            //console.log(data);
            $scope.data.noteSelected = {};

            $scope.$apply(function () {
                $scope.data.selected = data.selected;

            });


            //console.log(data);

        });

        $scope.func = {
            selected: function (note) {

                if (note) {
                    return $scope.data.noteSelected[note._id] ? true : false;
                }
                return false;


            },
            toggleNote: function (note) {

                if (!$scope.data.noteSelected) {
                    $scope.data.noteSelected = {};
                }
                if ($scope.data.noteSelected[note._id]) {
                    delete $scope.data.noteSelected[note._id];
                } else {
                    $scope.data.noteSelected[note._id] = note;
                }

                //alert(note);

                //$rootScope.note.toggle(note);
                //console.log(note);
            },
            refresh: function (shareId) {

                var promises = [],
                    deferred = $q.defer();

                promises.push(User.get({

                    userId: $scope.conf.userId

                }).$promise);


                $q.all(promises).then(function (responses) {

                    var userResponse, shareResponse, selected, inx;

                    userResponse = responses[0];
                    shareResponse = responses[1];


                    /*if (response.status === CONSTANT.SUCCESS) {

                    $scope.data.user = response.data[0];
                    $scope.data.shared = $scope.data.user.shared;
                    $scope.data.selected = $scope.data.user;
                    //$scope.selected = response.data[0];
                    //$scope.selected = $scope.data;
                    //console.log('>>>>> aaaa');
                    //console.log(response.data[0]);
                } */

                    if (userResponse.status === CONSTANT.SUCCESS) {

                        $scope.data.user = userResponse.data;
                        $scope.data.shared = $scope.data.user.shared;

                        // 공유받은 건 선택이라면?
                        if (shareId) {
                            for (inx = 0; inx < $scope.data.shared.length; inx++) {
                                if (shareId === $scope.data.shared[inx].shareId) {
                                    selected = $scope.data.shared[inx];
                                    break;
                                }
                            }
                        } else if ($scope.data.selected) {
                            if ($scope.data.selected.userId && $scope.data.selected.userId === $scope.data.user.userId) {
                                selected = $scope.data.user;
                            } else if ($scope.data.selected.shareId) {
                                for (inx = 0; inx < $scope.data.shared.length; inx++) {
                                    if ($scope.data.selected.shareId === $scope.data.shared[inx].shareId) {
                                        selected = $scope.data.shared[inx];
                                        break;
                                    }
                                }
                            }
                        }

                        $scope.data.selected = selected || $scope.data.user;

                        //console.log(responses[0]);

                        //console.log($scope.data.user);

                        $scope.$root.$broadcast('www', {


                            data: {
                                user: userResponse.data,
                                shared: userResponse.data.shared
                            }
                        });
                            


                        if (firstTime) {
                            $timeout(function () {
                                $(window).scrollTop(CONFIG.STYLE.COVER_HEIGHT - CONFIG.STYLE.NAV_BAR_HEIGHT);
                            });
                            firstTime = false;
                        }

                    }

                    deferred.resolve({});

                });
                return deferred.promise;
            }
        };

        var firstTime = true;

        $timeout(function () {
            $(window).scrollTop(CONFIG.STYLE.COVER_HEIGHT - CONFIG.STYLE.NAV_BAR_HEIGHT);
        });

        return;



        //console.log($scope.data.notes);
        //console.log($scope);
        console.log($scope);

        $scope.func = {

            add: function () {
                $rootScope.note.add({
                    title: 'wow',
                    note: 'aaa'
                });
            },
            toggleNote: function (note) {

                $rootScope.note.toggle(note);
                //console.log(note);
            }
        };


        $timeout(function () {
            $(window).scrollTop(CONFIG.STYLE.COVER_HEIGHT - CONFIG.STYLE.NAV_BAR_HEIGHT);
        }, 100);
    });

})();