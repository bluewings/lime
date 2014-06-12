(function () {

    'use strict';

    var app = angular.module('lime.resource.notes', []);

    app.service('limeResourceNotes', ['$modal',
        function ($modal) {
            return {
                note: function () {

                    var modalInstance;

                    modalInstance = $modal.open({
                        templateUrl: '/templates/modal-note',
                        size: 'sm',
                        controller: 'lime.modal.note'
                    });

                    modalInstance.result.then(function (result) {


                        console.log('>>> UPDATE')

                        console.log(result);

                        //console.log(info);


                    });



                    return modalInstance;
                }
            };
        }
    ]);

})();