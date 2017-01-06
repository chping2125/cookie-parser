/*!
 * cookie-parser
 * Copyright(c) 2014 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

// 此处引用了两个依赖包，在后面会介绍。
var cookie = require('cookie')
var signature = require('cookie-signature')

/**
 * Module exports.
 * @public
 * 该文件向外暴露了一下几个方法。
 */

module.exports = cookieParser
module.exports.JSONCookie = JSONCookie
module.exports.JSONCookies = JSONCookies
module.exports.signedCookie = signedCookie
module.exports.signedCookies = signedCookies

/**
 * Parse Cookie header and populate `req.cookies`
 * with an object keyed by the cookie names.
 *
 * 解析请求头中的Cookie并填充到cookies对象里面，
 * cookies对象里面的属性名为请求头中每一个cookie的名字。
 *
 * @param {string|array} [secret] A string (or array of strings) representing cookie signing secret(s).
 * @param {Object} [options]
 * @return {Function}
 * @public
 */

function cookieParser (secret, options) {
  //返回的cookieParser函数作为express的中间件使用，
  //所以利用app.use()方法时，形参req,res,next会被express的use()方法以实参传递进来
  return function cookieParser (req, res, next) {
    //如果没有使用cookie-parser中间件的时候，该对象默认为{};当使用cookie-parser中间件的时候，就看现在我们解读的源码给他赋值什么了。
    //此处说明是为了表明该cookies对象就是我们在express中使用的req.cookies.
    if (req.cookies) {
      return next()
    }

    //从请求头中获取cookie，该headers是nodejs中request对象的属性值
    var cookies = req.headers.cookie
    //初始化ecrets
    var secrets = !secret || Array.isArray(secret)
      ? (secret || [])
      : [secret]

    req.secret = secrets[0] //将
    req.cookies = Object.create(null) //创建空对象给req.cookies
    req.signedCookies = Object.create(null) //创建空对象给req.signedCookies

    // no cookies
    // 请求头中不存在cookie
    if (!cookies) {
      return next()
    }
    //请求头中存在cookie，则通过开头引入的cookie依赖包来解析请求头中的cookie键值
    //其实该cookie依赖包就两个方法，有兴趣的可以去该项目根目录下看看cookie.js文件，cookie-parser中间件中并不存在该文件，
    //为了方便学习查看，我引入并加了注解。
    req.cookies = cookie.parse(cookies, options)

    // parse signed cookies
    // 根据签名解析cookie值，注意是解析值，不是解析cookies本身
    // 特别注意的是，该操作为req对象添加了一个signedCookies对象。 express中和req.cookies 一样对此也有相应的解释http://www.expressjs.com.cn/4x/api.html#req.signedCookies
    if (secrets.length !== 0) {
      // 根据secrets解码cookie值
      req.signedCookies = signedCookies(req.cookies, secrets)
      // 解析cookie值为json类型
      req.signedCookies = JSONCookies(req.signedCookies)
    }

    // parse JSON cookies
    // 解析cookies为json类型的对象
    req.cookies = JSONCookies(req.cookies)

    next()
  }
}

/**
 * Parse JSON cookie string.
 *
 *
 *
 * @param {String} str
 * @return {Object} Parsed object or undefined if not json cookie
 * @public
 */

function JSONCookie (str) {
  // str 必须是字符串且以 'j:' 开头，以 ‘j:’ 开头表明还没有json解析
  if (typeof str !== 'string' || str.substr(0, 2) !== 'j:') {
    return undefined
  }

  try {
    return JSON.parse(str.slice(2))
  } catch (err) {
    return undefined
  }
}

/**
 * Parse JSON cookies.
 *
 * 解析 cookies 对象为 JSON 类型
 *
 * @param {Object} obj
 * @return {Object}
 * @public
 */

function JSONCookies (obj) {
  var cookies = Object.keys(obj)
  var key
  var val

  for (var i = 0; i < cookies.length; i++) {
    key = cookies[i]
    val = JSONCookie(obj[key])

    if (val) {
      obj[key] = val
    }
  }

  return obj
}

/**
 * Parse a signed cookie string, return the decoded value.
 *
 * 解析一个签名的cookie值（string类型），返回解码后的值。
 * @param {String} str signed cookie string
 * @param {string|array} secret
 * @return {String} decoded value
 * @public
 */

function signedCookie (str, secret) {
  if (typeof str !== 'string') {
    return undefined
  }

  //当发现没有s: 则是解码过的cookie，直接返回
  if (str.substr(0, 2) !== 's:') {
    return str
  }

  var secrets = !secret || Array.isArray(secret)
    ? (secret || [])
    : [secret]

  for (var i = 0; i < secrets.length; i++) {
    // 此处用到了我们开头引入的第二个依赖包
    // 传入的str已经去除掉s:
    var val = signature.unsign(str.slice(2), secrets[i])

    if (val !== false) {
      return val
    }
  }

  return false
}

/**
 * Parse signed cookies, returning an object containing the decoded key/value
 * pairs, while removing the signed key from obj.
 *
 * 解析cookie签名,返回一个包含从cookies对象中解码的键值对对象
 *
 * @param {Object} obj
 * @param {string|array} secret
 * @return {Object}
 * @public
 */

function signedCookies (obj, secret) {
  var cookies = Object.keys(obj)
  var dec
  var key
  var ret = Object.create(null)
  var val

  for (var i = 0; i < cookies.length; i++) {
    key = cookies[i]
    val = obj[key]
    // 根据指定解析算法解析cookie的值
    dec = signedCookie(val, secret)

    if (val !== dec) {
      ret[key] = dec
      delete obj[key]
    }
  }

  return ret
}
