// 地址前缀

const prefix = 'https://api.weixin.qq.com';

module.exports = {
  // 获取access_token
  accessToken: `${prefix}/cgi-bin/token?grant_type=client_credential`,
  // 获取jsapi_ticket
  ticket: `${prefix}/cgi-bin/ticket/getticket?type=jsapi`,
  // 菜单 创建/删除
  menu: {
    create: `${prefix}/cgi-bin/menu/create?`,
    delete: `${prefix}/cgi-bin/menu/delete?`
  },
  // 网页授权access_token 
  oauth_access_token: `${prefix}/sns/oauth2/access_token`,

  //获取授权后的用户资料
  oauth_user_info: `${prefix}/sns/userinfo`,

  temporary: {
    upload: `${prefix}/cgi-bin/media/upload?`,
    get: `${prefix}/cgi-bin/media/get?`
  },
  
  permanment: {
    uploadNews: `${prefix}/cgi-bin/material/add_news?`,
    uploadImg: `${prefix}/cgi-bin/media/uploadimg?`,
    uploadOthers: `${prefix}/cgi-bin/material/add_material?`,
    get: `${prefix}/cgi-bin/material/get_material?`
  }
}