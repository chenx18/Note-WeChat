const config = require('../config');  // 配置参数
const sha1 = require('sha1');   // 加密模块
//引入工具函数
const {getUserDataAsync, parseXMLAsync, formatMessage} = require('../utils');
//引入reply模块
const reply = require('./reply');
//引入template模块
const template = require('./template');
const {writeFileAsync, readFileAsync} = require('../utils')



/*
 验证服务器地址的有效性
* signature: 微信的加密签名，结合你的token，timestamp和nonce经过某种算法生成的
* echostr: 随机字符串，微信后台随机生成的
* timestamp: 时间戳，对应当前时间
* nonce: 随机数，微信后台随机生成的
* sha1: 一种加密算法 需要安装 npm install sha1 --save
*/
module.exports = () => { 
  return async (ctx, next) => {
    // console.log('ctx.request',ctx.request)
    // console.log('ctx.query',ctx.query)
    // console.log('ctx.req',ctx.req)
    const { token } = config
    // 1. 接收微信服务器参数
    const { signature, nonce, timestamp, echostr } = ctx.query;

    // 2. 将三个排序后的字符串拼接在一起，用sha1算法加密
    const str = [ token, timestamp, nonce ].sort().join('') 
    const sha = sha1(str);

    // 3. 将加密后的字符串与 signature 进行对比，相等下一步，不等报错
    if(sha === signature) {
      // 4. 返回echostr给微信后台，微信后台才会确认开发者的合法身份；到这里服务器配置就完成了
      if (ctx.request.method==="GET") {
        ctx.body = echostr
      } 
      // 接收到用户发来的消息，解析并回复
      else if(ctx.request.method==="POST"){
        // 1. 获取用户的消息，返回的数据格式是xml
        const xmlData = await getUserDataAsync(ctx.req);
        console.log('xmlData',xmlData);

        // 2. 将xml解析成js对象
        const jsData = await parseXMLAsync(xmlData);
        console.log('jsData',jsData);

        // 3. 格式化数据
        const message = formatMessage(jsData);
        console.log('message',message);

        // 4. 设置回复用户消息的具体内容
        const options = await reply(message);
        console.log('options', options);

        // 5. 最终回复用户的消息
        const replyMessage = template(options);
        console.log('replyMessage',replyMessage);

        ctx.body = replyMessage;
      }
      
    }else{
      ctx.body = 'wrong'
    }
  }
}