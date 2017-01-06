/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module exports.
 * @public
 * 该文件抛出两个方法，一看就是用来对cookie进行解析和序列化的。
 * parse()方法：把字符串转成对象
 * eg: var cookies = cookie.parse('foo=bar; cat=meow; dog=ruff');
 *    =>  cookies = { foo: 'bar', cat: 'meow', dog: 'ruff' };
 *
 * serialize()方法： 接收key和val，并序列化。
 * eg: var hdr = cookie.serialize('foo', 'bar');
 *    => hdr = 'foo=bar';
 */

exports.parse = parse;
exports.serialize = serialize;

/**
 * Module variables.
 * @private
 */

// url解析和编码
var decode = decodeURIComponent;
var encode = encodeURIComponent;
// 匹配0个或多个 ‘； ’结尾的字符串
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * 解析获取的请求头重的 cookie 字符串为一个对象
 * 这个对象的变量属性为cookie的 key值，值为cookie的value值。
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  // 传入的cookie不是字符串类型返回错误。
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {}
  var opt = options || {};
  // 根据正则拆分 cookie 字符串为数组。
  var pairs = str.split(pairSplitRegExp);
  // url解析方法
  var dec = opt.decode || decode;

  // 循环遍历出cookie数组为对象
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    // 如果不是key=value形式，则忽略转为对象。
    if (eq_idx < 0) {
      continue;
    }

    // 截取出key / value
    var key = pair.substr(0, eq_idx).trim()
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    // 处理value值第一项为双引号的特殊情况
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      // 根据解析算法解析出val并赋值给对象对应的属性
      obj[key] = tryDecode(val, dec);
    }
  }
  // 解析完成返回该对象。
  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 *序列化cookie数据，以便添加到返回头中.
 *
 *序列化cookie名称和值为一个字符串。options配置对象为设置cookie的参数，如httpOnly等，下面是一个例子。
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  //传入的加密方法
  var enc = opt.encode || encode;
  //不是方法，直接抛出错误
  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  // 判断名称是否有效
  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }


  var value = enc(val);
  // 判断加密后的cookie值是否有效
  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }
  //拼接cookie的名称和值
  var str = name + '=' + value;

  // 下面为拼接cookie的参数。如max-age，domain，path，expires，httpOnly， secure, sameSite等
  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }
  // 大功告成，返回拼接的字符串
  return str;
}

/**
 * Try decoding a string using a decoding function.
 * 根据传入的解析方法或者默认方法来解析cookie的value值
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}
