var jQuery = (function() {

	
	/**
	 * 参考文章：http://www.cnblogs.com/fjzhou/archive/2011/05/27/jquery-source-2.html
	 */
	
	
	
// Define a local copy of jQuery
// (选择器，上下文)
var jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		//这里rootjQuery的作用不明白
		return new jQuery.fn.init( selector, context, rootjQuery );
	},
	
	
	//如果在jquery之前引入其他的库，而这些库中jQuery，$被使用，
	//下面两行的作用的是如果jQuery，$被使用，则交出jQuery，$的使用权
	
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// A central reference to the root jQuery(document)
	// 我的理解是rootjQuery 这个也是一个上下文，不过这个上下文是个根上下文，也是就是说是个最大的上下文
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// 匹配不是<开始的字符串，区分是#xxx，还是其他的html字符串
	quickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,

	// Check if a string has a non-whitespace character in it
	//非空格
	rnotwhite = /\S/,

	// Used for trimming whitespace
	//左边空格
	trimLeft = /^\s+/,
	//右边空格
	trimRight = /\s+$/,

	// Match a standalone tag
	//匹配单个的标签，如<div/>
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,

	// Useragent RegExp
	//webkit 浏览器
	rwebkit = /(webkit)[ \/]([\w.]+)/,
	//opera 浏览器
	ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
	//ie 浏览器
	rmsie = /(msie) ([\w.]+)/,
	//firefox 浏览器
	rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,

	// Matches dashed string for camelizing
	//匹配 - 的驼峰标示
	rdashAlpha = /-([a-z]|[0-9])/ig,
	rmsPrefix = /^-ms-/,

	// Used by jQuery.camelCase as callback to replace()
	//这个方法看不明白
	fcamelCase = function( all, letter ) {
		return ( letter + "" ).toUpperCase();
	},

	// Keep a UserAgent string for use with jQuery.browser
	userAgent = navigator.userAgent,

	// For matching the engine and version of the browser
	browserMatch,

	// The deferred used on DOM ready
	readyList,

	// The ready event handler
	DOMContentLoaded,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwn = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	trim = String.prototype.trim,
	indexOf = Array.prototype.indexOf,

	// [[Class]] -> type pairs
	class2type = {};

jQuery.fn = jQuery.prototype = {
	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem, ret, doc;
		
		/*
		 * 选择器分一下几种情况
		 * 
		 * 1. Handle $(""), $(null), or $(undefined) 为空
		 * 2. Handle $(DOMElement) DOM节点
		 * 3. Handle $("body") body 优化，为啥要这样做啊
		 * 4. Handle HTML strings 这个里面分为两种：
		 *    * $("<div>hello</div>") $("sss<div>hello</div>ddd")
		 *    * $("#id")
		 * 
		 * 5. $(expr, $(...)) 选择表达式  $("a.className") === rootjQuery.find('a.className')
		 * 6. HANDLE: $(function) 函数 
		 * 
		 * 
		 */
		
		
		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The body element only exists once, optimize finding it
		if ( selector === "body" && !context && document.body ) {
			this.context = document;
			this[0] = document.body;
			this.selector = selector;
			this.length = 1;
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with HTML string or an ID?
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				//匹配 $('<div>hello</div>')
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				//匹配 $('dddd<div>hello</div>ssss')
				match = quickExpr.exec( selector );
			}

			/*
			 * match 说明
			 * [要匹配字符串原始的内容, 匹配字符串匹配后的结果, 这个还不知道]
			 * [#id, undefined, id]
			 */
			
			
			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;
					doc = ( context ? context.ownerDocument || context : document );

					// If a single string is passed in and it's a single tag
					// just do a createElement and skip the rest
					ret = rsingleTag.exec( selector );

					if ( ret ) {
						//处理$('<div/>')
						
						if ( jQuery.isPlainObject( context ) ) {
							//处理$('<div/>', {'width': 10, ...})
							selector = [ document.createElement( ret[1] ) ];
							jQuery.fn.attr.call( selector, context, true );

						} else {
							//处理$('<div/>')
							selector = [ doc.createElement( ret[1] ) ];
						}

					} else {
						//处理 $('dddd<div>hello</div>ssss')
						//处理 $('<div>hello</div>')
						// 这个方法在后面，core.js文件中没有。
						// 使用一个文档碎片，把所有的新节点附加其上，然后把文档碎片一次性添加到document中
						ret = jQuery.buildFragment( [ match[1] ], [ doc ] );
						selector = ( ret.cacheable ? jQuery.clone(ret.fragment) : ret.fragment ).childNodes;
					}

					return jQuery.merge( this, selector );

				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	// 选择器,就是括号中的字符串   $('selector')
	// eg: 1. $("#qunit-fixture").filter("div") 的selector = #qunit-fixture.filter(div)
	// 2.  $("#qunit-fixture")  的selector = #qunit-fixture
	selector: "",

	// The current version of jQuery being used
	jquery: "@VERSION",
	
	//大家发现这个length和size说的一回事，为啥又分为两个，
	//我的理解是：length是从数组的完备性来考虑的，而size则是从对象的角度来考虑
	//jquery是个对象，也可以转化为数组
	
	// The default length of a jQuery object is 0
	// jquery对象是个伪数组,返回数组的长度，这个
	length: 0,

	// The number of elements contained in the matched element set
	// 当前jquery对象的大小,既这个类数组的长度
	size: function() {
		return this.length;
	},
	//返回一个数组
	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	// 想数组一样获得jquery对象中元素, 这个num可以使正数，也可以是负数, 当让也可以为空，则以数组的方式jquery中的所有元素
	// 注意返回的可不是jquery对象
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	// 就是说把elems包装成jquery对象返回
	pushStack: function( elems, name, selector ) {
		// Build a new jQuery matched element set
		// 新建一个jquery对象
		var ret = this.constructor();
		
		// 添加elems到jquery对象中
		if ( jQuery.isArray( elems ) ) {
			//数组
			push.apply( ret, elems );

		} else {
			jQuery.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + ( this.selector ? " " : "" ) + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Attach the listeners
		jQuery.bindReady();

		// Add the callback
		readyList.add( fn );

		return this;
	},
	//返回jquery集合中的第i个元素，这里返回的可视jquery对象
	//这个i可以是正数，也可以是负数
	eq: function( i ) {
		//这一行的作用是啥啊？
		i = +i;
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, i + 1 );
	},
	//返回jquery集合中的第一个元素，这里返回的可视jquery对象
	first: function() {
		return this.eq( 0 );
	},
	//返回jquery集合中的最后一个元素，这里返回的可视jquery对象
	last: function() {
		return this.eq( -1 );
	},
	//数组切分
	slice: function() {
		return this.pushStack( slice.apply( this, arguments ), "slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},
	// 返回节点链式操作前一次操作的节点,要是没有前一个节点，则返回空的jquery对象
	// equal( "Yahoo", jQuery("#yahoo").parent().end().text(), "Check for end" );
	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

/**
 * 
 *   如果传入两个或多个对象，所有对象的属性会被添加到第一个对象target,相同的属性值会被后面的覆盖
 *   
 *	 如果只传入一个对象，则将对象的属性添加到jQuery对象中。
 *
 *	 用这种方式，我们可以为jQuery命名空间增加新的方法。可以用于编写jQuery插件。
 *
 *	 如果不想改变传入的对象，可以传入一个空对象：$.extend({}, object1, object2);
 *
 *	 默认合并操作是不迭代的，即便target的某个属性是对象或属性，也会被完全覆盖而不是合并
 *	 第一个参数是true，则会迭代合并从object原型继承的属性会被拷贝
 *
 *	 undefined值不会被拷贝, 因为性能原因，JavaScript自带类型的属性不会合并
 *
 *	 jQuery.extend( target, object1, ... , objectN )
 * 	 jQuery.extend( [ deep ], target, object1, ... , objectN )
 */
jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	//处理深度拷贝
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	// 处理第一个参数，如果第一个参数不是个对象，也不是函数， 就初始化为一个空的对象
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	// 如果就一个参数，则扩展jquery
	if ( length === i ) {
		target = this;
		--i;
	}
	//开始扩展
	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		// 这里只处理不为null和undefined的值
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			//扩展基本对象
			for ( name in options ) {
				//原来的
				src = target[ name ];
				//要扩展的
				copy = options[ name ];

				// Prevent never-ending loop
				// 翻译过来时防止死循环，不过还是没有看明白
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				//递归，如果是纯对象或数组则合并
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						// clone = (src && jQuery.isArray(src)) ? src : [];
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			//注意这里的$可不是jQuery中的$，而是在引jQuery之前的那个库中的$
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			//注意这里的jQuery可不是jQuery中的jQuery，而是在引jQuery之前的那个库中的jQuery
			window.jQuery = _jQuery;
		}
		
		//注意这里的jQuery可是jQuery中的jQuery，而不是在引jQuery之前的那个库中的jQuery
		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	// DOM是否加载成功标示
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	// 一个计数器，用于跟踪在ready事件出发前的等待次数
	readyWait: 1,

	// Hold (or release) the ready event
	//继续等待或触发
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {
		// Either a released hold or an DOMready/load event and not yet ready
		if ( (wait === true && !--jQuery.readyWait) || (wait !== true && !jQuery.isReady) ) {
			// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
			if ( !document.body ) {
				return setTimeout( jQuery.ready, 1 );
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.fireWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.trigger ) {
				jQuery( document ).trigger( "ready" ).off( "ready" );
			}
		}
	},

	bindReady: function() {
		if ( readyList ) {
			return;
		}

		readyList = jQuery.Callbacks( "once memory" );

		// Catch cases where $(document).ready() is called after the
		// browser event has already occurred.
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			return setTimeout( jQuery.ready, 1 );
		}

		// Mozilla, Opera and webkit nightlies currently support this event
		if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", jQuery.ready, false );

		// If IE event model is used
		} else if ( document.attachEvent ) {
			// ensure firing before onload,
			// maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", DOMContentLoaded );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", jQuery.ready );

			// If IE and not a frame
			// continually check to see if the document is ready
			var toplevel = false;

			try {
				toplevel = window.frameElement == null;
			} catch(e) {}

			if ( document.documentElement.doScroll && toplevel ) {
				doScrollCheck();
			}
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},
	//确定参数是否为一个窗口（window对象）。
	//这是在jQuery中用在一些地方的，以确定我们的操作是否为一个浏览器窗口操作。（如当前窗口或一个iframe）。
	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		//http://www.w3school.com.cn/js/jsref_obj_global.asp
		//这两个是js 的全局函数
		//这里的逻辑是  是数字并且不能是无穷大
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},
	// 判断类型
	type: function( obj ) {
		//equal( jQuery.type(null), "null", "null" );
		//equal( jQuery.type(undefined), "undefined", "undefined" );
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},
	//测试对象是否是纯粹的对象
	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},
	//转化为json
	parseJSON: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}

		// Make sure leading/trailing whitespace is removed (IE can't handle it)
		data = jQuery.trim( data );

		// Attempt to parse using the native JSON parser first
		// 尝试浏览器原生的方法
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		// Make sure the incoming data is actual JSON
		// Logic borrowed from http://json.org/json2.js
		//用json2解析
		if ( rvalidchars.test( data.replace( rvalidescape, "@" )
			.replace( rvalidtokens, "]" )
			.replace( rvalidbraces, "")) ) {

			return ( new Function( "return " + data ) )();

		}
		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	//解析xml
	parseXML: function( data ) {
		if ( typeof data !== "string" || !data ) {
			return null;
		}
		var xml, tmp;
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},
	//在全局上下文中计算一个脚本
	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && rnotwhite.test( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	// 把- 转化为驼峰标识
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
	},

	// args is for internal usage only
	// args 这个参数只是给内部用
	each: function( object, callback, args ) {
		var name, i = 0,
			//看好了，这里的object是个数组，不是个对象，对象没有length属性
			length = object.length,
			isObj = length === undefined || jQuery.isFunction( object );

		if ( args ) {
			//内部使用
			if ( isObj ) {
				for ( name in object ) {
					if ( callback.apply( object[ name ], args ) === false ) {
						break;
					}
				}
			} else {
				for ( ; i < length; ) {
					if ( callback.apply( object[ i++ ], args ) === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			//对外公开
			if ( isObj ) {
				//对象
				for ( name in object ) {
					if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
						break;
					}
				}
			} else {
				//数组
				for ( ; i < length; ) {
					if ( callback.call( object[ i ], i, object[ i++ ] ) === false ) {
						break;
					}
				}
			}
		}

		return object;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

	// results is for internal usage only
		// results 这个参数只是内部使用
		//返回一个数组
		// 注意这个测试用例deepEqual( jQuery.makeArray({length: "0"}), [], "Make sure object is coerced properly.");
	makeArray: function( array, results ) {
		var ret = results || [];

		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = jQuery.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || jQuery.isWindow( array ) ) {
				push.call( ret, array );
			} else {
				jQuery.merge( ret, array );
			}
		}

		return ret;
	},
	//判断一个元素是否在一个数组中
	//返回 -1 表示 不在这个数组中， 如果从在则返回索引
	/**
	 * elem 元素
	 * array 数组
	 * i 开始查找位置, 如果不传，则为0
	 * 
	 * 注意：elem 为 false、null、undefined 时 返回-1，不报错
	 */
	inArray: function( elem, array, i ) {
		var len;

		if ( array ) {
			if ( indexOf ) {
				return indexOf.call( array, elem, i );
			}

			len = array.length;
			//这一行写的可真是个绕的 
			// i = (i ? (i < 0 ? Math.max( 0, len + i ) : i) : 0);
			//说的是这个意思：如果i为定义，则返回0，如果i大于0则返回i。小于0则返回Math.max( 0, len + i )
			// 总之i是个大于0 的数
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in array && array[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},
	//second 合并到  first 中
	merge: function( first, second ) {
		var i = first.length,
			j = 0;
		//有个疑问：这个if判断做啥用的啊
		//下面的这个测试用例无法通过
		//deepEqual( jQuery.merge([], [null, undefined]), [null, undefined], "Second array including null and undefined values");
		//还是有点不明白, 下面这个测试用例就算有if也是无法通过
		// jQuery.merge({a: 1, b: undefined},{}), {a: 1, b: undefined})
		//综上：看来用这个方法的注意是否包含undefined
		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	// arg 这个参数是给内部使用的
	map: function( elems, callback, arg ) {
		var value, key, ret = [],
			i = 0,
			length = elems.length,
			// jquery objects are treated as arrays
			//这个判断真是绕的
			/**
			 * 	isArray = 
			 * 		是jquery的实例
			 * 		elems instanceof jQuery || 
			 * 		是个数组，wokao，数组判断有这么复杂
			 * 		要是个数组，的满足下面的条件：1. length是个数字, 2. (length大于0 并且 第一个元素 和最后一个元素不为空) 或 length === 0 或者是个js数组
			 * 		(
			 * 			length !== undefined && 
			 * 			typeof length === "number" && 
			 * 			( 
			 * 				( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) 
			 *			)
			 *  	);
			 */
			isArray = elems instanceof jQuery || length !== undefined && typeof length === "number" && ( ( length > 0 && elems[ 0 ] && elems[ length -1 ] ) || length === 0 || jQuery.isArray( elems ) ) ;
		// Go through the array, translating each of the items to their
		if ( isArray ) {
			//数组
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );
				
				//下面这三行诗是啥意思啊
				// 意思就是说如果map有返回值，如果返回值不为空，则把返回值记录在一个数组中
				/**
				 * var keys = jQuery.map( {a:'', c: 'a', b : null}, function( v, k ){
				 *		return v;
				 * });
				 * output:['', 'a']
				 */
				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			//对象
			for ( key in elems ) {
				value = callback( elems[ key ], key, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return ret.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any arguments.
	// 给一个上下文绑定一个函数
	proxy: function( fn, context ) {
		if ( typeof context === "string" ) {
			var tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind 模拟绑定
		var args = slice.call( arguments, 2 ),
			proxy = function() {
				return fn.apply( context, args.concat( slice.call( arguments ) ) );
			};

		// Set the guid of unique handler to the same of original handler, so it can be removed
			//给一个唯一的guid和原来处理函数的相同
			//为啥要给guid?
		proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;

		return proxy;
	},
	
	//多种方法来获取和设置值的集合
	// Mutifunctional method to get and set values to a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, pass ) {
		var exec,
			bulk = key == null,
			i = 0,
			length = elems.length;

		// Sets many values
		if ( key && typeof key === "object" ) {
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], 1, emptyGet, value );
			}
			chainable = 1;

		// Sets one value
		} else if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = pass === undefined && jQuery.isFunction( value );

			if ( bulk ) {
				// Bulk operations only iterate when executing function values
				if ( exec ) {
					exec = fn;
					fn = function( elem, key, value ) {
						return exec.call( jQuery( elem ), value );
					};

				// Otherwise they run against the entire set
				} else {
					fn.call( elems, value );
					fn = null;
				}
			}

			if ( fn ) {
				for (; i < length; i++ ) {
					fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
				}
			}

			chainable = 1;
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	},

	// Use of jQuery.browser is frowned upon.
	// More details: http://docs.jquery.com/Utilities/jQuery.browser
	uaMatch: function( ua ) {
		ua = ua.toLowerCase();

		var match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
			[];

		return { browser: match[1] || "", version: match[2] || "0" };
	},

	sub: function() {
		function jQuerySub( selector, context ) {
			return new jQuerySub.fn.init( selector, context );
		}
		jQuery.extend( true, jQuerySub, this );
		jQuerySub.superclass = this;
		jQuerySub.fn = jQuerySub.prototype = this();
		jQuerySub.fn.constructor = jQuerySub;
		jQuerySub.sub = this.sub;
		jQuerySub.fn.init = function init( selector, context ) {
			if ( context && context instanceof jQuery && !(context instanceof jQuerySub) ) {
				context = jQuerySub( context );
			}

			return jQuery.fn.init.call( this, selector, context, rootjQuerySub );
		};
		jQuerySub.fn.init.prototype = jQuerySub.fn;
		var rootjQuerySub = jQuerySub(document);
		return jQuerySub;
	},

	browser: {}
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
	jQuery.browser[ browserMatch.browser ] = true;
	jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
	jQuery.browser.safari = true;
}

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
	DOMContentLoaded = function() {
		document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
		jQuery.ready();
	};

} else if ( document.attachEvent ) {
	DOMContentLoaded = function() {
		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( document.readyState === "complete" ) {
			document.detachEvent( "onreadystatechange", DOMContentLoaded );
			jQuery.ready();
		}
	};
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
	if ( jQuery.isReady ) {
		return;
	}

	try {
		// If IE is used, use the trick by Diego Perini
		// http://javascript.nwbox.com/IEContentLoaded/
		document.documentElement.doScroll("left");
	} catch(e) {
		setTimeout( doScrollCheck, 1 );
		return;
	}

	// and execute any waiting functions
	jQuery.ready();
}

return jQuery;

})();
