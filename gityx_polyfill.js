//替换原生JSON为polyfill，修复无法存档的bug
//勿随便套用到其它游戏！

delete window.JSON;
let delNullValue = function delNullValue(obj) {
	if (typeof(obj) !== "object") {return}
	for (let k in obj) {
		if (obj[k] === null && Array.isArray(obj) === false) {
			delete obj[k]
		} else if (typeof(obj) === "object") {
			delNullValue(obj[k])
		}
	}
}
window.JSON = {
	parse: function(sJSON) {
		let ret = eval('(' + sJSON + ')');
		//修复之前的stringify导致的格式错误存档
		delNullValue(ret);
		return ret
	},
	stringify: (function () {
		var toString = Object.prototype.toString;
		var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
		var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
		var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
		var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
		return function stringify(value) {
			if (value == null) {
				return 'null';
			} else if (typeof value === 'number') {
				return isFinite(value) ? value.toString() : 'null';
			} else if (typeof value === 'boolean') {
				return value.toString();
			} else if (typeof value === 'object') {
				if (typeof value.toJSON === 'function') {
					return stringify(value.toJSON());
				} else if (isArray(value)) {
					var res = '[';
					for (var i = 0; i < value.length; i++)
						res += (i ? ', ' : '') + stringify(value[i]);
					return res + ']';
				} else if (toString.call(value) === '[object Object]') {
					var tmp = [];
					for (var k in value) {
						if (value.hasOwnProperty(k) && value[k] !== undefined)
							tmp.push(stringify(k) + ': ' + stringify(value[k]));
					}
					return '{' + tmp.join(', ') + '}';
				}
			}
			return '"' + value.toString().replace(escRE, escFunc) + '"';
		};
	})()
};
