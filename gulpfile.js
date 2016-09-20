var gulp         =  require('gulp-help')(require('gulp'));
var path         =  require('path');
var notify       =  require("gulp-notify");
var concat       =  require('gulp-concat');
var utility      =  require('gulp-util');
var rename       =  require('gulp-rename');
var flatten      =  require('gulp-flatten');
var sass         =  require('gulp-sass');
var clean        =  require('gulp-clean-css');
var sourcemaps   =  require('gulp-sourcemaps');
var autoprefixer =  require('gulp-autoprefixer');
var uglify       =  require('gulp-uglify');
var ngAnnotate   =  require('gulp-ng-annotate');
var browserSync  =  require('browser-sync');
var plumber      =  require('gulp-plumber');
var jshint       =  require('gulp-jshint');
var stylish      =  require('jshint-stylish');
var tmplcache    =  require('gulp-angular-templatecache');
var cache        =  require('gulp-cache');
var imagemin     =  require('gulp-imagemin');


gulp.task('images', function(){
  gulp.src('src/assets/img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/img/'));
});

gulp.task('fonts', function(){
  gulp.src('src/assets/fonts/**/*')
    .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('index', function(){
  gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('favicon', function(){
  gulp.src('src/favicon.png')
    .pipe(gulp.dest('dist'));
});

gulp.task('templates', 'Registers templates with Angular cache', function () {
  return gulp.src('src/app/**/*.html')
    .pipe(tmplcache('templates.js', {
        module: 'drinkingBuddyApp',
        transformUrl: function(url) {
          var split = url.split('/');
          return split[split.length - 1];
       }
    }))
    .pipe(gulp.dest('dist/js'));
});


// Start Server


gulp.task('start-server', 'Start the local development server.', function() {
  browserSync({
    server: { baseDir: "./dist" }
  });
  console.log('Development server started.');
});


// Reload Server


gulp.task('reload-server', 'Reload the local development server.', function () {
  browserSync.reload();
  console.log('Development server reloaded.');
});


// Javascript Lint


gulp.task('js-lint', 'Run JSHint on all application javascript files.', function() {
  gulp.src(['src/app/*.js', 'src/app/**/*.js', '!src/app/vendor/*.js'])
    .pipe(plumber({
      errorHandler: function (error) {
        utility.beep();
        notify.onError({
          title:    "Javascript Error",
          subtitle: false,
          message:  "<%= error.message %>",
          icon: path.join(__dirname + 'src/assets/img/', 'code_error.jpg')
        })(error);

        this.emit('end');
      }
    }))
    .pipe(jshint({
      strict: false
    }))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
});


// Javascript Compile


gulp.task('js', 'Compile javascript files.', ['js-lint'], function () {
  gulp.src(['src/app/*.js', 'src/app/**/*.js'])
    .pipe(sourcemaps.init())
      .pipe(concat('dist/js/app.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'))
});


// Javascript Vendor Compile


gulp.task('js-vendor', 'Compile javascript vendor files.', function () {
  gulp.src([
    'src/vendor/js/jquery-1.12.3.min.js',
    'src/vendor/js/angular.min.js',
    'src/vendor/js/*.js'
  ])
  .pipe(concat('dist/js/vendor.js'))
  .pipe(gulp.dest('.'))
});


// Sass compiling to CSS


gulp.task('css', 'Compile Sass files into CSS.', function() {
  gulp.src(['src/assets/css/app.scss'])
    .pipe(sourcemaps.init())
      .pipe(plumber({
        errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
      }}))
      .pipe(sass())
      .pipe(rename("style.css"))
      .pipe(clean({compatibility: 'ie9'}))
      .pipe(autoprefixer('last 2 versions'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.reload({stream:true}))
});


// CSS Vendor Compile


gulp.task('css-vendor', 'Compile CSS vendor files.', function () {
  gulp.src(['src/vendor/css/*.css'])
  .pipe(concat('dist/css/vendor.css'))
  .pipe(gulp.dest('.'))
});


// Run all vendor tasks (Javascript and CSS)


gulp.task('vendor', 'Compile CSS and JS vendor files.', ['css-vendor', 'js-vendor']);


// Watch directories and files for reload


gulp.task('watch', 'Watch application CSS and JS for changes.', ['css', 'js'], function () {
  gulp.watch('src/app/**/*.js', ['js'])
  gulp.watch('src/assets/css/**/*.scss', ['css'])
  gulp.watch('src/*.html', ['reload-server', 'index']);
  gulp.watch('src/app/**/*.html', ['templates', 'reload-server']);
});


// Build /dist/ directory


gulp.task('build', 'Compile all files', ['images', 'favicon', 'index', 'fonts', 'vendor', 'css', 'js', 'templates']);


// Default task


gulp.task('default', 'Default task.', ['vendor', 'watch', 'start-server']);


