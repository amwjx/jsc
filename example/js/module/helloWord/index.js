//create by jsc 
(function(){
var mods = [],version = parseFloat(seajs.version);
define(["example.v1/lib/jquery"],function(require,exports,module){

	var uri		= module.uri || module.id,
		m		= uri.split('?')[0].match(/^(.+\/)([^\/]*?)(?:\.js)?$/i),
		root	= m && m[1],
		name	= m && ('./' + m[2]),
		i		= 0,
		len		= mods.length,
		curr,args,
		undefined;
	
	//unpack
	for(;i<len;i++){
		args = mods[i];
		if(typeof args[0] === 'string'){
			name === args[0] && ( curr = args[2] );
			args[0] = root + args[0].replace('./','');
			(version > 1.0) &&	define.apply(this,args);
		}
	}
	mods = [];
	require.get = require;
	return typeof curr === 'function' ? curr.apply(this,arguments) : require;
});
define.pack = function(){
	mods.push(arguments);
	(version > 1.0) || define.apply(null,arguments);
};
})();
//all file list:
//helloWord/src/init.js
//helloWord/src/helloWord.tmpl.html



//js file list:
//helloWord/src/init.js



/**
 * 显示投票结果
 */
define.pack("./init",["example.v1/lib/jquery","./tmpl"],function(require,exports,module){

	var $ = require('example.v1/lib/jquery');
	var tmpl = require('./tmpl');

	return {
		
		init: function(content){
			$('body').html(tmpl.pageBody());
		}
		
	}

});






//tmpl file list:
//helloWord/src/helloWord.tmpl.html


define.pack("./tmpl",[],function(require, exports, module){
var tmpl = { 
'pageBody': function(data){

var __p=[],_p=function(s){__p.push(s)};
__p.push('<div style="width: 400px; padding: 50px; font-size: 48px; margin: 0 auto; text-align: center; font-weight: bold;">');
_p(tmpl.world());
__p.push('</div>');

return __p.join("");
},

'world': function(data){

var __p=[],_p=function(s){__p.push(s)};

	var str = 'Hello World!',
		colors = ['red','yellow','blue','black','#F0F','#0FF'],
		color,
		i,len;
	
	for(i = 0, len = str.length; i<len ;i++){
		color = colors[i % colors.length];
		__p.push('<span style="color:');
_p(color);
__p.push('">');
_p(str.charAt(i));
__p.push('</span>');

	}
__p.push('');

return __p.join("");
}
};
return tmpl;
});
