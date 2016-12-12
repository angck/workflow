# workflow 使用说明

## 安装gulp依赖

```

npm install

```

安装完依赖以后如果已安装全局gulp包，可通过下面命令安装：

```

npm i -g gulp

```

使用gulp命令:

```

gulp init --n=项目名称（英文字母） --t=m|pc(项目类型)
gulp dev --n=项目名称 #启动开发调试模式
gulp clean --n=项目名称 清除编译目录
gulp release --n=项目名称 生成发布文件

```


OR Mac 电脑可直接使用 make命令

```

make init n=项目名称（英文字母）t=m|pc(项目类型)
make dev n=项目名称  #启动开发调试模式
make release n=项目名称 生成发布文件

```

如果使用less请自行修改gulpfile.js

```

 var srcPath = {
     path: projectName + '/src',
-    css: projectName + '/src/sass',
+    css: projectName + '/src/less',
     js: projectName + '/src/js',
     image: projectName + '/src/images'
 };

```