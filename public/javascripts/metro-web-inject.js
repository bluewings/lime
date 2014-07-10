/*jslint browser: true, unparam: true, indent: 4 */
/*global rangy: true */
(function () {

    'use strict';

    var $, view, app, body;

    var CONFIG, URL;

    var SUCCESS = 'success',
        ELEMENT_NODE = 1,
        TEXT_NODE = 3;

    CONFIG = {
        ARCHIVE_PAGES_KEY: 'web-clip-pages',
        ARCHIVE_STATUS_KEY: 'web-clip-status',
        REMOTE_HOST: 'http://10.64.51.102:8080'
    };

    URL = {
        TEMPLATE: CONFIG.REMOTE_HOST + '/templates/widget-metro-web?type=json'
    };

    function initView(callback) {

        body = $(document.body);

        view = {
            container: null
        };

        $.ajax({
            url: URL.TEMPLATE,
            dataType: 'jsonp',
            jsonp: 'callback',
            success: function (response) {

                if (response.status === SUCCESS) {

                    console.log('>>>>');
                    view.container = document.createElement('div');
                    view.container.innerHTML = response.data.template;
                    document.body.appendChild(view.container);
                    if (callback && typeof callback === 'function') {
                        callback(view.container);
                    }
                }
            }
        });
    }

    function initNgModule(elem) {

        app = angular.module('metroWeb-widget', ['ngSanitize']);

        app.constant('CONFIG', {
            METRIC: {
                BRICK_WIDTH: 298
            }
        });

        app.controller('metroWeb-main', function ($scope, $element, $http, $timeout, $sce) {

            var isotopeEl;

            var bricks = localStorage.getItem('metro-web-bricks');

            try {
                bricks = JSON.parse(bricks);
            } catch (e) {
                bricks = [];
            }

            if (!bricks || !bricks.length) {
                bricks = [];   
            }

            for (var inx = 0; inx < bricks.length; inx++) {
                delete bricks[inx].$$hashKey;
                bricks[inx].safeUrl = $sce.trustAsResourceUrl(bricks[inx].url);
                if (!bricks[inx].size) {
                    bricks[inx].size = 1;
                }
                delete bricks[inx].clickable;

            }

            $scope.data = {
                bricks: bricks
            };

            function setData() {
                bricks = localStorage.setItem('metro-web-bricks', JSON.stringify($scope.data.bricks));
            }


            $scope.func = {
                isotope: function (duration) {

                    $timeout(function () {

                        if (isotopeEl) {
                            isotopeEl.isotope('destroy');
                        } else {
                            isotopeEl = $element.find('.isotope');
                        }
                        isotopeEl.isotope({
                            itemSelector: '.brick',
                            masonry: {
                                columnWidth: 218,
                                gutter: 20
                            }
                        });
                    }, duration || 0);
                },
                sizeDown: function(brick) {

                    brick.size--;

                    if (brick.size < 1) {
                        brick.size = 1;
                    }
                    $scope.func.isotope();  
                    setData();
                },
                sizeUp: function(brick) {

                    brick.size++;

                    if (brick.size > 4) {
                        brick.size = 4;
                    }
                    $scope.func.isotope();  
                    setData();
                },
                addBrick: function () {

                    var url = prompt('URL을 입력하세요.');

                    if (url) {
                        $scope.data.bricks.push({
                            url: url,
                            safeUrl: $sce.trustAsResourceUrl(url),
                            size: 1
                        });
                        $scope.func.isotope();    
                    }
                    setData();
                },
                removeBrick: function (brick) {

                    var i, newBricks = [];
                    for (i = 0; i < $scope.data.bricks.length; i++) {
                        console.log(brick);
                        console.log($scope.data.bricks[i]);
                        if (brick !== $scope.data.bricks[i]) {

                            newBricks.push($scope.data.bricks[i]);
                        }
                    }
                    $scope.data.bricks = newBricks;
                    $scope.func.isotope();
                    setData();
                }
            };

            /*$scope.$watchCollection('data.bricks', function (newValue, oldValue) {

                if (newValue && newValue.length) {
                    $scope.func.isotope();
                }

            });*/
            $scope.func.isotope(100);
        });

        angular.bootstrap(elem, ['metroWeb-widget']);
    }

    function initialize() {

        initView(function () {

            console.log('init!!!');

            initNgModule(view.container);
            console.log('init done!!!');
        });
    }

    function loadResources(srcList, callback) {

        var inx, element, type, elements = [];

        if (typeof srcList === 'string') {
            srcList = [srcList];
        }

        function cb_onload() {

            var jnx, ready = true;
            this.__ready = true;
            for (jnx = 0; jnx < elements.length; jnx++) {
                if (!elements[jnx].__ready) {
                    ready = false;
                    break;
                }
            }
            if (ready && callback && typeof callback === 'function') {
                callback();
            }
        }

        for (inx = 0; inx < srcList.length; inx++) {
            type = srcList[inx].match(/\.js$/) ? 'script' : 'css';
            element = document.createElement(type === 'script' ? 'SCRIPT' : 'LINK');
            elements.push(element);
            element.onload = cb_onload;
            if (type === 'script') {
                element.type = 'text/javascript';
                element.src = srcList[inx];
            } else {
                element.rel = 'stylesheet';
                element.type = 'text/css';
                element.href = srcList[inx];
            }
            document.body.appendChild(element);
        }
    }

    function bootstrap() {

        var resources = [],
            noConflict = false;

        if (window.jQuery === undefined) {
            resources.push(CONFIG.REMOTE_HOST + '/components/jquery/dist/jquery.min.js');
        } else if (window.$ && !window.$.fx) {
            noConflict = true;
        }

        resources.push(CONFIG.REMOTE_HOST + '/components/angular/angular.min.js');
        //resources.push(CONFIG.REMOTE_HOST + '/components/angular-animate/angular-animate.min.js');
        //resources.push(CONFIG.REMOTE_HOST + '/components/html2canvas/build/html2canvas.min.js');
        //resources.push(CONFIG.REMOTE_HOST + '/components/rangy-1.3/rangy-core.js');
        resources.push(CONFIG.REMOTE_HOST + '/components/isotope/dist/isotope.pkgd.min.js');
        resources.push(CONFIG.REMOTE_HOST + '/stylesheets/metro-web-inject.css');



        loadResources(resources, function () {


            loadResources([
                //CONFIG.REMOTE_HOST + '/components/isotope/dist/isotope.pkgd.min.js',
                //CONFIG.REMOTE_HOST + '/components/jquery-masonry/dist/masonry.pkgd.min.js',
                //'http://cdnjs.cloudflare.com/ajax/libs/masonry/2.1.08/jquery.masonry.min.js',

                CONFIG.REMOTE_HOST + '/components/angular-sanitize/angular-sanitize.min.js',
                //CONFIG.REMOTE_HOST + '/components/angular-animate/angular-animate.min.js'


                //CONFIG.REMOTE_HOST + '/javascripts/metroWeb.util.js'
            ], function () {


                if (noConflict) {
                    window.jQuery.noConflict();
                }
                $ = window.jQuery;

                initialize();
            });
        });
    }

    setTimeout(function () {

        bootstrap();

    }, 0);

}());