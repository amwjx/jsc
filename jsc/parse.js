
/**
 * 把模板编译成对象
 * @author youkunhuang
 * 
 */


var logger		= require('./logger')(__filename),
	config		= require('./config.js'),
	vm			= require('vm'),
	fs			= require("fs"),
	path		= require('path'),
	undefined;

module.exports = parse;

/**
 * 合并文件
 * @param {String} opt.file 文件名，绝对路径
 * @param {String} opt.path 文件目录
 * @param {String} opt.context 上下文
 */
function parse(opt){
	
	var text,script,
		context,
		code,
		i,len,index,result,
		regTmpl = /<script([^<>]+?)type="text\/html"([^<>]*?)>(?:\r\n|\r|\n)?([\w\W\r\n]*?)<\/script>/gmi,
		regCode = /<script([^<>]+?)runat="server"([^<>]*?)>([\w\W\r\n]*?)<\/script>(?:\r\n|\r|\n)?/gmi,
		regScript = /<script([^<>]+?)>([\w\W\r\n]*?)<\/script>/gmi,
		idmap = {},
		isID = /id="(.+?)"/i,
		exec,
		id,tmp,res,
		undefined;
	
	opt.base = opt.base || '';
	opt.file = opt.file;
	opt.file = opt.file.replace(/^seajs:/,opt.seajsRoot + '/');
	opt.file = path.resolve(opt.base,opt.file);
	opt.path = opt.path || opt.file.replace(/^(.*?)[^\/]+$/,'$1');
	opt.seajsRoot = opt.seajsRoot;
	opt.cache = opt.cache || {};
		
	if(opt.cache[opt.file]){
		return opt.cache[opt.file];
	}else{
		opt.cache[opt.file] = {};
	}
	
	text = fs.readFileSync(opt.file,'UTF-8');
	
	//去除utf-8文件头的BOM标记
	text = text.replace(/^[\ufeff\ufffe]/,'');
	text = text.replace(/\r\n|\r|\n/gmi,"\r\n");
	
	//解析模板id
	while(exec  =  regTmpl.exec(text)){
		
		tmp = exec[0] + exec[1];
		
		if(!isID.test(tmp)){
			continue;
		}
		
		id = isID.exec(tmp)[1];
		
		code = exec[3];
		
		idmap[id] = code;
	}
	
	
	//解析output
	res = [];
	index = 0;
	
	while(exec  =  regScript.exec(text)){
		
		len = exec[0].length;
		
		if(index !== exec.index){
			code = text.slice(index,exec.index);
			code = code.replace(/\$\{([^\}]*)\}/gmi,'<script runat="server">output($1);\n</script>\n');
			
			res.push(code);
		}
		
		index = exec.index + len;
		
		res.push(exec[0]);
		
	}
	
	code = text.slice(index);
	code = code.replace(/\$\{([^\}]*)\}/gmi,'<script runat="server">output($1);\n</script>\n');
			
	res.push(code);
	
	script = res.join('');
	
	//解析非代码
	res = [];
	index = 0;
	
	while(exec  =  regCode.exec(script)){
		
		len = exec[0].length;
		
		if(index !== exec.index){
			res.push("output(__script.slice(",index,',',exec.index,"));\r\n");
		}
		
		index = exec.index + len;
		
		code = exec[3];
		
		res.push(code);
		
	}
	
	res.push("output(__script.slice(",index,"));\r\n");
	
	code = res.join('');
	
	result = [];
	
	context = {
		__content: text,
		__script: script,
		__code: code,
		__getResult: function(){
			return result.join('');
		},
		tmpl: idmap,
		console: console,
		logger: require('./logger')(opt.file),
		exports: {
			tmpl : idmap,
			getContent: function(text){
				return function(){
					return text;
				};
			}(text),
			getResult: function(){
				return result.join('');
			}
		}
	};
	
	context.self = context;
	
	context.output = function(str){
		result.push(arguments.length > 0 ? str : '');
	};
	
	context.outputln = function(str){
		result.push(str);
		result.push('\n');
	};
	
	context.require = function(base,cache,seajsRoot){
		return function(file){
			var res = parse({
				file: file,
				base: base,
				seajsRoot: seajsRoot,
				cache: cache
			});
			
			return res.exports;
		}
	}(opt.path,opt.cache,opt.seajsRoot);
	
	try{
		vm.runInNewContext(code, context, opt.file);
	}catch(e){
		context.logger.error(e.stack);
		result.push(e.stack);
	}
	
	opt.cache[opt.file] = {
		exports: context.exports,
		result: context.__getResult()
	};
	
	return opt.cache[opt.file];
	
}

