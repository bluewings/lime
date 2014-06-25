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
            controller: function ($scope, $rootScope, $attrs, $timeout) {

                return;

                //#mflick

                //alert(jindo);

                var oSlideFlicking;
                $rootScope.$watch('tags', function (newValue, oldValue) {

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

                                        //console.log(oCustomEvt);
                                        $rootScope.$apply(function() {

                                            $rootScope.status.filterTag = $rootScope.tags[oCustomEvt.nContentsIndex];

                                            $rootScope.info.tagIndex = oCustomEvt.nContentsIndex;

                                        });
                                        
                                        /* 현재 화면에 콘텐츠가 바뀔 경우 발생 */
                                    }
                                });
                                $('#mflick').addClass('active');
                            } else {

                                //alert('refresh');
                               // oSlideFlicking.refresh();
                                //console.log('refresh')
                            }



                            //if () {
                            ;
                            //}


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