const router= require('koa-router')();
const {appId} = require('../config')
//引入 axios 模块
const axios = require('axios');

//微信网页授权获取code
router.get('/wxAuthorize', async (ctx, next) => {
  const state = ctx.query.appId
  console.log(`ctx...` + ctx.href)
  let redirectUrl = ctx.href
  redirectUrl = redirectUrl.replace('wxAuthorize','wxCallback')
  redirectUrl = 'http://192.168.5.189:8082/wxCallback'
  // console.log(`redirectUrl...` + redirectUrl)
  const scope = 'snsapi_userinfo';
  const url = 'https://open.weixin.qq.com/connect/oauth2/authorize?'
  +`appid=${appId}&redirect_uri=${redirectUrl}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
  console.log('url...' + url)
  ctx.redirect(url)
  return
  if(!ctx.query.code && !ctx.query.state) {
    //首次进入，需要跳转到scopeurl 来获取 code
    let curUrl ='http://192.168.5.189:8082'
    let scopeUrl = generatorScopeUrl(curUrl, 'info')
    ctx.status = 302;
    console.log(scopeUrl)
    ctx.redirect(scopeUrl)

  } else if(ctx.query.code && ctx.query.state) {
    console.log(1)
    //用户同意授权
    let code = ctx.query.code; 
    let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=SECRET&code=${code}&grant_type=authorization_code `;
    let userInfo = await getUserInfo(url);
    if(userInfo.errcode){
      throw new Error('fetch userInfo failure, please check the params')
    }
    let {openid, access_token, refresh_token} = userInfo
  
    let fetchWechatUserDetailInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN `;
    let userDetailInfo =  await getUserInfo(fetchWechatUserDetailInfoUrl);
    userInfo = Object.assign({}, userInfo, userDetailInfo)
    alert(userInfo)
    ctx.body=userInfo
  }
})

router.get('/wxCallback', async (ctx,next) => {
  console.log(ctx.query)
  //用户同意授权
  let code = ctx.query.code; 
  
})



module.exports = router
