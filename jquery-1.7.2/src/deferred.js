(function( jQuery ) {

var // Static reference to slice
	// 这么做的目的是啥啊
	// 原因是：arguments没有slice方法，借鸡生蛋
	sliceDeferred = [].slice;

/*
 * 
 * 参考文章： 
 * 1.在jQuery 1.5中使用deferred对象 ------ http://www.cnblogs.com/sanshi/archive/2011/03/10/1980195.html
 * 2.在jQuery1.5中使用deferred对象 - 拿着放大镜看Promise ------ http://www.cnblogs.com/sanshi/archive/2011/03/11/1981789.html
 * 
 */


jQuery.extend({
	//异步队列
	Deferred: function( func ) {
		var doneList = jQuery.Callbacks( "once memory" ),
			failList = jQuery.Callbacks( "once memory" ),
			progressList = jQuery.Callbacks( "memory" ),
			//当前状态时：挂起(等待)
			state = "pending",
			//异步队列分为三部分：成功队列，失败队列，正在执行的队列
			lists = {
				resolve: doneList,
				reject: failList,
				notify: progressList
			},
			//承诺、约定
			promise = {
				done: doneList.add,
				fail: failList.add,
				progress: progressList.add,
				
				state: function() {
					return state;
				},

				// Deprecated 这两个方法已经过时
				isResolved: doneList.fired,
				isRejected: failList.fired,

				then: function( doneCallbacks, failCallbacks, progressCallbacks ) {
					deferred.done( doneCallbacks ).fail( failCallbacks ).progress( progressCallbacks );
					return this;
				},
				always: function() {
					deferred.done.apply( deferred, arguments ).fail.apply( deferred, arguments );
					return this;
				},
				pipe: function( fnDone, fnFail, fnProgress ) {
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( {
							done: [ fnDone, "resolve" ],
							fail: [ fnFail, "reject" ],
							progress: [ fnProgress, "notify" ]
						}, function( handler, data ) {
							var fn = data[ 0 ],
								action = data[ 1 ],
								returned;
							if ( jQuery.isFunction( fn ) ) {
								deferred[ handler ](function() {
									returned = fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise().then( newDefer.resolve, newDefer.reject, newDefer.notify );
									} else {
										newDefer[ action + "With" ]( this === deferred ? newDefer : this, [ returned ] );
									}
								});
							} else {
								deferred[ handler ]( newDefer[ action ] );
							}
						});
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					if ( obj == null ) {
						obj = promise;
					} else {
						for ( var key in promise ) {
							obj[ key ] = promise[ key ];
						}
					}
					return obj;
				}
			},
			deferred = promise.promise({}),
			key;

		for ( key in lists ) {
			deferred[ key ] = lists[ key ].fire;
			deferred[ key + "With" ] = lists[ key ].fireWith;
		}

		// Handle state 状态处理
		deferred.done( function() {
			state = "resolved";
		}, failList.disable, progressList.lock ).fail( function() {
			state = "rejected";
		}, doneList.disable, progressList.lock );

		// Call given func if any
		if ( func ) {
			//这一行看不不懂啊
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	// 异步队列工具函数
	// firstParam：一个或多个Deferred对象或JavaScript普通对象
	when: function( firstParam ) {
		var args = sliceDeferred.call( arguments, 0 ),
			i = 0,
			length = args.length,
			pValues = new Array( length ),
			count = length,
			pCount = length,
			// 如果arguments.length等于1,并且firstParam是Deferred，则deferred=firstParam
	        // 否则创建一个新的Deferred对象（如果arguments.length等于0或大于1，则创建一个新的Deferred对象）
		    // 通过jQuery.isFunction( firstParam.promise )简单的判断是否是Deferred对象
			deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
				firstParam :
				jQuery.Deferred(),
			promise = deferred.promise();
		
		 // 构造成功（resolve）回调函数
		function resolveFunc( i ) {
			return function( value ) {
				 // 如果传入的参数大于一个，则将传入的参数转换为真正的数组（arguments没有slice方法，借鸡生蛋）
				args[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				if ( !( --count ) ) {
					// 执行成功回调函数队列，上下文强制为传入的第一个Deferred对象
					deferred.resolveWith( deferred, args );
				}
			};
		}
		
		function progressFunc( i ) {
			return function( value ) {
				pValues[ i ] = arguments.length > 1 ? sliceDeferred.call( arguments, 0 ) : value;
				deferred.notifyWith( promise, pValues );
			};
		}
		if ( length > 1 ) {
			for ( ; i < length; i++ ) {
				if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
					args[ i ].promise().then( resolveFunc(i), deferred.reject, progressFunc(i) );
				} else {
					--count;
				}
			}
			if ( !count ) {
				deferred.resolveWith( deferred, args );
			}
		} else if ( deferred !== firstParam ) {
			deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
		}
		return promise;
	}
});

})( jQuery );
