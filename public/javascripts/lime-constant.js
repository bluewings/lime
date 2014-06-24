/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var app = angular.module('lime.resource', [
        'ngResource'
    ]);

    app.factory('User', ['$resource', function ($resource) {

        return $resource('/user/:userId');
    }]);

    app.factory('UserNote', ['$resource', function ($resource) {

        return $resource('/user/:userId/note/:_id', null, {
            'update': {
                method: 'PUT',
                params: {
                    userId: '@id',
                    _id: '@_id'
                }
            }
        });
    }]);

    app.factory('Share', ['$resource', function ($resource) {

        return $resource('/share/:shareId');
    }]);

}());