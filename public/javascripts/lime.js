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
    
    var $ = jQuery;

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
    
    CONFIG = {
        ARCHIVE_MY_ID_KEY: 'lime-my-id',
        ARCHIVE_NOTES_KEY: 'lime-notes',
        SYNC_INTERVAL: 3000,
        STYLE: {
            COVER_HEIGHT: 220,
            NAV_BAR_HEIGHT: 47
            
        }
    };

//    $nav-bar-height: 47px;
//$cover-height: 220px;
    
    var style = document.createElement('style');
    style.innerText = '.content {min-height:' + ($(window).height() -CONFIG.STYLE.NAV_BAR_HEIGHT) + 'px !important}';
    
    document.body.appendChild(style);

    
    
    //alert(document.documentElement.clientHeight);
    //alert($(window).height());



    /*var CONFIG = {};

    CONFIG.ARCHIVE_NOTES_KEY = 'keep-notes';

    function unescapeHTML(str) {
        return str.replace(/\&lt;/g, '<')
            .replace(/\&gt;/g, '>')
            .replace(/\&quot;/g, '"')
            .replace(/\&#039;/g, "'")
            .replace(/\&amp;/g, '&');
    };*/

    app.config(function ($routeProvider, $locationProvider, $compileProvider) {

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
            .when('/share/:shareId', {
                templateUrl: '/templates/content-notes',
                controller: 'lime.content.notes'
            })
            .otherwise({
                redirectTo: '/home'
            });

        //$compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|file):/);
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);

    });

    app.run(function ($rootScope, $location, $http, $interval, $timeout, limeModal, globalStorage) {

        var urlPath = $location.path(),
            urlSearch = $location.search(),
            matches;

    

        $rootScope.status = {
            myId: null,
            headerOpen: false,
            selectMode: false,
            hasChanges: false,
            syncFromRemote: false,
            notesHashCode: '',
            filterTag: ''
        };

        
        // sync 되는 대상
        $rootScope.data = {
            notes: []
        };

        $rootScope.info = {
            tagMap: {}
        };

        $rootScope.tags = [];



        $rootScope.func = {
            intentURL: function() {

                //http%3A%2F%2F182.162.196.40%2Fhome

                return 'Intent://addshortcut?url=' + encodeURIComponent('http://10.64.51.102:4321/home/' + $rootScope.status.myId) + '&icon=http://icdn.pro/images/en/b/o/bookmark-icone-7792-128.png&title=%ED%80%B5%EB%85%B8%ED%8A%B8&serviceCode=weather&version=7#Intent;scheme=naversearchapp;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.search;end';
            },
            shareSelected: function () {
                alert('share selected');
            },
            removeSelected: function () {
                alert('remove selected');
            },
            rootTest: function () {
                alert('roottest');
            }
        };



        $rootScope.modal = {
            share: function () {

                limeModal.share();
            },
            addNote: function () {

                this.note();

            },
            note: function (note) {

                limeModal.note(note);
            }
        };

        $rootScope.note = {

            getSelected: function () {

                var notes = [];

                if ($rootScope.selected) {

                    angular.forEach($rootScope.data.notes, function (item) {

                        if ($rootScope.selected[item._id]) {
                            item = angular.copy(item);
                            delete item.$$hashKey;
                            notes.push(item);
                        }
                        //notesMap[item._id] = item;
                    });

                };
                return notes;



            },

            selected: function (note) {

                return !$rootScope.selected || !$rootScope.selected[note._id] ? false : true;

            },


            toggle: function (note) {

                if ($rootScope.status.selectMode === false) {

                    return;

                }

                if (!$rootScope.selected) {
                    $rootScope.selected = {};
                }

                if ($rootScope.selected[note._id]) {
                    delete $rootScope.selected[note._id];
                } else {
                    $rootScope.selected[note._id] = true;
                }



            },

            merge: function (notes, tag) {

                var notesMap = {},
                    newNotes = [],
                    key;

                function equals(item1, item2) {

                    item1 = angular.copy(item1);
                    item2 = angular.copy(item2);
                    delete item1.$$hasyKey;
                    delete item2.$$hasyKey;

                    return JSON.stringify(item1) == JSON.stringify(item2) ? true : false;
                }

                angular.forEach($rootScope.data.notes, function (item) {
                    notesMap[item._id] = item;
                });

                angular.forEach(notes, function (item) {

                    if (tag) {
                        if (!item.tags) {
                            item.tags = {};
                        }
                        item.tags[tag] = true;
                    }

                    // 완전 신규건...
                    if (!notesMap[item._id]) {

                        console.log('new');

                        notesMap[item._id] = item;
                        //console.log('added');
                        ////newNotes.push(item);
                        //$rootScope.data.notes.push(item);

                    // 내용이 바뀐거...
                    } else if (!equals(item, notesMap[item._id])) {

                        console.log('changed');

                        notesMap[item._id] = item;

                    } else {

                        console.log('skip');
                    }
                });

                for (key in notesMap) {
                    if (notesMap.hasOwnProperty(key)) {
                        newNotes.push(notesMap[key]);
                    }
                }

                $rootScope.data.notes = newNotes;

                //console.log(notesMap);



                //$rootScope.data.notes = notes;

                console.log(notes);

            },
            modify: function(id, data) {
                
                angular.forEach($rootScope.data.notes, function(item) {
                    
                    if (id === item._id) {
                        item.title = data.title;
                        item.note = data.note;
                        item.updated = (new Date()).toISOString();
                        

                        if (data.image) {
                            item.image = data.image;
                        } else {
                            delete item.image;
                        }
                        if (data.url) {
                            item.url = data.url;
                        } else {
                            delete item.url;
                        }
                    
                    
                    }
                });
                
                
                
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
                    if (data.image) {
                        obj.image = data.image;
                    }
                    if (data.url) {
                        obj.url = data.url;
                    }
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



        $rootScope.$watchCollection('data.notes', function (newValue, oldValue) {

            var key, selectedCount = 0;

            var tags = [''], _tags = [''], tagMap = {};

            if (newValue) {

                angular.forEach(newValue, function(item) {

                    if (item.tags) {
                        for (key in item.tags) {
                            if (item.tags.hasOwnProperty(key)) {
                                if (!tagMap[key]) {
                                    tagMap[key] = {
                                        tag: key,
                                        count: 0,
                                        notes: []
                                    };
                                }
                                tagMap[key].count++;
                                tagMap[key].notes.push(item);
                            }

                        }
                    }
                });

                for (key in tagMap) {
                    if (tagMap.hasOwnProperty(key)) {
                        _tags.push(key);
                        tags.push(tagMap[key]);
                    }
                }


           

                $rootScope.tags = _tags;


                $rootScope.info.tagMap = tagMap;
                $rootScope.info.tags = tags;

            }
            //$rootScope.status.selectedCount = selectedCount;
        });

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


            // 공유받은 항목여부 판별
            matches = urlPath.match(/\/share\/(.*)$/);
            if (matches && matches.length === 2) {

                $rootScope.status.filterTag = matches[1];

                $http.get('/share/notes/' + matches[1]).success(function (data) {

                    if (data.code === 200) {



                        

                        bootstrap(function() {
                            $rootScope.note.merge(data.result.notes, matches[1]);
                        });



                        //alert(matches[1]);

                    }

                    

                });

            } else {
                bootstrap();
            }

        });



        function bootstrap(callback) {


            // 아이디를 알았으면 서버에서 싱크한번 해오자

            $http.get('/sync/notes/' + $rootScope.status.myId).success(function (data) {

                if (data.code === 200 && data.result.notes) {

                    $rootScope.note.merge(data.result.notes);

                    $timeout(function () {
                        $rootScope.status.syncFromRemote = true;
                        $rootScope.status.hasChanges = false;
                        if (callback) {
                            callback();    
                        }
                        
                    });

                    //}, 5000);

                } else {
                    $rootScope.status.syncFromRemote = true;
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

                $http.get('/sync/notes/' + $rootScope.status.myId).success(function (data) {

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
                            //alert('저장된듯?');
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



        }
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


    app.filter('reverse', function () {

        return function (items) {

            var newItems = [];
            angular.forEach(items, function (item) {
                newItems.unshift(item);
            });
            return newItems;
        };
    });

    app.filter('filterByTag', function () {

        return function (items, tag) {

            var newItems = [];

            if (!tag) {

                return items;

            }

            angular.forEach(items, function (item) {

                if (item && item.tags && item.tags[tag]) {
                    newItems.push(item);
                }
            });

            return newItems;

        };    
    });

    app.filter('filterByImage', function () {

        return function (items) {

            var newItems = [];

            angular.forEach(items, function (item) {

                if (item && item.image) {
                    newItems.push(item);
                }
            });

            return newItems;

        };    
    });    

    app.filter('filterByType', function () {

        return function (items, type) {

            var newItems = [];

            type = type || 'inbox';



            angular.forEach(items, function (item) {

                if (type === 'archived' && item.archived === 1) {
                    newItems.push(item);
                } else if (type === 'inbox' && item.archived === 0) {
                    newItems.push(item);
                } else if (type === 'bookmark' && item.archived === 0 && item.url) {
                    newItems.push(item);
                } else if (type === 'image' && item.archived === 0 && item.image) {
                    newItems.push(item);
                }

            });

            return newItems;

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

})();