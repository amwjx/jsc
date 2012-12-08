/**
 * Logger
 * @author youkunhuang
 * 
 */


var config = require('./logger.config'),
	logLevel = config.logLevel || 0,
	fs = require('fs'),
	path = require('path'),
	vm = require('vm'),
	logger,
	filter = function(){},
	undefined;

module.exports = function(filename,log){
	return new Logger(filename,log);
};

module.exports.Logger = Logger;


/**
 * Logger tools
 * @author youkunhuang
 * @param {String} filename 文件名
 * @param {Function} log 自定义日志处理函数
 * @return {Logger} Logger实例
 */
function Logger(filename,log){
	
	filename		= String(filename).replace(/\\/g,'/');
	this.basePath	= __dirname + '/';
	this.filename	= filename || '';
	this.file		= this.filename.indexOf(this.basePath) === -1 ? 
						this.filename.replace(/^.*?([^\/]+)$/,'$1') : 
						this.filename.slice(this.basePath.length);
						
	this.log		= log;
	this.logLevel	= logLevel;
	
	return this;
}

Logger.prototype = {
	
	debug : function(str,obj){
		
		var allow =  filter(10,str,obj);
		
		if(allow === true){
			return this.asyncLog(this.getLog('DBUG',str,obj));
		}else if(allow === false){
			return this;
		}else{
			return this.logLevel > 10 ? this : this.asyncLog(this.getLog('DBUG',str,obj));
		}
		
	},
	
	info : function(str,obj){
		
		var allow =  filter(20,str,obj);
		
		if(allow === true){
			return this.asyncLog(this.getLog('INFO',str,obj));
		}else if(allow === false){
			return this;
		}else{
			return this.logLevel > 20 ? this : this.asyncLog(this.getLog('INFO',str,obj));
		}
		
	},
	
	warn : function(str,obj){
		var allow =  filter(30,str,obj);
		
		if(allow === true){
			return this.asyncLog(this.getLog('WARN',str,obj));
		}else if(allow === false){
			return this;
		}else{
			return this.logLevel > 30 ? this : this.asyncLog(this.getLog('WARN',str,obj));
		}
	},
	
	error : function(str,obj){
		var allow =  filter(40,str,obj);
		
		if(allow === true){
			return this.asyncLog(this.getLog('ERRO',str,obj));
		}else if(allow === false){
			return this;
		}else{
			return this.logLevel > 40 ? this : this.asyncLog(this.getLog('ERRO',str,obj));
		}
	},
	
	getLog: function(type,str,obj){
		
		var orig,err,stack,line,filename,column,method;
		
		orig		= Error.prepareStackTrace;
	    Error.prepareStackTrace = function(_, stack){ return stack; };
	    err			= new Error;
	    Error.captureStackTrace(err, arguments.callee.caller);
	    stack		= err.stack;
	    Error.prepareStackTrace = orig;
		
		if(stack && stack[0]){
			line		= stack[0].getLineNumber();
			column		= stack[0].getColumnNumber();
			filename	= stack[0].getFileName() || this.file;
		}
		
		filename	= filename || this.file;
		filename	= filename.replace(/^.*[\/\\](.+)$/gmi,'$1');
		
		var now = new Date();
		var str = merge(config.logFormat,{
			yyyy 	: now.getFullYear(),
			MM		: zeroize(now.getMonth() + 1,2),
			dd		: zeroize(now.getDate(),2),
			HH		: zeroize(now.getHours(),2),
			mm		: zeroize(now.getMinutes(),2),
			ss		: zeroize(now.getSeconds(),2),
			type	: type,
			file	: filename,
			txt		: merge(str,obj),
			line	: zeroize(line,4,'    '),
			column	: column
			
		});
		
		return str;
	},
	
	asyncLog: function(str){
		this.log ?
			this.log(str) :
				console.log(str);
			
		return this;
	},
	
	merge: merge,
	zeroize: zeroize
}

/**
 * 合并对象到字符串中
 * @author youkunhuang
 * @param {String} str 模板
 * @param {Object} obj 待合并的对象
 * @return {String} 合并后的字符串
 */
function merge(str,obj){
		
	return str && str.replace(/\$\{(.+?)\}/g,function($0,$1){
		
		var rs = obj && obj[$1];
		var undefined;
		
		return rs === undefined ? '' :
			typeof rs === 'string' ? rs : 
			Buffer.isBuffer(rs) ? rs.toString('base64') : 
			String(rs);
	});
}

/**
 * 数字加前导0
 * @author youkunhuang
 * @param {Number} num 一个整数
 * @param {Number} width 总宽度
 * @return {String} 加完前导0的字符串
 * 
 */
function zeroize(num,width,fill){
	var s = String(num),
		len = s.length;
	return len >= width ? s : (fill || '0000000000000000').slice(len - width) + s;
}

/**
 * 
 * 从文件中读取过滤器文件内容
 * 
 */
function getCodeFromFile(){
	
	var filename = __dirname + '/logger.filter.js',
		code;
	
	if(!(fs.existsSync || path.existsSync)(filename)){
		
		return;
	}
	
	code = fs.readFileSync(filename,'UTF-8');
	
	return code;
}

/**
 * 返回过滤器
 */
function getFilter(){
	
	var code,filter,sandbox;
	
	sandbox = {
		console: console
	};
	
	code = getCodeFromFile();
	
	if(code === undefined){
		return;
	}
	
	vm.runInNewContext(code, sandbox, 'logger.filter.js');
	
	return function(){
		try{
			if(typeof sandbox.filter !== 'function'){
				return ;
			}
			
			return sandbox.filter.apply(sandbox,arguments);
		}catch(e){}
	};
	
}

logger = new Logger(__filename);
filter = getFilter();

try{
	
	fs.watch(__dirname + '/logger.filter.js',function(){
		
		logger.info('reload logger.filter.js');
		
		filter = getFilter();
		
	});
	
}catch(e){
	
	fs.watchFile(__dirname + '/logger.filter.js',function(){
		
		logger.info('reload logger.filter.js');
		
		filter = getFilter();
		
	});
}


