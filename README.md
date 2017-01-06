# cookie-parser

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Node.js Version][node-version-image]][node-version-url]
[![Build Status][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]

Parse `Cookie` header and populate `req.cookies` with an object keyed by the cookie
names. Optionally you may enable signed cookie support by passing a `secret` string,
which assigns `req.secret` so it may be used by other middleware.

解析请求头中的`Cookie`，并且将它解析为一个Cookie的名称为对象属性（变量）的对象赋值给`req.cookies`。你可以通过传实参``secret``启用签名cookie的可选配置，它被分配到`req.secret`中来方便其他中间件使用。

## 说明

该项目 fork 自 https://github.com/expressjs/cookie-parser ，本人只是在学习过程中对源码文件 [index.js](index.js) 中代码加了部分个人理解的注释而已，只为个人学习使用。

另外该项目中源码文件 [index.js](index.js) 依赖 [cookie](https://www.npmjs.org/package/cookie) 和 [cookie-signature](https://www.npmjs.com/package/cookie-signature) 文件，于是将这两个依赖包主要源码赋值到本项目下面，对应的分别是 [cookie.js](cookie.js) 和 [cookie-signature.js](cookie-signature.js)。


## 安装

```sh
$ npm install cookie-parser
```

## API

```js
var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())
```

### cookieParser(secret, options)

- `secret` a string or array used for signing cookies. This is optional and if not specified, will not parse signed cookies. If a string is provided, this is used as the secret. If an array is provided, an attempt will be made to unsign the cookie with each secret in order.
- `options` an object that is passed to `cookie.parse` as the second option. See [cookie](https://www.npmjs.org/package/cookie) for more information.
  - `decode` a function to decode the value of the cookie

- `secret` 是一个字符串或者一个数组被用来为cookies生成签名。如果不是特别说明它是可选的参数，这样就不能解码签名的cookies。如果传的是一个字符串，这将会被用作所有。如果提供的是一个数组，将尝试按照数组顺序解码每一个cookie。
- `options` 一个传递给`cookie.parse`方法第二个参数的对象。查看
 [cookie.js文件](cookie.js) 来获取更多信息。
    - `decode` 是一个解析cookie值的一个方法。


### cookieParser.JSONCookie(str)

Parse a cookie value as a JSON cookie. This will return the parsed JSON value if it was a JSON cookie, otherwise it will return the passed value.

解析 cookie 为 JSON 类型的 cookie。如果 ``str``可以转化为一个 JSON 类型的 cookie ，他将会返回一个 JSON 类型的cookie，否则它会原样返回``str``。

### cookieParser.JSONCookies(cookies)

Given an object, this will iterate over the keys and call `JSONCookie` on each value. This will return the same object passed in.

传入一个对象，该方法将会遍历每个 cookie 值，然后对每一个遍历项调用`JSONCookie`方法处理对应的 cookie 值。返回对象可能和传入的相同（如果已经解析过了）。

### cookieParser.signedCookie(str, secret)

Parse a cookie value as a signed cookie. This will return the parsed unsigned value if it was a signed cookie and the signature was valid. If the value was not signed, the original value is returned. If the value was signed but the signature could not be validated, `false` is returned.

The `secret` argument can be an array or string. If a string is provided, this is used as the secret. If an array is provided, an attempt will be made to unsign the cookie with each secret in order.

解析签名的 cookie 值。如果``str``是一个签名的 cookie 并且签名存在则返回一个解码后的 cookie 值。如果这个 cookie 值没有签名，将原样返回。如果这个 cookie 值已签名但是签名不存在，将返回`false`。

`secret`属性可以是一个数组或者字符串。如果传的是一个字符串，这将会被用作所有。如果提供的是一个数组，将尝试按照数组顺序解码每一个cookie。

### cookieParser.signedCookies(cookies, secret)

Given an object, this will iterate over the keys and check if any value is a signed cookie. If it is a signed cookie and the signature is valid, the key will be deleted from the object and added to the new object that is returned.

The `secret` argument can be an array or string. If a string is provided, this is used as the secret. If an array is provided, an attempt will be made to unsign the cookie with each secret in order.

传入一个对象，该方法将会遍历每个 cookie 值并且如果遍历的当前项是一个已签名的 cookie 值，就会去解析它。如果遍历的当前项是一个已签名的 cookie 值并且签名存在则从原对象上删除该属性然后在返回的新对象上添加它。

`secret`属性可以是一个数组或者字符串。如果传的是一个字符串，这将会被用作加密所有。如果提供的是一个数组，将尝试按照数组顺序解码每一个cookie。

## 实例

```js
var express = require('express')
var cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())

app.get('/', function (req, res) {
  // 未解析签名的Cookies
  console.log('Cookies: ', req.cookies)

  // 已解析签名的Cookies
  console.log('Signed Cookies: ', req.signedCookies)
})

app.listen(8080)

// curl command that sends an HTTP request with two cookies
// curl http://127.0.0.1:8080 --cookie "Cho=Kim;Greet=Hello"
//
// curl 命令可以发送一个携带两个 cookies 的 HTTP 请求。
```

### [MIT Licensed](LICENSE)

[npm-image]: https://img.shields.io/npm/v/cookie-parser.svg
[npm-url]: https://npmjs.org/package/cookie-parser
[node-version-image]: https://img.shields.io/node/v/cookie-parser.svg
[node-version-url]: https://nodejs.org/en/download
[travis-image]: https://img.shields.io/travis/expressjs/cookie-parser/master.svg
[travis-url]: https://travis-ci.org/expressjs/cookie-parser
[coveralls-image]: https://img.shields.io/coveralls/expressjs/cookie-parser/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/cookie-parser?branch=master
[downloads-image]: https://img.shields.io/npm/dm/cookie-parser.svg
[downloads-url]: https://npmjs.org/package/cookie-parser
