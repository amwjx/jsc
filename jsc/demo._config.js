/**
 * 打包配置默认选项
 */
define(function(require, exports, module){

	return {
		
		dir: './',					//重新指定合并后文件的存放目录
		
		all: {
			name: 'index.js',		//重新指定合并后的文件名
			create: true,			//生成
			uglify: true
		},
		
		js: {
			name: 'js.js',			//重新指定合并后的文件名
			create: false,			//不生成
			sort: function(arr){	//自定义排序
				return arr;
			},
			uglify: true
		},
		
		tmpl: {
			name: 'tmpl.js',		//重新指定合并后的文件名
			create: false			//不生成
		}
		
	};
	
});