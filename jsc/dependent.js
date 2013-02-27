
/**
 * jsc：把模板转换成js，合并js
 * @author youkunhuang
 *
 */


var logger		= require('./logger')(__filename),
	removeComments 	= require('./removeComments.js'),
	undefined;

this.getDependent = function(str){
	
	var 
		dependentMap	= {},
		dependent		= [],
		str				= str || '',
		undefined;
	
	
	//扫描依赖关系
	removeComments(str).replace(/[^.]\brequire\s*\(\s*['"]?([^'")]*)/g,function($0,id){
		var key = id.split('?')[0];
		
		if(!dependentMap[key]){
			dependent.push(id);
			dependentMap[key]= true;
		}
	});
	
	return dependent;
}
