/**
 * 显示投票结果
 */
define(function(require,exports,module){

	var $ = require('example.v1/lib/jquery');
	var tmpl = require('./tmpl');

	return {
		
		init: function(content){
			$('body').html(tmpl.pageBody());
		}
		
	}

});


