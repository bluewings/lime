(function () {

    'use strict';

    var app = angular.module('lime.header', []);


    var $ = jQuery;

    app.directive('limeHeader', function ($http) {

        return {
            restrict: 'E',
            replace: false,
            templateUrl: '/templates/header',
            scope: true,
            controller: function ($scope, $rootScope, $attrs, $timeout, $location, $route, CONFIG) {

                var scrollLimit = CONFIG.STYLE.COVER_HEIGHT - CONFIG.STYLE.NAV_BAR_HEIGHT;


                $scope.displayTitle = false;
                $scope.title = '';

                $(window).on('scroll', function (event) {

                    var scrollTop = $(window).scrollTop();

                    var displayTitle;

                    console.log(scrollTop);
                    if (scrollTop < scrollLimit) {
                        displayTitle = false;
                    } else {
                        displayTitle = true;
                    }

                    if (displayTitle != $scope.displayTitle) {
                        $scope.$apply(function () {
                            $scope.displayTitle = displayTitle;
                        });
                    }

                });



                $scope.func = Object.create($scope.$parent.$root.func);

                $scope.func.toggleHeader = function () {

                    $scope.status.headerOpen = $scope.status.headerOpen ? false : true;
                };
                $scope.func.toggleSelectMode = function () {

                    $scope.status.selectMode = $scope.status.selectMode ? false : true
                };

                $scope.data = {
                    panes: [],
                    shared: []
                };
                $scope.bgImage = '';

                                        function setNthContent(contentIndex) {
                                            $scope.$root.$broadcast('waawaa', {
                                                selected: $scope.data.panes[contentIndex]


                                            });
                                            $scope.bgImage = $scope.data.panes[contentIndex].backgroundImage;

                                        }

                $scope.$on('www', function (status, data) {

                    //console.log('>>>>>>>>>>>>>>>>');
                    var inx;
                    var panes = [];
                    //$scope.data.panes = [];
                    panes.push(data.data.user);
                    for (inx = 0; inx < data.data.shared.length; inx++) {
                        panes.push(data.data.shared[inx]);
                    }

                    $scope.data.panes = panes;

                    //console.log($scope.data.panes);

                    //$scope.data.shared = data.data.shared;
                    //console.log($scope.data.shared);
                    //$scope.data.shared = data.data.shared;



                    //console.log($location);



                    //console.log('get data');
                    //console.log(data.data.shared);
                    //console.log(arguments);

                });



                var oSlideFlicking;
                var o2SlideFlicking;
                $scope.$watch('data.panes', function (newValue, oldValue) {

                    //alert('flick');

                    if (newValue && newValue.length > 1) {



                        $timeout(function () {

                            if (oSlideFlicking) {
                                oSlideFlicking.destroy();
                            }

                            if (true || !oSlideFlicking) {


                                oSlideFlicking = new jindo.m.SlideFlicking('mflick', {
                                    bHorizontal: true, //가로형 여부
                                    sClassPrefix: 'flick-', //Class의 prefix
                                    bUseCircular: false

                                    //,  //순환여부 


                                    //nDefaultIndex: 2        //로드시에 화면에 보이는 콘텐츠의 인덱스
                                }).attach({
                                    'flicking': function (oCustomEvt) {

                                        o2SlideFlicking.moveTo(oCustomEvt.nContentsIndex);

                                        setNthContent(oCustomEvt.nContentsIndex);
                                    }
                                });

                            }

                            // 상단 제목바 슬라이드
                            if (o2SlideFlicking) {
                                o2SlideFlicking.destroy();
                            }

                            if (true || !o2SlideFlicking) {


                                o2SlideFlicking = new jindo.m.SlideFlicking('m2flick', {
                                    bHorizontal: true, //가로형 여부
                                    sClassPrefix: 'flick-', //Class의 prefix
                                    bUseCircular: false

                                    //,  //순환여부 


                                    //nDefaultIndex: 2        //로드시에 화면에 보이는 콘텐츠의 인덱스
                                }).attach({
                                    'flicking': function (oCustomEvt) {

                                        oSlideFlicking.moveTo(oCustomEvt.nContentsIndex);

                                        setNthContent(oCustomEvt.nContentsIndex);




                                    }
                                });
                                $('#mflick').addClass('active');
                            }

                            //if () {
                            ;
                            //}


                        });

                    }

                });



                //};
                return;

                console.log('>>>>>hdr');

                console.log($scope.$parent.$root);

                console.log($scope.$parent.$root.func);

                $scope.func.prototype = $scope.$parent.$root.func;

                console.log($scope.$parent.$root);
            }
        };
    });

})();