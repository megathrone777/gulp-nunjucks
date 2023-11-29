import gulp, { type TaskFunction } from "gulp";
import browserSync from "browser-sync";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import gulpPlumber from "gulp-plumber";
import gulpNunjucks from "gulp-nunjucks-render";
import gulpHtmlMinify from "gulp-htmlmin";
import gulpTypescript from "gulp-typescript";
import gulpUglify from "gulp-uglify";
import gulpConcat from "gulp-concat";

const ts = gulpTypescript.createProject("tsconfig.json");
const sass = gulpSass(dartSass);
const browserSyncServer = browserSync.create();

const taskSERVER: TaskFunction = (callback) => {
  browserSyncServer.init({
    server: {
      baseDir: "./build",
    },
    port: 1337,
  });
  callback();
};

const taskHTML: TaskFunction = (callback) => {
  gulp
    .src("./pages/*.njk")
    .pipe(gulpPlumber())
    .pipe(
      gulpNunjucks({
        path: ["blocks/"],
      })
    )
    .pipe(
      gulpHtmlMinify({
        collapseInlineTagWhitespace: true,
        collapseWhitespace: true,
      })
    )
    .pipe(gulp.dest("./build"))
    .pipe(browserSyncServer.stream());
  callback();
};

const taskSASS: TaskFunction = (callback) => {
  gulp
    .src("./scss/init.scss")
    .pipe(gulpPlumber())
    .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
    .pipe(gulp.dest("./build/css"))
    .pipe(browserSyncServer.stream());
  callback();
};

const taskTS: TaskFunction = (callback) => {
  ts.src()
    .pipe(gulpPlumber())
    .pipe(ts())
    .js.pipe(gulpUglify())
    .pipe(gulp.dest("./build/js"))
    .pipe(browserSyncServer.stream());
  callback();
};

const taskCONCAT: TaskFunction = (callback) => {
  gulp
    .src("./vendor/*.js")
    .pipe(gulpConcat("vendor.js"))
    .pipe(gulp.dest("./build/js"));
  callback();
};

const taskWATCH: TaskFunction = (callback) => {
  gulp.watch(
    ["./**/*.html", "./**/*.css", "./**/*.js"],
    browserSyncServer.reload
  );
  gulp.watch("./**/*.njk", taskHTML);
  gulp.watch("./**/*.scss", taskSASS);
  gulp.watch("./**/*.ts", taskTS);
  callback();
};

const taskDEFAULT: TaskFunction = (callback) => {
  taskHTML((): void => {
    console.info("HTML task started!");
  });

  taskSASS((): void => {
    console.info("SASS task starter!");
  });

  taskCONCAT((): void => {
    console.info("Vendor filed concatenated");
  });

  taskTS((): void => {
    console.info("TS task started!");
  });

  taskSERVER((): void => {
    console.info("Server task started!");
  });

  taskWATCH((): void => {
    console.info("Watching files for changes!");
  });

  callback();
};

exports.default = taskDEFAULT((): void => {
  console.info("Task default started!");
});
