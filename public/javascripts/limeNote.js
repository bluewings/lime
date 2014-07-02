/*jslint browser: true, regexp: true, unparam: true, indent: 4 */
/*global jQuery: true */
(function () {

    'use strict';

    var $ = jQuery;

    var app = angular.module('limeNote', [
        'ngRoute', 'ngSanitize',
        'ngAnimate'
    ]);

    var clicked;

    function runTheAnimation(element, done) {

        /*$(element).animate({
            
        }, 1000, function() {
            console.log('done');
                        done();
        });*/


    }

    function stopTheAnimation() {

    }

    function completeTheAnimation() {

    }

    app.animation('.my-crazy-anim', function ($timeout) {
        return {
            enter: function (element, done) {

                //console.log('>>>')

                //console.log(clicked);

                var elem = $(element);

                console.log('>>> element render')

                console.log(elem.get(0));


                //return;


var afterImg;
                if (clicked && clicked.size() > 0) {



                    html2canvas(elem.get(0), {



                        onrendered: function (canvas) {

                            console.log('>>> element start')

                            //afterImg = document.createElement('')




                            console.log('aaa');

                        }
                    });



                    clicked.css({
                        WebkitTransition: 'all 1s',
                        width: clicked.outerWidth()
                    });

                    element.css({

                        position: 'absolute',
                        top: clicked.offset().top,
                        left: clicked.offset().left,
                        width: '100%',
                        WebkitTransformOrigin: '0% 0%',
                        WebkitTransform: 'scale(' + (clicked.outerWidth() / document.documentElement.clientWidth) + ')',
                        opacity: 0.5
                    });

                    element.css({

                    });



                    setTimeout(function () {

                        element.css({
                            WebkitTransition: 'all 1s',
                            WebkitTransform: 'scale(1)',
                            top: 0,
                            left: 0,
                            //left: 0,
                            //width: '100%',
                            opacity: 1
                        });
                        clicked.css({

                            top: 0,
                            left: 0,
                            width: '100%',
                            opacity: 0,

                        });
                    });
                    setTimeout(function () {
                        clicked.remove();
                        clicked = null;
                        done();
                    }, 1100);



                    /*, 750, function () {
                        //alert('done');
                        clicked.remove();
                        clicked = null;
                        done();
                    });*/



                    console.log('wow!!!');
                }
                //runTheAnimation(element, done);
                return function (cancelled) {
                    if (cancelled) {
                        stopTheAnimation();
                    } else {
                        completeTheAnimation();
                    }
                }

                //run the animation here and call done when the animation is complete
                /*return function(cancelled) {


        //this (optional) function will be called when the animation
        //completes or when the animation is cancelled (the cancelled
        //flag will be set to true if cancelled).
      };*/
            }
            /*,
    leave: function(element, done) { },
    move: function(element, done) { },

    //animation that can be triggered before the class is added
    beforeAddClass: function(element, className, done) { },

    //animation that can be triggered after the class is added
    addClass: function(element, className, done) { },

    //animation that can be triggered before the class is removed
    beforeRemoveClass: function(element, className, done) { },

    //animation that can be triggered after the class is removed
    removeClass: function(element, className, done) { }*/
        };
    });

    // limeNote-constant
    app.constant('CONFIG', {
        ARCHIVE_MY_ID_KEY: 'lime-my-id',
        ARCHIVE_NOTES_KEY: 'lime-notes',
        SYNC_INTERVAL: 3000,
        STYLE: {
            COVER_HEIGHT: 220,
            NAV_BAR_HEIGHT: 47
        }
    });

    app.constant('CONSTANT', {
        SUCCESS: 'success',
        ERROR: 'error'
    });
    // //limeNote-constant

    app.config([
        '$locationProvider',
        '$routeProvider',
        '$compileProvider',
        function ($locationProvider, $routeProvider, $compileProvider) {

            $locationProvider.html5Mode(true);
            $routeProvider
                .when('/', {
                    templateUrl: '/templates/limeNote-list',
                    controller: 'lime.control.list',
                    animation: 'slide'
                })
                .when('/:shareId', {
                    templateUrl: '/templates/limeNote-list',
                    controller: 'lime.control.list'
                })
                .when('/view/:shareId', {
                    templateUrl: '/templates/limeNote-view',
                    controller: 'lime.control.view'
                })
                .otherwise({
                    redirectTo: '/'
                });

            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|intent):/);
        }
    ]);

    app.controller('lime.control.list', function ($scope, $location) {

        $scope.data = {};

        var test = $('jQuery');

        console.log(test);

        $scope.pageClass = 'page-home';

        $scope.moveWithAnim = function (event) {

            console.log(event);
            clicked = $(event.target).closest('div.card');

            var offset = clicked.offset();

            event.preventDefault();



            html2canvas(clicked.get(0), {

                onrendered: function (canvas) {

                    var img = document.createElement('img');

                    img.src = canvas.toDataURL();

                    //console.log(img.src);
                    document.body.appendChild(img);

                    img = $(img);

                    img.css({
                        position: 'absolute',
                        top: offset.top,
                        left: offset.left,
                        zIndex: 10000

                    });
                    console.log('>>> rendered img');
                    console.log(img);

                    clicked.css('opacity', 0);

                    clicked = img;

                    $scope.$apply(function () {

                        $location.path('/view/test');

                    });


                    console.log('>>> location path set!!!');


                    //console.log('>>> draw fin.');

                    //ne();

                }

            });



            //console.log(clicked.size());



        };



    });
    app.controller('lime.control.view', function ($scope) {

        $scope.data = {};

        var test = $('jQuery');

        console.log(test);
        $scope.pageClass = 'page-about';



    });

    app.run(function ($rootScope) {

        console.log('>>> app run');

        $rootScope.status = {
            myId: null,
            headerOpen: false,
            selectMode: false,
            hasChanges: false,
            syncFromRemote: false,
            notesHashCode: '',
            filterTag: ''
        };
    });

    angular.element(document).ready(function () {



        angular.bootstrap(document, ['limeNote']);
    });



}());