### 微信公众号项目介绍

当前只对实现思路进行说明，不作基础介绍！详细信息查看[微信官方文档](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html)及[git地址](https://gitee.com/crui14994/wechat)！

#### 实现功能

1. 新关注自动回复；

2. 被动回复；

3. 推送消息；

4. 自定义菜单；

5. js-sdk使用；

6. 网页授权获取用户信息

### koa2环境搭建

1. koa-generator的安装

    ```bash
    cnpm install -g koa-generator
    ```
    
2. koa2项目建立

    ```bash
    koa2 -e wechat
    ```

### 使用飞鸽内网穿透

[飞鸽](https://www.fgnwct.com/)

使用比较简单就不作详细介绍了！


### 接入微信公众平台开发

#### 编写reply中间件；新建reply文件夹，进入文件夹新建index文件！

安装所需依赖：

```bash
cnpm i -S sha1
```

在app.js入口文件中路由配置前引入中间件！

```js
...
const reply = require("./reply")

...

//接收处理所有消息
app.use(reply());

// routes
app.use(index.routes(), index.allowedMethods())

...
```

#### 验证消息的确来自微信服务器

微信服务器会发送两种类型的消息给开发者服务器.

开发者通过检验signature对请求进行校验（下面有校验方式）。若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，成为开发者成功，否则接入失败。

1. GET请求

    -验证服务器的有效性

    1）将token、timestamp、nonce三个参数进行字典序排序 

    2）将三个参数字符串拼接成一个字符串进行sha1加密 

    3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信

2. POST请求

    -微信服务器会将用户发送的数据以post请求的方式转发到开发者服务器上

```js
const config = require("../config/config")
const sha1 = require("sha1");

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

        } else {
            await next();
            // ctx.body = "Failed"
        }
    }
}

```

在测试号中进行配置，若无误会提示配置成功！

![360截图167401157264113_看图王.png](https://upload-images.jianshu.io/upload_images/14011985-41c02d8db1296b05.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 继续处理post请求，并实现回复消息

安装依赖raw-body和xml2js：

```bash
cnpm i -S raw-body xml2js
```

处理POST请求,具体实现方法移步源码查看！

```js

...
const getRawBody = require("raw-body");
const { parseXML, formatMessage, tpl2xml } = require("../utils/tool")
const reply = require("./reply")

...

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

...
```
reply.js

```js
/**
 * 处理用户发送的消息和内容，返回不同的内容给用户
 */
module.exports = async(message) => {
    let replyBody = "您在说什么，我听不懂！";

    if (message.MsgType === "text") {
        let content = message.Content;
        if (content === "热门") {
            replyBody = "热门";
        } else if (content === "2") {
            replyBody = "落地成盒";
        } else if (content.match("爱")) {
            replyBody = "我爱你~";
        }
    } else if (message.MsgType === "voice") {
        options.msgType = "voice";
        options.mediaId = message.MediaId;
        console.log(message.Recognition);
    } else if (message.MsgType === "event") {
        if (message.Event === "subscribe") {
            replyBody = "欢迎您的关注~\n" +
                "回复 首页 查看电影预告片页面\n" +
                "回复 热门 查看最新热门电影\n" +
                "回复 文本 查看指定电影信息\n" +
                "回复 语音 查看指定电影信息\n" +
                "也可以点击下面的菜单按钮来了解其它信息~";
        } else if (message.Event === "unsubscribe") {
            console.log("用户取消关注了！")
        } else if (message.Event === "CLICK") {
            replyBody = "您可以按照以下提示来进行操作~\n" +
                "回复 首页 查看电影预告片页面\n" +
                "回复 热门 查看最新热门电影\n" +
                "回复 文本 查看指定电影信息\n" +
                "回复 语音 查看指定电影信息\n" +
                "也可以点击下面的菜单按钮来了解其它信息~";
        }
    }

    return replyBody;
}
```

### 自定义菜单及微信JS-SDK分享接口实例

根目录新建wechat文件夹，进入文件夹创建menu.js和wechat.js文件。

[wechat.js](https://gitee.com/crui14994/wechat/blob/master/wechat/wechat.js)封装了access_token、jsapi_ticket、创建和删除菜单！

#### 自定义菜单

```js
/*routes/index.js*/

...
// 创建实例对象
const Wechat = require("../wechat/wechat")
const wechatApi = new Wechat();

//menu.js文件重新配置菜单
router.get('/updateMenu', async(ctx, next) => {
    let result = await wechatApi.createMenu(menu);
    ctx.body = result
})

...

```

#### JSSDK使用步骤

- 步骤一：绑定域名

    先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。

    备注：登录后可在“开发者中心”查看对应的接口权限。


- 步骤二：引入JS文件

    在需要调用JS接口的页面引入如下JS文件，（支持https）：http://res.wx.qq.com/open/js/jweixin-1.6.0.js

    如需进一步提升服务稳定性，当上述资源不可访问时，可改访问：http://res2.wx.qq.com/open/js/jweixin-1.6.0.js （支持https）。

    备注：支持使用 AMD/CMD 标准模块加载方法加载


- 步骤三：通过config接口注入权限验证配置

    所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的SPA的web app可在每次url变化时进行调用,目前Android微信客户端不支持pushState的H5新特性，所以使用pushState来实现web app的页面会导致签名失败，此问题会在Android6.2中修复）。

    ```js
    wx.config({
    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: '', // 必填，公众号的唯一标识
    timestamp: , // 必填，生成签名的时间戳
    nonceStr: '', // 必填，生成签名的随机串
    signature: '',// 必填，签名
    jsApiList: [] // 必填，需要使用的JS接口列表
    });
    ```

- 步骤四：通过ready接口处理成功验证

    ```js
    wx.ready(function(){
    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    });
    ```

- 步骤五：通过error接口处理失败验证

    ```js
    wx.error(function(res){
    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
    });
    ```

#### 创建jssdk路由权限签名

```js
/*routes/index.js*/

...
const { appID } = require("../config/config").wechat;
...
//用于JS-SDK使用权限签名算法
router.get('/jssdk', async(ctx, next) => {
    /* JS-SDK使用权限(签名算法)
          签名生成规则如下：参与签名的字段包括noncestr（随机字符串）,
          有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。
    */
    //获取传入的url
    let url = ctx.query.url;
    const { ticket } = await wechatApi.fetchTicket();
    const nonceStr = Math.random().toString().split(".")[1];
    const timestamp = Date.now();
    const arr = [`jsapi_ticket=${ticket}`, `noncestr=${nonceStr}`, `timestamp=${timestamp}`, `url=${url}`];
    const str = arr.sort().join("&");
    const signature = sha1(str);

    ctx.body = {
        appId: appID,
        signature,
        nonceStr,
        timestamp
    }
})
...
```

前端使用

```html
<!-- /*public/test.html*/ -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://libs.cdnjs.net/zepto/1.2.0/zepto.min.js"></script>
    <script src="http://res2.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
</head>

<body>
    <div>123</div>
    <script>
        $(function() {
            let shareUrl = location.href.split('#')[0];
            $.ajax({
                url: "http://caorui.max.svipss.top/jssdk",
                data: {
                    url: shareUrl
                },
                success: function(data) {
                    wx.config({
                        //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: data.appId, // 必填，公众号的唯一标识
                        timestamp: data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: data.nonceStr, // 必填，生成签名的随机串
                        signature: data.signature, // 必填，签名
                        jsApiList: [ // 必填，需要使用的JS接口列表
                            "updateAppMessageShareData",
                            "updateTimelineShareData"
                        ]
                    });

                    wx.ready(function() {
                        wx.updateAppMessageShareData({
                            title: '分享测试12dsd', // 分享标题
                            desc: '分享描述cgngn', // 分享描述
                            link: shareUrl, // 分享链接
                            imgUrl: '分享图标', // 分享图标
                            success: function() {
                                // 用户确认分享后执行的回调函数
                            }
                        });
                        wx.updateTimelineShareData({
                            title: '分享测试12fsf', // 分享标题
                            link: shareUrl, // 分享链接
                            imgUrl: '分享图标', // 分享图标
                            success: function() {
                                // 用户确认分享后执行的回调函数
                            }
                        });
                        wx.error(function(res) {
                            alert(res.errMsg); // 正式环境记得关闭啊！！！！
                        });
                    })
                }
            })
        })
    </script>
</body>

</html>

```

### 网页授权获取用户信息

[微信官方文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html)

具体而言，网页授权流程分为四步：

1、引导用户进入授权页面同意授权，获取code

2、通过code换取网页授权access_token（与基础支持中的access_token不同）

3、如果需要，开发者可以刷新网页授权access_token，避免过期

4、通过网页授权access_token和openid获取用户基本信息（支持UnionID机制）

#### 在routes/index.js添加路由



```js
//微信网页授权获取code
router.get("/oauth", async(ctx, next) => {
    let redirect_uri = `http%3a%2f%2fcaorui.max.svipss.top/oauth.html`;
    ctx.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appID}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=STATE&connect_redirect=1#wechat_redirect`)
})

//获取授权后的用户信息
router.get("/getUserInfo", async(ctx, next) => {
    //获取code值
    let code = ctx.query.code;
    if (!code) {
        ctx.redirect('http://caorui.max.svipss.top/oauth')
    }
    let result = await wechatApi.getOauthAccessToken(code);
    let data = await wechatApi.getOauthUserinfo(result.access_token, result.openid);

    ctx.body = data;
})
```

通过code获取AccessToken 和 获取授权后的用户资料 的方法查看wechat.js文件！

在public/oauth.html中使用：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://libs.cdnjs.net/zepto/1.2.0/zepto.min.js"></script>
    <script src="http://res2.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
</head>

<body>
    <div>
        <button id="oauth">获取用户信息</button>
        <div id="userInfo"></div>
    </div>
    <script>
        $(function() {
            //获取url参数
            function getQueryVariable(variable) {
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0] == variable) {
                        return pair[1];
                    }
                }
                return (false);
            }

            var userinfo = JSON.parse(localStorage.getItem("userinfo"));

            // console.log(userinfo)

            if (userinfo) {
                $("#oauth").hide();
                var html = `
                            <image src="${userinfo.headimgurl}"/>
                            <h2>你已经登录</h2>
                            `;
                $("#userInfo").html(html);
                return;
            }

            $("#oauth").on("click", function() {
                location.href = "http://caorui.max.svipss.top/oauth";
            })

            var code = getQueryVariable("code");
            if (code) {
                $.ajax({
                    url: "http://caorui.max.svipss.top/getUserInfo",
                    data: {
                        code
                    },
                    success: function(data) {
                        $("#oauth").hide();
                        // console.log(data)
                        localStorage.setItem("userinfo", JSON.stringify(data));
                        var html = `
                                <image src="${data.headimgurl}"/>
                                <p>nickname:${data.nickname}</p>
                                <p>country:${data.country}</p>
                                <p>province:${data.province}</p>
                                <p>city:${data.city}</p>
                                <p>openid:${data.openid}</p>
                            `
                        $("#userInfo").html(html)
                    }
                })
            }


        })
    </script>
</body>

</html>
```

结果如下：

![360截图17321128447023.png](https://upload-images.jianshu.io/upload_images/14011985-36e0057a6af35449.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
