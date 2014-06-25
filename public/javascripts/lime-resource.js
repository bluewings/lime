/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var app = angular.module('lime.resource', [
        'ngResource'
    ]);

    app.factory('User', ['$resource',
        function ($resource) {

            return $resource('/user/:userId', {}, {
                'get': {
                    method: 'GET',
                    interceptor: {
                        response: function (response) {

                            var inx, jnx, data = response.data.data;

                            // 전체조회인 경우, 사용자별 조회인 경우 고려해야함
                            for (inx = 0; inx < data.length; inx++) {
                                for (jnx = 0; jnx < data[inx].notes.length; jnx++) {
                                    data[inx].notes[jnx].userId = data[inx].userId;
                                }
                            }
                            return response.data;
                        }
                    }
                }
            });



        }
    ]);

    app.factory('UserNote', ['$resource',
        function ($resource) {

            return $resource('/user/:userId/note/:_id', null, {
                'update': {
                    method: 'PUT',
                    params: {
                        userId: '@id',
                        _id: '@_id'
                    }
                }
            });
        }
    ]);

    app.factory('Share', ['$resource',
        function ($resource) {

            return $resource('/share/:shareId');
        }
    ]);

    app.factory('ShareNote', ['$resource',
        function ($resource) {

            return $resource('/share/:shareId/note/:_id', null, {
                'update': {
                    method: 'PUT',
                    params: {
                        shareId: '@id',
                        _id: '@_id'
                    }
                }
            });
        }
    ]);    

}());