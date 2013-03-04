(function( jQuery ) {

/**
 * Callback 可以理解为一种数据结构，函数的数据结构
 */
	
	
// String to Object flags format cache
var flagsCache = {};

// Convert String-formatted flags into Object-formatted ones and store in cache
// 创建一个标识：一个用空格标记分隔的标志可选列表,用来改变回调列表中的行为
function createFlags( flags ) {
	var object = flagsCache[ flags ] = {},
		i, length;
	flags = flags.split( /\s+/ );
	for ( i = 0, length = flags.length; i < length; i++ ) {
		object[ flags[i] ] = true;
	}
	/**
	 * object = {
	 * 	'once': true,
	 *  'memory': true,
	 *  'unique': true,
	 *  'stopOnFalse': true
	 * }
	 */
	return object;
}

/* 创建一个回调列表的参数如下
 * Create a callback list using the following parameters:
 *
 *	flags:	an optional list of space-separated flags that will change how
 *			the callback list behaves
 *
 * 默认情况下，回调列表将像事件的回调列表中可以多次触发。
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible flags:
 * 
 *  确保这个回调列表只执行一次(像一个递延 Deferred).
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *  
 *  保持以前的值和将添加到这个列表的后面的最新的值立即执行调用任何回调 (像一个递延 Deferred).
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *  
 *  确保一次只能添加一个回调(所以有没有在列表中的重复).
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *  
 *  当一个回调返回false 时中断调用
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( flags ) {

	// Convert flags from String-formatted to Object-formatted 从字符串格式到对象格式转换标识
	// (we check in cache first)
	flags = flags ? ( flagsCache[ flags ] || createFlags( flags ) ) : {};

	var // Actual callback list 真正的回调列表
		list = [],
		// Stack of fire calls for repeatable lists 触发可重复的列表的栈
		stack = [],
		// Last fire value (for non-forgettable lists) list中记住的  最后触发的值  
		memory,
		// Flag to know if list was already fired 通过这个标识可以知道 回调列表是否已经触发
		fired,
		// Flag to know if list is currently firing 通过这个标识可以知道当前正在触发的回调列表
		firing,
		// First callback to fire (used internally by add and fireWith) 触发第一个回调函数，内部使用
		firingStart,
		// End of the loop when firing 结束循环时触发
		firingLength,
		// Index of currently firing callback (modified by remove if needed) 当前触发回调的索引
		firingIndex,
		// Add one or several callbacks to the list 添加一个或者多个回调到列表
		add = function( args ) {
			var i,
				length,
				elem,
				type,
				actual;
			for ( i = 0, length = args.length; i < length; i++ ) {
				elem = args[ i ];
				type = jQuery.type( elem );
				if ( type === "array" ) {
					// Inspect recursively 检查递归
					add( elem );
				} else if ( type === "function" ) {
					// Add if not in unique mode and callback is not in
					// 两种情况下添加到list中：list中不是唯一的或者回调不包含在list中
					if ( !flags.unique || !self.has( elem ) ) {
						list.push( elem );
					}
				}
			}
		},
		// Fire callbacks 触发回调
		fire = function( context, args ) {
			args = args || [];
			memory = !flags.memory || [ context, args ];
			fired = true;
			firing = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			//触发list中的所有回调
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( context, args ) === false && flags.stopOnFalse ) {
					memory = true; // Mark as halted 结束标识
					break;
				}
			}
			firing = false;
			// 下面这一段时干啥没有看明白
			if ( list ) {
				if ( !flags.once ) {
					if ( stack && stack.length ) {
						memory = stack.shift();
						self.fireWith( memory[ 0 ], memory[ 1 ] );
					}
				} else if ( memory === true ) {
					self.disable();
				} else {
					list = [];
				}
			}
		},
		// Actual Callbacks object 真正的回调对象
		self = {
			// 给list添加一个回调或者添加一个集合中的回调
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					var length = list.length;
					add( arguments );
					// Do we need to add the callbacks to the current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away, unless previous
					// firing was halted (stopOnFalse)
					} else if ( memory && memory !== true ) {
						firingStart = length;
						fire( memory[ 0 ], memory[ 1 ] );
					}
				}
				return this;
			},
			// 从list中删除一个回调
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					var args = arguments,
						argIndex = 0,
						argLength = args.length;
					for ( ; argIndex < argLength ; argIndex++ ) {
						for ( var i = 0; i < list.length; i++ ) {
							if ( args[ argIndex ] === list[ i ] ) {
								// Handle firingIndex and firingLength
								if ( firing ) {
									if ( i <= firingLength ) {
										firingLength--;
										if ( i <= firingIndex ) {
											firingIndex--;
										}
									}
								}
								// Remove the element
								list.splice( i--, 1 );
								// If we have some unicity property then
								// we only need to do this once
								if ( flags.unique ) {
									break;
								}
							}
						}
					}
				}
				return this;
			},
			// 判断一个回调是否在list中
			// Control if a given callback is in the list
			has: function( fn ) {
				if ( list ) {
					var i = 0,
						length = list.length;
					for ( ; i < length; i++ ) {
						if ( fn === list[ i ] ) {
							return true;
						}
					}
				}
				return false;
			},
			// 删除list中的所有的回调
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore 禁用
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled? 判断是否禁用
			disabled: function() {
				return !list;
			},
			// 锁定当前list中的状态
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory || memory === true ) {
					self.disable();
				}
				return this;
			},
			// Is it locked? 判断是否锁定
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			// 调用所有的回调根据上下文和参数
			fireWith: function( context, args ) {
				if ( stack ) {
					if ( firing ) {
						if ( !flags.once ) {
							stack.push( [ context, args ] );
						}
					} else if ( !( flags.once && memory ) ) {
						fire( context, args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			// 调用所有的回调根据参数
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			// 判断回调是否至少调用过一次
			fired: function() {
				return !!fired;
			}
		};

	return self;
};

})( jQuery );
