

const config = require('../config');  // 配置参数
const sha1 = require('sha1');   // 加密模块

/*
  signature: 微信的加密签名，结合你的token，timestamp和nonce经过某种算法生成的
  echostr: 随机字符串，微信后台随机生成的
  timestamp: 时间戳，对应当前时间
  nonce: 随机数，微信后台随机生成的
  sha1: 一种加密算法 需要安装 npm install sha1 --save
*/

// 验证服务器地址的有效性
module.exports = () => { 
  return (ctx, next) => {
    const { token } = config.wechat

    // 1. 接收微信服务器参数
    const { signature, nonce, timestamp, echostr } = ctx.query;

    // 2. 将三个排序后的字符串拼接在一起，用sha1算法加密
    const str = [ token, timestamp, nonce ].sort().join('') 
    const sha = sha1(str);

    // 3. 将加密后的字符串与 signature 进行对比，相等下一步，不等报错
    if(sha === signature) {
      // 4. 返回echostr给微信后台，微信后台才会确认开发者的合法身份；到这里服务器配置就完成了
      ctx.body = echostr
    }else{
      ctx.body = 'wrong'
    }
  }
}