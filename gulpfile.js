/**
 * Gulp 组件
 */
var gulp = require('gulp'); // 基础库
var sass = require('gulp-ruby-sass'); // css 预处理/Sass 编译
var sprite = require('gulp.spritesmith'); // image sprite
var uglify = require('gulp-uglify'); // JS文件压缩
var imagemin = require('gulp-imagemin'); // imagemin 图片压缩
var pngquant = require('imagemin-pngquant'); // imagemin 深度压缩
// var livereload = require('gulp-livereload'); // 网页自动刷新（服务器控制客户端同步刷新）
var webserver = require('gulp-webserver'); // 本地服务器
var rename = require('gulp-rename'); // 文件重命名
var sourcemaps = require('gulp-sourcemaps'); // 来源地图
var changed = require('gulp-changed'); // 只操作有修改过的文件
var concat = require('gulp-concat'); // 文件合并
var clean = require('gulp-clean'); // 文件清理
// var sequence = require('gulp-sequence'); // 控制任务执行顺序
var template = require('gulp-template'); // 模版处理
var argv = require('yargs').argv; // 处理命令行差数
// var fs = require('fs');
// var path = require('path');

/**
 * 全局变量设置
 */

var projectName = argv.n || '';
var projectType = argv.t || 'pc'; // m: 表示无线 pc：表示PC端

var srcPath = {
    path: projectName + '/src',
    css: projectName + '/src/sass',
    js: projectName + '/src/js',
    image: projectName + '/src/images'
};

var destPath = {
    path: projectName + '/dist',
    css: projectName + '/dist/css',
    js: projectName + '/dist/js',
    image: projectName + '/dist/images'
};

gulp.task('init', function () {
    return gulp.src('template/**/*')
        .pipe(template({
            name: projectName,
            type: projectType
        }))
        .pipe(gulp.dest(projectName));
});

/**
 * 开发环境任务管理
 */
// html处理
gulp.task('html', function () {
    return gulp.src(srcPath.path + '/**/*.html')
        .pipe(changed(destPath.path))
        .pipe(gulp.dest(destPath.path));
});

function compileSprite(imageFolder) {
    var spriteConfig = {
        // 图片位置
        spriteSource: srcPath.image + '/' + imageFolder + '/*.png',
        spriteMithConfig: {
            imgName: imageFolder + '.png', // 输出图片名称
            cssName: '_' + imageFolder + '.scss', // 输出scss名称
            cssFormat: 'scss', //输出样式格式
            cssTemplate: 'scss.template.mustache', // 定义输出scss形式
            algorithm: 'binary-tree',
            padding: 6,
            cssOpts: imageFolder + 'Src',
            cssVarMap: function (sprite) {
                sprite.name = imageFolder + '_' + sprite.name;
            }
        }
    };

    var pName = argv.p;
    var spriteData = gulp.src(spriteConfig.spriteSource)
        .pipe(sprite(spriteConfig.spriteMithConfig));

    spriteData.img.pipe(gulp.dest(srcPath.image)); //输出sprite image至编译目录
    spriteData.css.pipe(gulp.dest(srcPath.css + '/sprite')).on('end', function () {
        console.log('sprite');
    }); // 输出scss 至源目录
}

// img sprite
gulp.task('sprite', function () {
    compileSprite('tabs');
    compileSprite('icons');
});

// sass 处理
gulp.task('sass', function () {
    return sass(srcPath.css + '/**/*.scss', {
        style: 'compact',
        sourcemap: true
    })
        .on('error', function (err) {
            console.log('Error!', err.message); // 显示错误
        })
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(destPath.css)).on('end', function () {
            console.log('sass');
        });
});

// JS压缩&重命名
gulp.task('script', ['copy'], function () {
    return gulp.src([srcPath.js + '/**/*.js', '!' + srcPath.js + '/**/*.min.js'])
        .pipe(changed(destPath.js)) // 对应匹配的文件
        .pipe(sourcemaps.init()) // 执行sourcemaps
        .pipe(rename({
            // suffix: '.min'
        })) // 重命名
        .pipe(uglify({
            preserveComments: 'some'
        })) // 使用uglify压缩，保留部分注释
        .pipe(sourcemaps.write('maps')) // 地图输出
        .pipe(gulp.dest(destPath.js)); // 输出路径
});

gulp.task('copy', function () {
    return gulp.src([srcPath.js + '/**/*.css', srcPath.js + '/**/*.handlebars', srcPath.js + '/**/*.tpl']).
        pipe(gulp.dest(destPath.js));
});

// imagemin 图片压缩
gulp.task('images', function () {
    return gulp.src(srcPath.image + '/**/*') // 指明源文件路径，如需匹配指定格式的文件，可以写成 .{png,jpg,gif,svg}
        .pipe(changed(destPath.image))
        .pipe(imagemin({
            progressive: true, // 无损压缩JPG图片
            svgoPlugins: [{
                removeViewBox: false
            }], // 不要移除svg的viewbox属性
            use: [pngquant()] // 深度压缩PNG
        }))
        .pipe(gulp.dest(destPath.image)); // 输出路径
});

// 文件合并
gulp.task('concat', function () {
    return gulp.src(srcPath.js + '/**/*.min.js') // 要合并的文件
        .pipe(concat('libs.js')) // 合并成libs.js
        .pipe(rename({
            suffix: '.min'
        })) // 重命名
        .pipe(gulp.dest(destPath.js)); // 输出路径
});

// 本地服务器
gulp.task('webserver', function () {

    gulp.src(destPath.path) // 服务器目录（.代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            livereload: true, // 启用LiveReload
            open: true // 服务器启动时自动打开网页
        }));
});

// 监听任务
gulp.task('watch', function () {
    // 监听 html
    gulp.watch(srcPath.path + '/**/*.html', ['html']);
    // 监听 scss
    gulp.watch(srcPath.css + '/**/*.scss', ['sass']);
    // 监听 images
    gulp.watch(srcPath.image + '/**/*', ['images']);
    // 监听 js
    gulp.watch([srcPath.js + '/**/*.js', '!' + srcPath.js + '/**/*.min.js'], ['script']);
});

// 默认任务
gulp.task('dev', ['webserver', 'watch']);

/* = 发布环境( Release Task )
-------------------------------------------------------------- */
// 清理文件
gulp.task('clean', function () {
    return gulp.src(destPath.path, {
        read: false
    }) // 清理maps文件
        .pipe(clean());
});

// 样式处理
gulp.task('sassRelease', function () {
    return sass(srcPath.css + '/**/*.scss', {
        style: 'compressed'
    })
        .on('error', function (err) {
            console.log('Error!', err.message); // 显示错误
        })
        .pipe(gulp.dest(destPath.css));
});

// 脚本压缩&重命名
gulp.task('scriptRelease', function () {
    return gulp.src([srcPath.js + '/**/*.js', '!' + srcPath.js + '/**/*.min.js']) // 指明源文件路径、并进行文件匹配，排除 .min.js 后缀的文件
        .pipe(rename({
            suffix: '.min'
        })) // 重命名
        .pipe(uglify({
            preserveComments: 'some'
        })) // 使用uglify进行压缩，并保留部分注释
        .pipe(gulp.dest(destPath.js)); // 输出路径
});

// 打包发布
gulp.task('release', ['clean'], function () { // 开始任务前会先执行[clean]任务
    return gulp.start('sassRelease', 'scriptRelease', 'images'); // 等[clean]任务执行完毕后再执行其他任务
});

/* = 帮助提示( Help )
-------------------------------------------------------------- */
gulp.task('help', function () {
    console.log('----------------- 开发环境 -----------------');
    console.log('gulp html      HTML处理');
    console.log('gulp sass      样式处理');
    console.log('gulp sprite        图片合并');
    console.log('gulp script        JS文件压缩&重命名');
    console.log('gulp copy       复制js目录的非js文件');
    console.log('gulp images        图片压缩');
    console.log('gulp concat        文件合并');
    console.log('---------------- 发布环境 -----------------');
    console.log('gulp release       打包发布');
    console.log('gulp clean     清理文件sourcemap文件');
    console.log('gulp sassRelease       样式处理');
    console.log('gulp scriptRelease 脚本压缩&重命名');
    console.log('---------------------------------------------');
});

gulp.task('default', ['help']);
