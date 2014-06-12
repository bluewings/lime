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
                note: function (note) {

                    var modalInstance;
                    
                    
                    
              

           

                    modalInstance = $modal.open({
                        templateUrl: '/templates/modal-note',
                        size: 'sm',
                        //scope: $scope,

                        controller: 'lime.modal.note',
                        resolve: {
                            note: function () {
                                
                                if (note) {
                                    //note = angular.copy(note);
                                    return note = angular.copy(note);
                                }                                
                            return;
                              
                            }
                          }                        
                    });

                    modalInstance.result.then(function (result) {

                        $rootScope.note.add(result.data);
                    });



                    return modalInstance;
                }
            };
        }
    ]);

    app.controller('lime.modal.note', function ($scope, $modalInstance, $http, note) {

        
        $scope.note = note || {};

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

})();