const config = require("../config/config")
const sha1 = require("sha1");
const getRawBody = require("raw-body");
const { parseXML, formatMessage, tpl2xml } = require("../utils/tool")
const reply = require("./reply")
    /**
     * 微信服务器会发送两种类型的消息给开发者服务器
     *  1.GET请求
     *      -验证服务器的有效性
     *  2.POST请求
     *      -微信服务器会将用户发送的数据以post请求的方式转发到开发者服务器上
     */

module.exports = () => {
    return async(ctx, next) => {
        const { signature, timestamp, nonce, echostr } = ctx.query;
        const token = config.wechat.token;

        let str = [token, timestamp, nonce].sort().join('');
        const sha = sha1(str);
        if (ctx.method === "GET" && sha === signature) {
            //如果一样说明消息来自于微信服务器，返回echostr给微信服务器
            ctx.body = echostr;

        } else if (ctx.method === "POST" && sha === signature) {
            //-如果一样微信服务器会将用户发送的数据以post请求的方式转发到开发者服务器上
            const data = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: "1mb",
                encoding: ctx.charset
            })
            const content = await parseXML(data);
            // console.log(content);
            const message = formatMessage(content.xml);
            // console.log(message);
            let replyBody = await reply(message);
            // console.log(replyBody);
            //生成xml数据
            let xml = tpl2xml(replyBody, message);
            // console.log(xml)
            ctx.status = 200;
            ctx.type = 'application/xml';

            ctx.body = xml;

        } else {
            await next();
            // ctx.body = "Failed"
        }
    }
}