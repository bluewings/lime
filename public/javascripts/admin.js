/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var $ = jQuery;

    var app = angular.module('limeAdmin', [
        //'ngSanitize', 
        //'ngResource', 
        'ui.bootstrap',
        'lime.content.notes',
        'lime.resource',
        'lime.modal'
    ]);

    //app.controller('main', function() {
    app.controller('main', function ($scope, $modal, User, UserNote, Share, $q, limeModal) {

        $scope.data = {
            users: [],
            shares: [],
            selected: null
        };

        console.log(limeModal);

        $scope.modal = {
            note: function (user, note) {

                limeModal.note(user, note).result.then(function () {
                    $scope.func.refresh();
                });
            },
            json: function(jsonData, event) {

                limeModal.json(jsonData);
                if (event) {
                    event.stopPropagation();    
                }
            }
        };

        $scope.func = {
            select: function (userOrShare) {

                $scope.data.selected = userOrShare;
            },
            createUser: function () {

                User.save({}, {}, function (data) {
                    $scope.func.refresh();
                });
            },
            removeUser: function (user, event) {

                User.remove({
                    userId: user.userId
                }, function (data) {
                    $scope.func.refresh();
                });
                if (event) {
                    event.stopPropagation();    
                }
            },
            removeUserNote: function (user, note) {

                UserNote.remove({
                    userId: user.userId,
                    _id: note._id
                }, function (data) {
                    $scope.func.refresh();
                });
            },
            refresh: function () {

                var promises = [];

                promises.push(User.get({}).$promise);

                //promises.push(Share.get({}).$promise);



                $q.all(promises).then(function (values) {

                    var userResult, shareResult, selected, inx;

                    userResult = values[0];
                    shareResult = values[1];

                    if (true) {

                        $scope.data.users = userResult.data;
                        if ($scope.data.selected && $scope.data.selected.userId) {
                            for (inx = 0; inx < $scope.data.users.length; inx++) {
                                if ($scope.data.selected.userId === $scope.data.users[inx].userId) {
                                    selected = $scope.data.users[inx];
                                    break;
                                }
                            }
                        } else if ($scope.data.selected && $scope.data.selected.shareId) {
                            for (inx = 0; inx < $scope.data.shares.length; inx++) {
                                if ($scope.data.selected.userId === $scope.data.shares[inx].userId) {
                                    selected = $scope.data.shares[inx];
                                    break;
                                }
                            }
                        }

                        $scope.data.selected = selected || null;

                        //console.log(values[0]);

                        //console.log($scope.data.users);



                    }

                });

            }

        };

        $scope.func.refresh();

        //console.log(User);



    });



}());