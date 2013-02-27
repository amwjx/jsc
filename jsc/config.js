var fs = require('fs');

//seajs根目录
this.seajsRoot = __dirname + '/../';

//输出目录
this.outputDir	= './';

//全部输出文件名
this.outputALL = 'index.js';

//js输出文件名
this.outputJS = 'js.js';

//html输出文件名
this.outputHTML = 'tmpl.js';

//排除掉的目录
this.excludeForder = /(?:\.svn|_svn)$/i;

//排除掉的文件
this.excludeFile = /\.ignore\b/i;

//监听指定后缀的文件
this.filter = /\.(?:js|htm|html)$/i;

//将被添加到js文件合并的前面
this.beforeJS = fs.readFileSync(__dirname + '/seajs.before.wrap','UTF-8');

//将被添加到js文件合并的末尾
this.afterJS = fs.readFileSync(__dirname + '/seajs.after.wrap','UTF-8');

//默认模块
this.defaultModule = fs.readFileSync(__dirname + '/seajs.defaultModule.wrap','UTF-8');


require('./config.wrapper.js')(this);
