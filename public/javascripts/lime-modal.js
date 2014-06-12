(function () {

    'use strict';

    function unescapeHTML(str) {

        return str.replace(/\&lt;/g, '<')
            .replace(/\&gt;/g, '>')
            .replace(/\&quot;/g, '"')
            .replace(/\&#039;/g, "'")
            .replace(/\&amp;/g, '&');
    };

    var app = angular.module('lime.modal', ['ui.bootstrap']);

    app.service('limeModal', ['$modal', '$rootScope',
        function ($modal, $rootScope) {

            return {
                share: function() {
                    var modalInstance;

                    modalInstance = $modal.open({
                        templateUrl: '/templates/modal-share',
                        size: 'sm',
                        controller: 'lime.modal.share'
                    });

                    modalInstance.result.then(function (result) {

                        //$rootScope.note.add(result.data);
                    });



                    return modalInstance;
                },
                note: function () {

                    var modalInstance;

                    modalInstance = $modal.open({
                        templateUrl: '/templates/modal-note',
                        size: 'sm',
                        controller: 'lime.modal.note'
                    });

                    modalInstance.result.then(function (result) {

                        $rootScope.note.add(result.data);
                    });



                    return modalInstance;
                }
            };
        }
    ]);

    app.controller('lime.modal.note', function ($scope, $modalInstance, $http) {

        $scope.note = {};

        $scope.func = {
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

    app.controller('lime.modal.share', function ($scope, $modalInstance, $http) {

        $scope.note = {};

        $scope.func = {
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

})();