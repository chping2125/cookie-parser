/**
 * Module dependencies.
 */

var crypto = require('crypto');
// 一个加密算法库，想了解更多可以查看http://cnodejs.org/topic/504061d7fef591855112bab5

/**
 * Sign the given `val` with `secret`.
 *
 * 通过 secret 给cookie的值添加签名。
 *
 * @param {String} val
 * @param {String} secret
 * @return {String}
 * @api private
 */

exports.sign = function(val, secret){
  if ('string' != typeof val) throw new TypeError("Cookie value must be provided as a string.");
  if ('string' != typeof secret) throw new TypeError("Secret string must be provided.");
  // 可以明显的看到在val的后面添加了一个点，然后后面追加的是crypto加密算法的一个值，当然这个值和我们的secret有关。
  // 想了解加密算法crypto，可以看这里：http://cnodejs.org/topic/504061d7fef591855112bab5
  return val + '.' + crypto
    .createHmac('sha256', secret)
    .update(val)
    .digest('base64')
    .replace(/\=+$/, '');
};

/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 *
 * 通过 secret 给cookie值解码并删除签名。
 *
 * @param {String} val
 * @param {String} secret
 * @return {String|Boolean}
 * @api private
 */

exports.unsign = function(val, secret){
  if ('string' != typeof val) throw new TypeError("Signed cookie string must be provided.");
  if ('string' != typeof secret) throw new TypeError("Secret string must be provided.");
  // 根据前面的加密规则来解码
  var str = val.slice(0, val.lastIndexOf('.'))
    , mac = exports.sign(str, secret);

  // 判断解码是否成功，如果解码出来的str经过在加密后与传入时相同则解码成功返回str，否则返回错误
  return sha1(mac) == sha1(val) ? str : false;
};

/**
 * Private
 */

function sha1(str){
  return crypto.createHash('sha1').update(str).digest('hex');
}
