/**
 * queue tools
 * @author youkunhuang
 * 
 */

module.exports = Queue;

function Queue(){
	
	this.q = [];
	
	return this;
}

Queue.prototype = {
	
	queue: function(fn){
		
		if(fn.length > 1){
			var args = [].slice.apply(arguments,[0]);
			args[0] = this;
			
			this.q.push(function(fn,args){
				return function(){
					fn.apply(this,args);
				}
			}(fn,args));
		}else{
			this.q.push(fn);
		}
		
		if(this.q[0] !== 'inprogress'){
			this.dequeue();
		}
		
		return this;
	},
	
	dequeue: function(){
		var fn = this.q.shift();
		
		if(fn === 'inprogress'){
			fn = this.q.shift();
		}
		
		if(typeof fn === 'function'){
			this.q.unshift('inprogress');
			fn.call(this,this);
		}
		
		return this;
	},
	
	clear: function(){
		this.q[0] === 'inprogress' ?
			this.q = ['inprogress'] :
			this.q = [];
		return this;
	}
};
