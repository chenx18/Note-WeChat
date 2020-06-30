const BASE_URL = "https://api.weixin.qq.com"

module.exports = {
    //获取access_token
    access_token: BASE_URL + "/cgi-bin/token",
    //获取jsapi_ticket
    jsapi_ticket: BASE_URL + "/cgi-bin/ticket/getticket",
    // 创建菜单 /
    create_menu: BASE_URL + "/cgi-bin/menu/create",
    // 删除菜单 /
    delete_menu: BASE_URL + "/cgi-bin/menu/delete",

    // 网页授权access_token 
    oauth_access_token: BASE_URL + "/sns/oauth2/access_token",
    //获取授权后的用户资料
    oauth_user_info: BASE_URL + "/sns/userinfo",
}