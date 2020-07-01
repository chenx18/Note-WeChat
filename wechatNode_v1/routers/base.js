const router= require('koa-router')();
const sha1 = require('sha1');
const Wechat = require('./../wechat/wechat');
const { url, appId }= require('./../config');

const wechatApi = new Wechat();

//menu.js文件重新配置菜单
router.get('/updateMenu', async(ctx, next) => {
  console.log('updateMenu')
  await wechatApi.deleteMenu();
  let result = await wechatApi.createMenu(menus);
  ctx.body = result
})

// 搜索
router.get('/search', async (ctx, next) => {
  console.log(ctx)
  // 生成js-sdk使用的签名：
  //   1. 组合参与签名的四个参数：jsapi_ticket（临时票据）、noncestr（随机字符串）、timestamp（时间戳）、url（当前服务器地址）
  //   2. 将其进行字典序排序，以'&'拼接在一起
  //   3. 进行sha1加密，最终生成signature
  //获取ticket
  const {ticket} = await wechatApi.fetchTicket();
  //获取随机字符串
  const noncestr = Math.random().toString().split('.')[1];
  // 获取当前时间戳
  const timestamp = Date.now();
  // 按照key=value 将其拼装
  const params = [
    `jsapi_ticket=${ticket}`, 
    `noncestr=${noncestr}`, 
    `timestamp=${timestamp}`, 
    `url=${url}/search`
  ];
  const str = params.sort().join("&");
  const signature = sha1(str);
  const data = {
    appId,
    signature,
    noncestr,
    timestamp
  }
  console.log('/search', data);
  await ctx.render('search', {data})
})


module.exports = router
