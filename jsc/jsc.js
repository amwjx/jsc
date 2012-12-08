
/**
 * jsc：把模板转换成js，合并js
 * @author youkunhuang
 *
 */


var logger		= require('./logger')(__filename),
	config		= require('./config.js'),
	watcher		= require('./watcher.js'),
	parse		= require('./parse.js'),
	Queue		= require('./queue.js'),
	removeComments 	= require('./removeComments.js'),
	util	 	= require('./util.js'),
	q			= new Queue(),
	fs			= require("fs"),
	path		= require('path'),
	jscTimes	= 0,
	undefined;

//https://github.com/seajs/seajs
require('./seajs');

module.exports = jsc;

/**
 * 合并文件
 * @param {String} seajsRoot seajs根目录
 * @param {String} modulePath 要合并的模块目录
 */
function jsc(opt){

	var seajsRoot = opt.seajsRoot,
		modulePath = opt.modulePath,
		callback = opt.callback,
		listen = opt.listen,
		undefined;
	
	if(!(fs.existsSync || path.existsSync)(modulePath)){
		callback && callback();
		return;
	}
	
	if((fs.existsSync || path.existsSync)(modulePath + '/src')){
		q.queue(function(){
			this.clear();
			createALL(seajsRoot,modulePath);
			//parseHTML(seajsRoot,modulePath);
			logger.info('finish! ${times} : ${module}',{
				times: + (++jscTimes),
				module: modulePath
			});
			callback && callback();
			this.dequeue();
		});
	}else{
		callback && callback();
	}
	
	listen &&
	watcher.watch(modulePath,function(event,file){

		var module = '';
		
		if(!/\/src\/.+/gmi.test(file)){
			return;
		}
		
		logger.info('${e} : ${f}',{
			e: event,
			f: file
		});
		
		module = file.replace(/\/src\/.+/gmi,'');
			
		q.queue(function(){
			
			createALL(seajsRoot,module);
			//parseHTML(seajsRoot,modulePath);
			logger.info('finish! ${times} : ${module}',{
				times: + (++jscTimes),
				module: module
			});
			this.dequeue();
		});

	});

}

/**
 *
 * 合并所有文件
 * @param {String} seajsRoot seajs根目录
 * @param {String} modulePath 要合并的模块目录
 */
function createALL(seajsRoot,modulePath){

	var js 			= [],
		res 		= [],
		resJS 		= [],
		resHTML 	= [],
		moduleStr 	= config.defaultModule,
		packConfig	= {},
		outputALL	= config.outputALL,
		createOut	= true,
		packConfig = packConfig || {},
		outputHTML	= config.outputHTML,
		packDependent,
		outputDir,
		out,
		tmp,i,str,mname;
	
	
	
	//分析配置文件
	if((fs.existsSync || path.existsSync)(modulePath + '/src/_config.js')){
		
		//清除配置文件缓存
		delete require.cache[(modulePath + '/src/_config.js').replace(/\\/gmi,'/')];
		delete require.cache[(modulePath + '/src/_config.js').replace(/\//gmi,'\\')];
		
		packConfig = require(modulePath + '/src/_config.js');
		
	}
	
	if(packConfig.tmpl){
		outputHTML = packConfig.tmpl.name || config.outputHTML;
		createOut = !!packConfig.tmpl.create;
	}
	
	if(packConfig.all){
		outputALL = packConfig.all.name || config.outputALL;
		createOut = createOut = packConfig.all.create === false ? false : true ;
	}
	
	outputDir	= packConfig.dir || config.outputDir,
	
	out = modulePath + '/' + outputDir + outputALL;
	out = path.normalize(out).replace(/\\/gi,'/');

	resJS = createJS(seajsRoot,modulePath,packConfig);
	resHTML = createTMPL(seajsRoot,modulePath,packConfig);

	logger.info('${o}:',{
		o: out
	});

	if(outputALL && (fs.existsSync || path.existsSync)(modulePath + '/src/' + outputALL)){
		//moduleStr = '';
		
		logger.warn('module redefine: ${file}',{
			file: modulePath + '/src/' + outputALL
		});
		
	}
	
	[].push.apply(js,resJS.fileList);
	[].push.apply(js,resHTML.fileList);
	
	res.push('\r\n//all file list:\r\n')
	js.forEach(function(n,i){
		
		var str = modulePath + '/src/' + n;
		
		str = path.normalize(str).replace(/\\/gi,'/');
		str = str.replace(/.*\/+([^\/]+\/src\/.+)$/,'$1');
		
		res.push('//' + str + '\r\n');
	});
	res.push('\r\n\r\n');
	

	[].push.apply(res,resJS.res);
	[].push.apply(res,resHTML.res);

	packDependent = resJS.packDependent || [];
	tmp = [];
	
	packDependent.forEach(function(v,i){
		
		var id = v.split('?')[0].replace(/^\.\//,'').replace(/(?:\.js)?$/,'.js');
		
		if(id !== outputHTML){
			tmp.push(v);
		}
	});
	
	moduleStr = moduleStr.replace('define(function','define(' + JSON.stringify(tmp) + ',function');

	if(res.length){
		if(createOut){
			fs.writeFileSync(
				out,
				(moduleStr + res.join('')).replace(/\r\n|\r|\n/gmi,"\r\n"),
				'UTF-8'
			);
		}
	}else{
		logger.info('${o} is empty!!!',{o : out});
	}


	return res;
}

/**
 *
 * 编译模板文件
 * @param {String} seajsRoot seajs根目录
 * @param {String} modulePath 要合并的模块目录
 */
function parseHTML(seajsRoot,modulePath,packConfig){

	var js			= [],
		res			= [],
		idmap		= {},
		packConfig	= packConfig || {},
		tmp,i,str,mname;

	tmp = fs.readdirSync(modulePath + '/src');

	tmp.forEach(function(n,i){
		if(
			/\.page.html?$/i.test(n) &&
			fs.statSync(modulePath + '/src/' + n).isFile()
		){
			js.push(n);
		}

	});
	
	//按文件名排序
	js.sort(function(a,b){
		return a >= b ? 1 : -1;
	});

	logger.info('parse ${o}:',{
		o: modulePath.slice(seajsRoot.length + 1) + '/'
	});

	js.forEach(function(n,i){

		var res;

		mname = n.replace(/\.page(\.html?)$/,'$1');

		logger.info('parse:     ${m}  <--  ${n}',{ n: n, m: mname});

		res = parse({
			file: modulePath + '/src/' + n,
			path: modulePath + '/src',
			seajsRoot: seajsRoot
		});

		if(res){
			fs.writeFileSync(modulePath + '/' + mname,res.result,'UTF-8');
		}
	});

}

/**
 *
 * 合并模板文件
 * @param {String} seajsRoot seajs根目录
 * @param {String} modulePath 要合并的模块目录
 */
function createTMPL(seajsRoot,modulePath,packConfig){

	var js		= [],
		res		= [],
		idmap	= {},
		packConfig = packConfig || {},
		outputHTML	= config.outputHTML,
		outputDir	= packConfig.dir || config.outputDir,
		createOut	= false,
		out,
		tmp,i,str,mname;
	
	if(packConfig.tmpl){
		outputHTML = packConfig.tmpl.name || config.outputHTML;
		createOut = !!packConfig.tmpl.create;
	}

	out = modulePath + '/' + outputDir + outputHTML;
	out = path.normalize(out).replace(/\\/gi,'/');

	js = util.getFileList(modulePath + '/src',/\.(?:tmpl|page).html?$/i);
	
	//按文件名排序
	js.sort(function(a,b){
		return a >= b ? 1 : -1;
	});

	logger.info('${o}:',{
		o: out
	});

	mname = './' + outputHTML.replace(/\.js$/i,'');
	//兼容windows版本路径
	mname = mname.replace(/\\/g,'/');
	
	res.push('\r\n//tmpl file list:\r\n')
	js.forEach(function(n,i){
		
		var str = modulePath + '/src/' + n;
		
		str = path.normalize(str).replace(/\\/gi,'/');
		str = str.replace(/.*\/([^\/]+\/src\/.+)$/,'$1');
		
		res.push('//' + str + '\r\n');
	});
	res.push('\r\n\r\n');

	res.push('define.pack("', mname ,'",[],function(require, exports, module){\nvar tmpl = { ','\n');

	js.forEach(function(n,i){

		var reg = /<script([^<>]+?)type="text\/html"([\w\W\r\n]*?)>(?:\r\n|\r|\n)?([\w\W\r\n]*?)(?:\r\n|\r|\n)?<\/script>/gmi,
			regCode = /(?:(?:\r\n|\r|\n)\s*?)?<%(=?)([\w\W\r\n]*?)%>(?:\r\n|\r|\n)?/gmi,
			isID = /id="(.+?)"/i,
			noWith = /nowith="yes"/i,
			exec,jscode,eq,
			id,tmp,code,index,len;

		logger.info('    ${m}  <--  ${n}',{ n: n, m: mname});

		str = fs.readFileSync(modulePath + '/src/' + n,'UTF-8');

		//去除utf-8文件头的BOM标记
		str = str.replace(/^[\ufeff\ufffe]/,'');
		str = str.replace(/\r\n|\r|\n/gmi,"\r\n");

		while(exec  =  reg.exec(str)){

			tmp = exec[0] + exec[1];

			if(!isID.test(tmp)){
				continue;
			}

			id = isID.exec(tmp)[1];

			code = exec[3];

			res.push('\'', id , '\': function(data){\n\nvar __p=[],_p=function(s){__p.push(s)};\r\n');

			if(!noWith.test(tmp)){
				res.push('with(data||{}){\r\n');
			}

			//解析模板
			index = 0;

			while(exec  =  regCode.exec(code)){

				len = exec[0].length;

				if(index !== exec.index){
					res.push("__p.push('")
					res.push(
						code
							.slice(index,exec.index)
								.replace(/\\/gmi,"\\\\")
								.replace(/'/gmi,"\\'")
								.replace(/\r\n|\r|\n/gmi,"\\r\\n\\\r\n")
					);
					res.push("');\r\n");
				}

				index = exec.index + len;

				eq = exec[1];
				jscode = exec[2];


				if(eq){
					res.push('_p(');
					res.push(jscode);
					res.push(');\r\n');
				}else{
					res.push(jscode);
				}

			}

			res.push("__p.push('")
			res.push(
				code
					.slice(index)
						.replace(/\\/gmi,"\\\\")
						.replace(/'/gmi,"\\'")
						.replace(/\r\n|\r|\n/gmi,"\\r\\n\\\r\n")
			);
			res.push("');\r\n");

			if(!noWith.test(tmp)){
				res.push('\r\n}');
			}

			res.push('\r\nreturn __p.join("");\r\n}' , ',\r\n\r\n');

			if(idmap[id]){
				logger.warn('        same id: ${id}',{id: id});
			}

			idmap[id] = id;
		}

	});

	res.length --;

	res.push('\r\n};\nreturn tmpl;\r\n});\r\n');
	
	if(js.length){
		if(createOut){
			fs.writeFileSync(out,res.join('').replace('.pack("./tmpl",[],' , '(').replace(/\r\n|\r|\n/gmi,"\r\n"),'UTF-8');
		}
	}else{
		res = [];
		logger.info('${o} is empty!!!',{o : out});
	}

	return {
		res: res,
		fileList: js
	};
}


/**
 *
 * 合并js文件
 * @param {String} seajsRoot seajs根目录
 * @param {String} modulePath 要合并的模块目录
 */
function createJS(seajsRoot,modulePath,packConfig){

	var js			= [],
		res			= [],
		packConfig	= packConfig || {},
		moduleStr	= config.defaultModule,
		outputJS	= config.outputJS,
		outputDir	= packConfig.dir || config.outputDir,
		createOut	= false,
		packDependent		= [],
		packDependentMap	= {},
		sortRes,
		out,
		packConfig,
		tmp,i,str;
	
	if(packConfig.js){
		outputJS = packConfig.js.name || config.outputJS;
		createOut = !!packConfig.js.create;
	}
	
	out = modulePath + '/' + outputDir + outputJS;
	out = path.normalize(out).replace(/\\/gi,'/');
	
	if(outputJS && (fs.existsSync || path.existsSync)(modulePath + '/src/' + outputJS)){
		//moduleStr = '';
		
		logger.warn('module redefine: ${file}',{
			file: modulePath + '/src/' + outputJS
		});
	}
	
	js = util.getFileList(modulePath + '/src',/\.js$/i);
	
	//按文件名排序
	js.sort(function(a,b){
		return a >= b ? 1 : -1;
	});
	
	//自定义排序
	if(packConfig.js && packConfig.js.sort){
		sortRes = packConfig.js.sort(js);
		if(sortRes){
			js = sortRes;
		}
	};

	logger.info('${o}:',{
		o: out
	});

	res.push('\r\n//js file list:\r\n')
	js.forEach(function(n,i){
		
		var str = modulePath + '/src/' + n;
		
		str = path.normalize(str).replace(/\\/gi,'/');
		str = str.replace(/.*\/([^\/]+\/src\/.+)$/,'$1');
		
		res.push('//' + str + '\r\n');
	});

	res.push(config.beforeJS);
	
	
	//enclude packing module
	js.forEach(function(n,i){

		var mname = './' + n.replace(/\.js$/i,'').replace(/[\/\\]/gmi,'.'),
			dependent		= [],
			dependentMap	= {},
			i;

		//兼容windows版本
		mname = mname.replace(/\\/g,'/');

		packDependentMap[mname]= true;
		packDependentMap[mname + '.js']= true;
	});

	js.forEach(function(n,i){

		var mname = './' + n.replace(/\.js$/i,'').replace(/[\/\\]/gmi,'.'),
			dependent		= [],
			dependentMap	= {},
			i;

		//兼容windows版本
		mname = mname.replace(/\\/g,'/');
		logger.info('    ${m}  <--  ${n}',{ n: n, m: mname});

		str = fs.readFileSync(modulePath + '/src/' + n,'UTF-8');

		//去除utf-8文件头的BOM标记
		str = str.replace(/^[\ufeff\ufffe]/,'');
		str = str.replace(/\r\n|\r|\n/gmi,"\r\n");

		//扫描依赖关系
		removeComments(str).replace(/[^.]\brequire\s*\(\s*['"]?([^'")]*)/g,function($0,id){
			
			var key = id.split('?')[0];
			
			if(!dependentMap[key]){
				dependent.push(id);
				dependentMap[key]= true;
			}
			if(!packDependentMap[key]){
				packDependent.push(id);
				packDependentMap[key]= true;
			}
		});

		str = str.replace(/(define\()[\W]*?(function)/gm,'define.pack("' + mname + '",' + JSON.stringify(dependent) + ',$2');

		res.push(str,'\n');


	});

	res.push(config.afterJS);
	
	moduleStr = moduleStr.replace('define(function','define(' + JSON.stringify(packDependent) + ',function');

	if(js.length){
		if(createOut){
			fs.writeFileSync(
				out,
				(moduleStr + res.join('')).replace(/\r\n|\r|\n/gmi,"\r\n"),
				'UTF-8'
			);
		}
	}else{
		logger.info('${o} is empty!!!',{o : out});
	}
	
	return {
		res: res,
		fileList: js,
		packDependent: packDependent
	};

}





