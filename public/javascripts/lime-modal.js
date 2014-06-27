(function () {

    'use strict';

    var $ = jQuery;

    function unescapeHTML(str) {

        return str.replace(/\&lt;/g, '<')
            .replace(/\&gt;/g, '>')
            .replace(/\&quot;/g, '"')
            .replace(/\&#039;/g, "'")
            .replace(/\&amp;/g, '&');
    };

    var app = angular.module('lime.modal', [
        'ui.bootstrap',
        'angularFileUpload',
        'lime.resource'
    ]);

    app.service('limeModal', ['$modal', '$rootScope',
        function ($modal, $rootScope) {

            return {
                share: function (notes) {

                    var $modalInstance;

                    $modalInstance = $modal.open({
                        templateUrl: '/templates/modal-share',
                        size: 'sm',
                        resolve: {
                            notes: function () {
                                return angular.copy(notes || []);
                            }
                        },
                        controller: 'lime.modal.share'
                    });



                    return $modalInstance;
                },
                view: function (note) {

                    var $modalInstance;

                    $modalInstance = $modal.open({
                        templateUrl: '/templates/modal-view',
                        size: 'sm',
                        resolve: {
                            data: function () {
                                
                                return angular.copy(note || {});

                                /*return $.extend({
                                    userId: user.userId
                                }, note || {});*/
                            }
                        },
                        controller: 'lime.modal.view'
                    });
                    return $modalInstance;
                },
                note: function (note) {

                    var $modalInstance;

                    $modalInstance = $modal.open({
                        templateUrl: '/templates/modal-note',
                        size: 'sm',
                        resolve: {
                            data: function () {
                                
                                return angular.copy(note || {});

                                /*return $.extend({
                                    userId: user.userId
                                }, note || {});*/
                            }
                        },
                        controller: 'lime.modal.note'
                    });
                    return $modalInstance;
                },
                json: function (jsonData) {

                    return $modal.open({
                        templateUrl: '/templates/modal-json',
                        size: 'sm',
                        controller: function ($scope, $modalInstance) {

                            $scope.json = jsonData;

                            $scope.func = {
                                close: function () {
                                    $modalInstance.dismiss();
                                }
                            };
                        }
                    });
                }
            };
        }
    ]);

    app.controller('lime.modal.note', function ($scope, $modalInstance, $upload, data, UserNote, ShareNote, $q, $http) {

        $scope.data = data;
        //$scope.data.url = 'http://sports.news.naver.com/brazil2014/news/read.nhn?oid=452&aid=0000000103';

        //console.log($scope.data);

        $scope.func = {
            create: function () {



                if ($scope.data.userId) {



                    UserNote.save({
                        userId: $scope.data.userId
                    }, $scope.data, function (data) {
                        $modalInstance.close();
                    });
                } else if ($scope.data.shareId) {
                    
                    ShareNote.save({
                        shareId: $scope.data.shareId
                    }, $scope.data, function (data) {
                        $modalInstance.close();
                    });
                }
            },
            modify: function () {

                if ($scope.data.userId) {
                    UserNote.update({
                        userId: $scope.data.userId,
                        _id: $scope.data._id
                    }, $scope.data, function (data) {
                        $modalInstance.close();
                    });
                } else if ($scope.data.shareId) {

                    ShareNote.update({
                        shareId: $scope.data.shareId,
                        _id: $scope.data._id
                    }, $scope.data, function (data) {
                        $modalInstance.close();
                    });
                }
            },
            remove: function() {

                if ($scope.data.userId) {
                    UserNote.remove({
                        userId: $scope.data.userId,
                        _id: $scope.data._id
                    }, $scope.data, function (data) {
                        $modalInstance.close();
                    });
                } else if ($scope.data.shareId) {

                    ShareNote.remove({
                        shareId: $scope.data.shareId,
                        _id: $scope.data._id
                    }, $scope.data, function (data) {
                        $modalInstance.close();
                    });
                }
            },
            uploadFile: function ($files) {

                var inx;

                for (inx = 0; inx < $files.length; inx++) {

                    $upload.upload({
                        url: '/user/' + $scope.data.userId + '/upload',
                        method: 'POST',
                        file: $files[inx]
                    }).success(function (result) {
                        if (result.status === 'success') {

                            if (!$scope.data.attachment) {
                                $scope.data.attachment = [];
                            }
                            $scope.data.attachment.unshift({
                                path: result.data.path,
                                mimetype: result.data.mimetype,
                                size: result.data.size,
                                width: result.data.width,
                                height: result.data.height
                            });
                        }
                    });
                }
            },
            removeFile: function (attached) {

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
            },

            update: function () {

                $modalInstance.close({
                    method: 'update',
                    data: $scope.note
                });
            },
            cancel: function () {

                $modalInstance.dismiss('cancel');
            },
            inspectURL: function (event) {

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


                                        $scope.data.attachment.unshift({
                                            path: response.result.image,
                                            width: imgEl.width,
                                            height: imgEl.height

                                        });
                                    });
                                };
                                imgEl.src = response.result.image;
                            }



                        }
                    });
                }
            }
        };
    });

    app.controller('lime.modal.view', function ($scope, $modalInstance, $timeout, data, UserNote, ShareNote, $q, $http) {

        $scope.data = data;

        $scope.func = {

            edit: function () {
                $modalInstance.close();

                $timeout(function() {

                    $scope.$root.modal.note(data);

                });
            }
        };
    });

    app.controller('lime.modal.share', function ($scope, $rootScope, $modalInstance, $http, $filter, notes, Share, limeAuth) {





        limeAuth.getUserId().then(function (userId) {

            //$scope.conf.userId = userId;
            //$scope.func.refresh();

            $scope.data = {
                title: $filter('date')(new Date(), 'yyyy.MM.dd HH:mm:ss'),
                notes: notes,
                createdBy: userId

            };

            $http.get('/background').success(function(response) {

                $scope.data.backgrounds = response.data;

                $scope.data.backgroundImage = $scope.data.backgrounds[0];


                ////console.log(response);



            });            
        });



        //console.log($scope.data);



        $scope.func = {
            share: function () {

      

                   
                    Share.save($scope.data, function (response) {
                        
                        
                        $modalInstance.close();
                        
                        $scope.$root.$broadcast('sharepagecreate', {

                            shareId: response.data.shareId

                        });
                    });                



                return;

                //var notes;

                var notes = $rootScope.note.getSelected();

                //console.log(notes);

                $http.post('/share/notes', {
                    owner: $rootScope.status.myId,
                    title: 'oaoaoa',
                    notes: notes
                }).success(function (data) {
                    if (data.code === 200) {
                        $scope.refId = data.result.id;
                        alert('공유된듯?');
                    }
                });



                //alert('공유하자');
                /*
                    $http.post('/share/notes/' + $rootScope.status.myId, {
                        notes: $rootScope.data.notes
                    }).success(function (data) {

                        if (data.code === 200) {
                            alert('저장된듯?');
                        }
                    });            
                    */

                /*$modalInstance.close({
                    method: 'update',
                    data: $scope.note
                });*/
            },
            cancel: function () {

                $modalInstance.dismiss('cancel');
            }
        };
    });

}());