(function () {

    'use strict';

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
                share: function () {
                    var $modalInstance;

                    $modalInstance = $modal.open({
                        templateUrl: '/templates/modal-share',
                        size: 'sm',
                        controller: 'lime.modal.share'
                    });

                    $modalInstance.result.then(function (result) {

                        //$rootScope.note.add(result.data);
                    });



                    return $modalInstance;
                },
                note: function (user, note) {

                    var $modalInstance;

                    $modalInstance = $modal.open({
                        templateUrl: '/templates/modal-note',
                        size: 'sm',
                        resolve: {
                            data: function () {
                                return $.extend({
                                    userId: user.userId
                                }, note || {});
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

    app.controller('lime.modal.note', function ($scope, $modalInstance, $upload, data, UserNote, $q) {

        $scope.data = data;

        $scope.func = {
            create: function () {

                UserNote.save({
                    userId: $scope.data.userId
                }, $scope.data, function (data) {
                    $modalInstance.close();
                });
            },
            modify: function () {

                UserNote.update({
                    userId: $scope.data.userId,
                    _id: $scope.data._id
                }, $scope.data, function (data) {
                    $modalInstance.close();
                });
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
                            $scope.data.attachment.push({
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
            inspectURL: function () {

                $http.get('/link/' + encodeURIComponent($scope.note.url)).success(function (data) {

                    if (data.code === 200) {

                        $scope.note = {
                            url: data.result.url,
                            title: unescapeHTML(unescapeHTML(data.result.title)),
                            note: unescapeHTML(unescapeHTML(data.result.note)),
                            image: data.result.image
                        };
                    }
                });
            }
        };
    });

    app.controller('lime.modal.share', function ($scope, $rootScope, $modalInstance, $http) {

        $scope.note = {};



        $scope.func = {
            share: function () {

                //var notes;

                var notes = $rootScope.note.getSelected();

                console.log(notes);

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