(function () {

    'use strict';

    String.prototype.hashCode = function () {

        var inx, chr, hash = 0;

        if (this.length === 0) {
            return hash;
        }
        for (inx = 0; inx < this.length; inx++) {
            chr = this.charCodeAt(inx);
            hash = ((hash << 5) - hash) + chr;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    function uid() {

        return (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 5);
    }

    var app = angular.module('limeNote', [
        'ngRoute', 'ngSanitize', 'ngAnimate',
        'ui.bootstrap',
        'globalStorage',
        'lime.header',
        'lime.content',
        'lime.modal',
        'lime.resource'
    ]);

    var CONFIG = {};

    CONFIG.ARCHIVE_MY_ID_KEY = 'lime-my-id';
    CONFIG.ARCHIVE_NOTES_KEY = 'lime-notes';
    CONFIG.SYNC_INTERVAL = 3000;



    /*var CONFIG = {};

    CONFIG.ARCHIVE_NOTES_KEY = 'keep-notes';

    function unescapeHTML(str) {
        return str.replace(/\&lt;/g, '<')
            .replace(/\&gt;/g, '>')
            .replace(/\&quot;/g, '"')
            .replace(/\&#039;/g, "'")
            .replace(/\&amp;/g, '&');
    };*/

    app.config(function ($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $routeProvider
            .when('/home', {
                templateUrl: '/templates/content-notes',
                controller: 'lime.content.notes'
            })
            .when('/about', {
                templateUrl: '/templates/about',
                controller: 'lime.content.view'
            })
            .when('/share/:id', {
                templateUrl: '/templates/content-notes',
                controller: 'lime.content.notes'
            })
            .otherwise({
                redirectTo: '/home'
            });
    });

    app.run(function ($rootScope, $location, $http, $interval, $timeout, limeModal, globalStorage) {

        var urlPath = $location.path(),
            urlSearch = $location.search();

        $rootScope.status = {
            myId: null,
            headerOpen: true,
            selectMode: true,
            hasChanges: false,
            syncFromRemote: false,
            notesHashCode: ''
        };

        $rootScope.data = {
            notes: []
        };

            $rootScope.func = {
                shareSelected: function () {
                    alert('share selected');
                },    
                removeSelected: function () {
                    alert('remove selected');
                },                
                rootTest: function() {
                    alert('roottest');
                }
            };


        globalStorage.get(CONFIG.ARCHIVE_MY_ID_KEY).then(function (myId) {

            var matches;

            // 갇제 설정
            

            if (urlSearch && urlSearch.reset) {

       
                matches = urlPath.match(/^\/home\/([0-9a-zA-Z]{5})$/);


                if (matches && matches.length === 2) {
                    myId = matches[1];
                    globalStorage.set(CONFIG.ARCHIVE_MY_ID_KEY, myId);
                }

            }
            // //갇제 설정



            if (typeof myId !== 'string' || myId === '') {

                // 홈화면 바로가기를 타고 들어온 경우는 myId 를 심는다.
                matches = urlPath.match(/^\/home\/([0-9a-zA-Z]{5})$/);

                if (matches && matches.length === 2) {
                    myId = matches[1];
                } else {
                    myId = uid();
                }
                globalStorage.set(CONFIG.ARCHIVE_MY_ID_KEY, myId);
            }

            $rootScope.status.myId = myId;

            // 아이디를 알았으면 서버에서 싱크한번 해오자

            $http.get('/sync/notes/' + myId).success(function (data) {

                if (data.code === 200 && data.result.notes) {

                    //$timeout(function() {





                    $rootScope.note.merge(data.result.notes);

                    $timeout(function () {
                        $rootScope.status.syncFromRemote = true;
                        $rootScope.status.hasChanges = false;

                    });

                    //}, 5000);

                }



                //console.log(data);
            });



            //console.log('get-uid-wow');

            //console.log(data);

            //globalStorage.set(CONFIG.ARCHIVE_USER_ID_KEY, uid());



            /*$timeout(function () {

            $rootScope.modal.addNote();

        }, 500);*/

            $interval(function () {

                $http.get('/sync/notes/' + myId).success(function (data) {

                    if (data.code === 200 && data.result.notes) {



                        $rootScope.note.merge(data.result.notes);
                    }
                });

            }, CONFIG.SYNC_INTERVAL * 5);

            $interval(function () {

                if ($rootScope.status.hasChanges && $rootScope.status.syncFromRemote) {



                    $rootScope.status.hasChanges = false;
                    //return;
                    //notes = [angular.copy(note)];
                    $http.post('/sync/notes/' + $rootScope.status.myId, {
                        notes: $rootScope.data.notes
                    }).success(function (data) {

                        if (data.code === 200) {
                            alert('저장된듯?');
                        }
                    });



                }



            }, CONFIG.SYNC_INTERVAL);



            /*globalStorage.sync($rootScope, 'data', CONFIG.ARCHIVE_NOTES_KEY).then(function () {

                return;
                if (!$scope.data.notes) {

                    $scope.data.notes = [];
                }

                if ($routeParams.id) {
                    $http.get('/share/notes/' + $routeParams.id).success(function (data) {
                        var dict = {};
                        if (data.code === 200) {

                            console.log(angular.copy($scope.data.notes));

                            angular.forEach($scope.data.notes, function (value, key) {

                                dict[value._id] = true;
                            });

                            angular.forEach(data.result.notes, function (value, key) {

                                if (dict[value._id]) {
                                    value._already = true;
                                }
                            });

                            console.log(data.result.notes);
                            console.log(dict);

                            //console.log(data.result.notes[0]);

                            //return;

                            $scope.shares = data.result.notes;

                        }
                    });
                }
            });*/



            $rootScope.modal = {
                share: function() {

                    limeModal.share();
                },
                addNote: function () {

                    this.editNote();

                },
                editNote: function () {

                    limeModal.note();


                    /*$modal

                var modalInstance;

                modalInstance = $modal.open({
                    templateUrl: '/templates/modalDetail',
                    size: 'sm',
                    controller: 'lime.modal.editNote'

                    function ($scope, $modalInstance, $http) {

                        $scope.func = {
                        }
                    }
                });
                modalInstance.result.then(function (info) {
                });*/
                }
            };

            $rootScope.note = {

                selected: function(note) {

                    return !$rootScope.selected || !$rootScope.selected[note._id] ? false : true;

                }, 


                toggle: function(note) {

                    if ($rootScope.status.selectMode === false) {

                        return;

                    }

                    if (!$rootScope.selected) {
                        $rootScope.selected = {};
                    }

                    if($rootScope.selected[note._id]) {
                        delete $rootScope.selected[note._id];
                    } else {
                        $rootScope.selected[note._id] = true;
                    }





                },

                merge: function (notes) {

                    var notesMap = {};

                    angular.forEach($rootScope.data.notes, function (item) {
                        notesMap[item._id] = item;
                    });

                    angular.forEach(notes, function (item) {
                        if (!notesMap[item._id]) {
                            console.log('added');
                            $rootScope.data.notes.push(item);

                        } else {
                            console.log('skip');
                        }
                    });

                    console.log(notesMap);



                    //$rootScope.data.notes = notes;

                    console.log(notes);

                },

                add: function (data) {

                    var obj;

                    if (data.title || data.note) {
                        obj = {
                            _id: uid(),
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

            $rootScope.$watch('status.headerOpen', function (newValue, oldValue) {

                if (newValue === false) {
                    $rootScope.status.selectMode = false;
                }
            });

            $rootScope.$watch('status.selectMode', function (newValue, oldValue) {

                if (newValue === false) {
                    $rootScope.selected = {};
                }
            });




            $rootScope.$watchCollection('selected', function (newValue, oldValue) {

                var key, selectedCount = 0;

                if (newValue) {

                    for (key in newValue) {

                        if (newValue.hasOwnProperty(key)) {
                            selectedCount++;
                        }

                    }

                } 
                    $rootScope.status.selectedCount = selectedCount;                    
                


            });
//$rootScope.selected
            

            $rootScope.$watchCollection('data.notes', function (newValue, oldValue) {

                var hashCode;

                if (newValue) {



                    hashCode = JSON.stringify(newValue).hashCode();

                    if ($rootScope.status.notesHashCode !== hashCode) {

                        $rootScope.status.hasChanges = true;
                        $rootScope.status.notesHashCode = hashCode;

                    }
                }


                //$rootScope.notesHashCode = JSON.st

                //angular.forEach(newValue, function(item) {


                //});
            });

            //return;

            globalStorage.sync($rootScope, 'data', CONFIG.ARCHIVE_NOTES_KEY).then(function () {
                console.log($rootScope.data);
                // 최초로 sync 하는 경우 notes 구조가 없으니 만들어줘야함.
                if (!$rootScope.data.notes) {

                    $rootScope.data.notes = [];
                }
            });

        });
    });



    app.directive('masonry', function () {
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

                //console.log(itemSelector);

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

                    // Wait inside directives to render
                    setTimeout(function () {
                        element.masonry(options);

                        //console.log('masonry');

                        element.on("$destroy", function () {
                            element.masonry('destroy')
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
    });



})();