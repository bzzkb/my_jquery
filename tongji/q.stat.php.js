

(function () {
		var g = document,
		f = window,
		m = navigator,
		i = location,
		n = screen,
		j = encodeURIComponent,
		k = decodeURIComponent,
		h = "https:" == i.protocol ? "https:" : "http:",
		p = function () {
			this.siteid = "1000000710";
			this.pic = "";
			this.lpic = "2";
			this.NR = h + "//c.cnzz.com/cnzz_core_c.php";
			this.online = "";
			this.error_log = "_CNZZ_error_log";
			this.server_now = "1361955309";
			this.server_ip = "q1.cnzz.com";
			this.server_ip_v3 = "";
			this.move_server =
				"";
			this.async = "";
			this.cs = "|";
			this.init()
		};
		p.prototype = {
			init : function () {
				this.getAllSubCookies();
				this.cnzzed = new Date;
				this.subCookieParts = {};
				this.now = parseInt(this.cnzzed.getTime());
				this.cnzzed.setTime(this.now + 157248E5);
				if (this.domain = this.getDomain() || "")
					this.domain = "." + this.domain;
				this.getAllPara();
				this.bridgename = "_CNZZDbridge_" + this.siteid;
				f[this.bridgename] = f[this.bridgename] || {};
				this.is_async = "none" == this.pic || 0 == this.lpic || this.async ?
					!0 : !1
			},
			getAllPara : function () {
				this.getReferer();
				this.getLG();
				this.getShowp();
				this.getLvTime();
				this.getURL()
			},
			getReferer : function () {
				this.refer = g.referrer || "";
				this.refer = j(this.refer)
			},
			getLG : function () {
				this.lg = m.systemLanguage || m.language;
				this.lg = this.lg.toLowerCase()
			},
			getShowp : function () {
				this.showp = n.width + "x" + n.height
			},
			getCNZZeid : function () {
				this.eid = this.getSubCookiePart("cnzz_eid") || "none"
			},
			getLvTime : function () {
				this.ntime = this.getSubCookiePart("ntime") || "none"
			},
			requestNext : function () {
				var a = this.NR +
					"?web_id=" + this.siteid;
				this.pic && (a += "&show=" + this.pic);
				this.online && (a += "&online=" + this.online);
				this.lpic && (a += "&l=" + this.lpic);
				this.createAscript(a, "utf-8")
			},
			setUserStorage : function () {
				this.setSubCookieValue()
			},
			setCNZZeid : function (a) {
				var c = h + "//" + i.hostname,
				a = this.getSubCookiePart("cnzz_eid") || Math.floor(2147483648 * Math.random()) + "-" + a + "-" + c;
				this.setCookiePart("cnzz_eid", a)
			},
			setLVTime : function (a) {
				this.setCookiePart("ntime", a)
			},
			getSubCookiePart : function (a) {
				return this.subcookies ? this.subcookies[a] ||
				null : null
			},
			getAllSubCookies : function () {
				var a = "CNZZDATA" + this.siteid + "=",
				c = g.cookie.indexOf(a),
				b = null,
				d = {};
				-1 < c ? (b = g.cookie.indexOf(";", c), -1 == b && (b = g.cookie.length), b = g.cookie.substring(c + a.length, b), 0 < b.length && (a = b.split(this.cs), d[k("cnzz_eid")] = k(a[0]), d[k("ntime")] = k(a[1]), this.subcookies = d)) : this.subcookies = null
			},
			setCookiePart : function (a, c) {
				a = a.toString();
				c = c.toString();
				this.subCookieParts[j(a)] = j(c)
			},
			setSubCookieValue : function () {
				var a = "CNZZDATA" + this.siteid + "=",
				c = [],
				b;
				for (b in this.subCookieParts)
					c.push(this.subCookieParts[b]);
				0 < c.length ? (a += c.join([this.cs]), a += "; expires=" + this.cnzzed.toUTCString(), a += "; path=/") : a += "; expires=" + (new Date(0)).toUTCString();
				g.cookie = a;
				this.subCookieParts = {}
				
			},
			getDomain : function () {
				var a = (i.hostname + "/").match(/[\w-]+\.(com|net|org|gov|edu|mil|cc|biz|name|info|mobi|cn|int|pro|museum|coop|aero|xxx|idv)(\.(cn|hk|jp|tw|kr|mo))*\//ig);
				if (a) {
					if (0 < a.length)
						return a[0].substr(0, a[0].length - 1)
				} else
					return !1
			},
			getURL : function () {
				this.href = j(i.href)
			},
			callScript : function (a) {
				for (var c = a.length, b = 0; b < c; b++)
					a[b][0] &&
					this.createAscript(a[b][1], a[b][0])
			},
			createAscript : function (a, c) {
				if (this.is_async) {
					var b = g.createElement("script");
					b.type = "text/javascript";
					b.async = !0;
					b.charset = c;
					b.src = a;
					var d = g.getElementsByTagName("script")[0];
					d.parentNode.insertBefore(b, d)
				} else
					g.write(unescape("%3Cscript src='" + a + "' charset='" + c + "' type='text/javascript'%3E%3C/script%3E"))
			},
			callRequest : function (a) {
				for (var c = a.length, b = null, d = 0; d < c; d++)
					a[d] && (b = "cnzz_image_" + Math.floor(2147483648 * Math.random()), f[b] = new Image, f[b].cnzzname = b,
						f[b].onload = f[b].onerror = f[b].onabort = function () {
							try {
								this.onload = this.onerror = this.onabort = null,
								f[this.cnzzname] = null
							} catch (a) {}
							
						}, f[b].src = a[d] + "&rnd=" + Math.floor(2147483648 * Math.random()))
			},
			createIcon : function (a) {
				for (var c = a.length, b = "", d = 0; d < c; d++)
					a[d] && (b += unescape(a[d]));
				if (a = g.getElementById("cnzz_stat_icon_" + this.siteid))
					a.innerHTML = b
			},
			createScriptIcon : function (a, c) {
				var b = g.createElement("script");
				b.type = "text/javascript";
				b.async = !0;
				b.charset = c;
				b.src = a;
				var d = g.getElementById("cnzz_stat_icon_" +
						this.siteid);
				d && d.appendChild(b)
			},
			sendData : function () {
				this.move_server && this.callRequest([h + "//" + this.move_server + "/stat.htm?id=1000000710&r=" + this.refer + "&lg=" + this.lg + "&ntime=" + this.ntime + "&cnzz_eid=" + this.eid + "&showp=" + this.showp + "&page=" + this.href]);
				this.server_ip && this.callRequest([h + "//" + this.server_ip + "/stat.htm?id=1000000710&r=" + this.refer + "&lg=" + this.lg + "&ntime=" + this.ntime + "&cnzz_eid=" + this.eid + "&showp=" + this.showp + "&page=" + this.href]);
				this.server_ip_v3 && this.callRequest([h +
						"//" + this.server_ip_v3 + "/stat.htm?id=1000000710&r=" + this.refer + "&lg=" + this.lg + "&ntime=" + this.ntime + "&cnzz_eid=" + this.eid + "&showp=" + this.showp + "&page=" + this.href])
			}
		};
		try {
			var e = new p;
			e.setCNZZeid(e.server_now);
			e.setLVTime(e.server_now);
			e.setUserStorage();
			e.getAllSubCookies();
			e.getCNZZeid();
			e.sendData();
			f[e.bridgename].bobject = e;
			e.requestNext()
		} catch (l) {
			f[e.error_log] = f[e.error_log] || [],
			f[e.error_log].push(l.fileName + "|" + l.lineNumber + "|" + l.message)
		}
	})();
 