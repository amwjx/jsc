/**
 * watcher
 * 监听文件改变，适合文件数少时
 * @author youkunhuang
 *
 */

var logger		= require('./logger')(__filename),
	cp			= require('child_process'),
	fs			= require('fs'),
	config		= require('./config.js'),
	util		= require('./util.js'),
	path		= require('path'),
	cache		= {},
	filter		= config.filter,
	self		= {},
	callback;


module.exports = {
	watch : function(root,callback){
		
		var res;
		
		self.root = root;
		self.callback = callback;

		logger.info('root: ${root}',{root: root});

		res = util.getForderList(root,config.excludeForder);
		
		res.forEach(function(v,i){
			
			var list;
			
			logger.info('listen: ${dir}',{dir: v});
			
			try{
				
				if(cache[v]){
					return;
				}
				
				cache[v] = true;
				
				fs.watch(v,function(v){
					return function(event,file){
						
						var str = (v + '/' + file).replace(/[\/\\]/gmi,'/');
						var now =  +new Date();
						
						if(!filter.test(str)){
							return;
						}
						
						if(cache[str] && now - cache[str] < 10){
							return;
						}
						
						cache[str] = now;
						
						logger.info('${event}: ${str}',{
							event: event,
							str: str
						});
						
						callback(event,str);
						
					}
				}(v));
			}catch(e){
				
			}finally{
				list = tmp = fs.readdirSync(v);
				
				list.forEach(function(n,i){
					
					var file = (v + '/' + n).replace(/[\/\\]/gmi,'/');
					
					if(config.excludeFile.test(n)){
						return;
					}
					
					if(cache[file]){
						return;
					}
					
					cache[file] = true;
					
					try{
						
						filter.test(file) &&
						fs.watchFile(file, function(file){
							return function(curr, prev){
								var now =  +new Date();
								
								if(!filter.test(file)){
									return;
								}
								
								if(cache[file] && now - cache[file] < 10){
									return;
								}
								cache[file] = now;
								
								logger.info('${event}: ${str}',{
									event: 'change',
									str: file
								});
								
								callback('change',file);
							}
						}(file));
					}catch(e){
						
					}
					
					
				});
			}
			
			
		});
		
	}
}
