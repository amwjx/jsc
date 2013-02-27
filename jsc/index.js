
/**
 * jsc
 * @author youkunhuang
 * @param m module目录
 * @param listen 是否监听文件改变
 * @param all 是否编译所有目录
 *
 */


var logger		= require('./logger')(__filename),
	config		= require('./config.js'),
	fs			= require("fs"),
	path		= require('path'),
	Queue		= require('./queue.js'),
	q			= new Queue(),
	args		= {},								//进程参数
	seajsRoot	= path.resolve(__dirname,config.seajsRoot),
	jsc			= require('./jsc.js'),
	cdnPath		= require('./cdn.path.js'),
	modulePath,
	undefined;

//阻止进程因异常而退出
process.on('uncaughtException',function(e){
	logger.error(e.stack);
});

//解析进程参数
for(i = 2; i< process.argv.length; i++){
	process.argv[i].replace(/(.+)=(.+)/,function($0,$1,$2){
		args[$1] = $2;
	});
}

work(args);

q.queue(function(){
	if(args.all === 'yes' || args.listen === 'no'){
		setTimeout(function(){
			process.exit(0);
		},300);
	}

	this.dequeue();
});


function work(args){
	
	var modulePath	= path.resolve(seajsRoot,args.m),
		undefined;
	
	//去除src目录,可以直接给完整目录路径
	modulePath = path.normalize(modulePath).replace(/\\/gi,'/');
	modulePath = modulePath.replace(/([^\/])$/gi,'$1/');
	modulePath = modulePath.replace(/\/([^\/]*\.)?src\/?$/gi,'/');
	
	if(modulePath.indexOf('/.svn/') !== -1){
		return;
	}
	
	if(modulePath.indexOf('/src/') !== -1){
		return;
	}
	
	logger.info(modulePath);
	
	args.listen = args.listen === 'no' ? 'no' : 'yes';
	args.all = args.all === 'yes' ? 'yes' : 'no';
	
	if(args.all === 'yes'){
		
		args.listen = 'no';

		(function(){

			var res,tmp,undefined;
			
			
			if(!(fs.existsSync || path.existsSync)(modulePath)){
				return;
			}
			
			tmp = fs.readdirSync(modulePath);
			
			tmp.forEach(function(n,i){
				var filePath = modulePath + '/' + n,
					fileState = fs.statSync(filePath);
				if( fileState.isDirectory()){
					work({
						m: args.m + '/' + n + '/',
						all: 'yes',
						listen: 'no'
					});
				}else if(fileState.isFile() && !/\/src\/.+/gmi.test(filePath)){
					cdnPath.modify(filePath);
				}
			});
			
			

		})();
	}


	//logger.info('seajsRoot: ${seajsRoot}',{seajsRoot : seajsRoot});
	//logger.info('module: ${modulePath}',{modulePath : modulePath.slice(seajsRoot.length + 1)});

	if(args.m){
		q.queue(function(queue){
			
			jsc({
				seajsRoot: seajsRoot,
				modulePath: modulePath,
				listen: args.listen === 'yes',
				callback: function(){
					queue.dequeue();
				}
			});
		});
		
	}else{
		logger.error('need module path!');
		logger.info('example: node jsc m=module/feed/');
		setTimeout(function(){
			process.exit(0);
		},300);
	}

};

