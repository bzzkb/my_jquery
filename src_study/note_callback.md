
## jQuery-1.7.2 源代码学习---callback(学前准备)

---

参考文章：http://api.jquery.com/jQuery.Callbacks/


### 概述

	说是学前准备，其实我是完全阅读完jquery-callback的源代码以及测试用例之后才写现在的这个笔记的。
	
### 名字解释
	阅读源代码会碰到一下这些词，写下自己的理解，这些词不用翻译，主要是要理解这些词所代表的含义
	
	Callbacks： 看好这个首字母是大写，它标识的是回调列表对象，就是说把一堆的函数组成的列表包装成为一个对象，
				然后通过这个对象来操作里面的函数
	list： 这个可以理解为就是一个队列，后面的操作都是针对这个队列来进行的，
	
	flags： 这个可以理解为对list的行为的标识，当然这个标识可以为空，可以使一个，也可以是多个
	once：就是说这个list只执行一次，不管比触发这个list几次，它只执行一次
	memory：添加就触发，触发的时候会把整个回调列表都触发一次
	unique：就是说重复添加也只会执行一次
	stopOnFalse：这个就是说回调队列碰到返回值为false就停止执行
	
	
	
	
	
	"":							"XABC 	X		XABCABCC 	X 	XBB X	XABA	X",
	"once":						"XABC 	X 		X 			X 	X 	X	XABA	X",
	"memory":					"XABC 	XABC 	XABCABCCC 	XA 	XBB	XB	XABA	XC",
	"unique":					"XABC 	X		XABCA		X	XBB	X	XAB		X",
	"stopOnFalse":				"XABC 	X		XABCABCC	X	XBB	X	XA		X",
	"once memory":				"XABC 	XABC	X			XA	X	XA	XABA	XC",
	"once unique":				"XABC 	X		X			X	X	X	XAB		X",
	"once stopOnFalse":			"XABC 	X		X			X	X	X	XA		X",
	"memory unique":			"XABC 	XA		XABCA		XA	XBB	XB	XAB		XC",
	"memory stopOnFalse":		"XABC 	XABC	XABCABCCC	XA	XBB	XB	XA		X",
	"unique stopOnFalse":		"XABC 	X		XABCA		X	XBB	X	XA		X"
	
	
	// Ordering
	output = "X";
	cblist = jQuery.Callbacks( flags );
	cblist.add( function() {
		cblist.add( outputC ); //这种方式要注意，添加的时候执行，执行的时候在执行，也就是说可能要执行两次
		outputA();
	}, outputB );
	cblist.fire();
	//1
	strictEqual( output, results.shift(), "Proper ordering" );
	
	// Add and fire again
	output = "X";
	cblist.add( function() {
		cblist.add( outputC );
		outputA();
	}, outputB );
	//2
	strictEqual( output, results.shift(), "Add after fire" );
	
	output = "X";
	cblist.fire();
	//3
	strictEqual( output, results.shift(), "Fire again" );
	
	// Multiple fire
	output = "X";
	cblist = jQuery.Callbacks( flags );
	cblist.add( function( str ) {
		output += str;
	} );
	cblist.fire( "A" );
	strictEqual( output, "XA", "Multiple fire (first fire)" );
	output = "X";
	cblist.add( function( str ) {
		output += str;
	} );
	//4
	strictEqual( output, results.shift(), "Multiple fire (first new callback)" );
	output = "X";
	cblist.fire( "B" );
	//5
	strictEqual( output, results.shift(), "Multiple fire (second fire)" );
	output = "X";
	cblist.add( function( str ) {
		output += str;
	} );
	//6
	strictEqual( output, results.shift(), "Multiple fire (second new callback)" );
	
	// Return false
	output = "X";
	cblist = jQuery.Callbacks( flags );
	cblist.add( outputA, function() { return false; }, outputB );
	cblist.add( outputA );
	cblist.fire();
	//7
	strictEqual( output, results.shift(), "Callback returning false" );
	
	// Add another callback (to control lists with memory do not fire anymore)
	output = "X";
	cblist.add( outputC );
	//8
	strictEqual( output, results.shift(), "Adding a callback after one returned false" );


