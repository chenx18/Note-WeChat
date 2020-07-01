const router= require('koa-router')();
const {appId} = require('../config')
//引入 axios 模块
const axios = require('axios');

//微信网页授权获取code
router.get('/oauth', async (ctx, next) => {

  if(!ctx.query.code && !ctx.query.state) {
    //首次进入，需要跳转到scopeurl 来获取 code
    let curUrl ='http://192.168.14.17:8082'
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

router.get('/wxtoken', async (ctx,next) => {
  //用户同意授权
  let code = ctx.query.code; 
})

function generatorScopeUrl (url, type) {
  if(!url) return false;
  let scopeType = 'snsapi_base';
  if(type == 'info') scopeType = 'snsapi_userinfo';
  let state = 'userstate'; //自定义字符串
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${url}&response_type=code&scope=${scopeType}&state=${state}#wechat_redirect `
}

// 获取UserInfo
function getUserInfo (url) {
  return new Promise((resolve, reject)=>{
    axios.get(url).then(res => {
      console.log('getUserInfo', res.data)
      resolve(res.data)
    }).catch(err => {
      reject('getUserInfo 错误：' + err);
    })
  })
}


module.exports = router
