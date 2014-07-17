module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /*concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/angular/angular.min.js',
                    'bower_components/angular-route/angular-route.min.js',
                    'bower_components/angular-sanitize/angular-sanitize.min.js',
                    'bower_components/angular-animate/angular-animate.min.js',
                    'bower_components/angular-resource/angular-resource.min.js',
                    'bower_components/bootstrap-sass/dist/js/bootstrap.min.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'bower_components/ng-file-upload/angular-file-upload-shim.min.js',
                    'bower_components/ng-file-upload/angular-file-upload.min.js',
                    'bower_components/html2canvas/build/html2canvas.min.js',
                    'bower_components/isotope/dist/isotope.pkgd.min.js',
                    'bower_components/angular-qrcode/qrcode.js',
                    'public/javascripts/modules/qrcode.js',
                    'public/javascripts/modules/jindo.mobile.min.js',
                    'public/javascripts/modules/jindo.mobile.component.js',
                    'public/javascripts/neymar.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },*/
        cssmin: {
            minify: {
                files: {
                    'public/stylesheets/neymar.min.css': [
                        //'bower_components/components/bootstrap-sass/dist/css/bootstrap.css',
                        'public/stylesheets/neymar.css'
                    ]
                }
            }
        },
        uglify: {

            js: {
                files: {
                    'public/javascripts/neymar.all.js': [
                        'bower_components/jquery/dist/jquery.min.js',
                        'bower_components/angular/angular.min.js',
                        'bower_components/angular-route/angular-route.min.js',
                        'bower_components/angular-sanitize/angular-sanitize.min.js',
                        'bower_components/angular-animate/angular-animate.min.js',
                        'bower_components/angular-resource/angular-resource.min.js',
                        'bower_components/bootstrap-sass/dist/js/bootstrap.min.js',
                        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                        'bower_components/ng-file-upload/angular-file-upload-shim.min.js',
                        'bower_components/ng-file-upload/angular-file-upload.min.js',
                        'bower_components/html2canvas/build/html2canvas.min.js',
                        'bower_components/isotope/dist/isotope.pkgd.min.js',
                        'bower_components/angular-qrcode/qrcode.js',
                        'public/javascripts/modules/qrcode.js',
                        'public/javascripts/modules/jindo.mobile.min.js',
                        'public/javascripts/modules/jindo.mobile.component.js',
                        'public/javascripts/neymar.js'
                    ]
                },
            },
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                // options here to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-qunit');
    //grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    //grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('build', ['uglify:js', 'cssmin']);

};