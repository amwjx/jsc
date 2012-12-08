
/**
 * 
 * 包装配置文件
 * 
 * @param {Object} config
 */
module.exports = function(config){
	
	var path = require('path');
	var args = {};
	
	//解析进程参数
	for(i = 2; i< process.argv.length; i++){
		process.argv[i].replace(/(.+)=(.+)/,function($0,$1,$2){
			args[$1] = $2;
		});
	}
	
	config.seajsRoot = path.resolve(config.seajsRoot,args.root || '');
		
}
