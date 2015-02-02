/*
 * @package RMW
 */

module.exports = function(grunt) {

  var paths = {
        scripts: ['Gruntfile.js', 'app.js', 'lib/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'form/**/*.js', 'resource/js/**/*.js'],
        styles: ['resource/css/*.scss'],
        all: []
      };

  Object.keys(paths).forEach(function(name) {
    paths[name].forEach(function(path) {
      paths.all[paths.all.length] = path;
    });
  });

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
      js: 'resource/js',
      jsDest: 'public/js',
      css: 'resource/css',
      cssDest: 'public/css',
      web: 'public/'
    },
    sass: {
      dev: {
        options: {
          outputStyle: 'nested',
          includePaths: [
            'bower_components/bootstrap-sass-official/assets/stylesheets',
            'bower_components/fontawesome/scss'
          ]
        },
        files: {
          '<%= dirs.cssDest %>/<%= pkg.name %>.css': '<%= dirs.css %>/<%= pkg.name %>.scss',
          '<%= dirs.cssDest %>/<%= pkg.name %>-reveal.css': '<%= dirs.css %>/<%= pkg.name %>-reveal.scss'
        }
      },
      default: {
        options: {
          outputStyle: 'compressed',
          includePaths: [
            'bower_components/bootstrap-sass-official/assets/stylesheets',
            'bower_components/fontawesome/scss'
          ]
        },
        files: {
          '<%= dirs.cssDest %>/<%= pkg.name %>.min.css': '<%= dirs.css %>/<%= pkg.name %>.scss',
          '<%= dirs.cssDest %>/<%= pkg.name %>-reveal.min.css': '<%= dirs.css %>/<%= pkg.name %>-reveal.scss'
        }
      }
    },
    concat: {
      dist: {
        src: [
          // Bootstrap
          'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
          // socket.io
          'node_modules/socket.io-client/dist/socket.io.js',
          // markd
          'bower_components/marked/lib/marked.js',
          // jquery.cookie
          'bower_components/jquery.cookie/jquery.cookie.js',
          // crowi
          'resource/js/crowi.js'
        ],
        dest: '<%= dirs.jsDest %>/<%= pkg.name %>.js'
      }
    },
    uglify: {
      build: {
        src: '<%= concat.dist.dest %>',
        dest: '<%= dirs.jsDest %>/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'lib/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'form/**/*.js', 'resource/js/**/*.js']
    },
    watch: {
      css: {
        files: paths.styles,
        tasks: ['sass'],
      },
      dev: {
        files: paths.all,
        tasks: ['dev'],
      },
      default: {
        files: paths.all,
        tasks: ['default'],
      },
    },
  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-sass');


  // grunt watch dev
  grunt.registerTask('default', ['sass', 'concat', 'uglify']);
  grunt.registerTask('dev', ['jshint', 'sass:dev', 'concat']);

};
