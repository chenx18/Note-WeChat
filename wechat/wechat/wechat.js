const { appID, appsecret } = require("../config/config").wechat;
const api = require("../config/api");
const request = require("request-promise")
const { writeFileAsync, readFileAsync } = require("../utils/tool")

class Wechat {
    constructor() {

        }
        /**获取封装request请求方法 */
    async request(options) {
        options = Object.assign({}, options, { json: true });

        try {
            const res = await request(options);
            return res;
        } catch (error) {
            console.log(error);
        }
    }

    /**--------基础支持access_token相关------------------------------------------------------------------------------------------------------- */

    /**获取access_token */
    async getAccessToken() {
        try {
            let url = `${api.access_token}?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;
            let result = await this.request({ url });
            //设置过期时间
            result.expires_in = Date.now() + (result.expires_in - 5 * 60) * 1000;
            return result;
        } catch (error) {
            console.log("获取access_token失败！");
            return error
        }

    }

    /** 保存access_token */
    saveAccessToken(accessToken) {
            return writeFileAsync(accessToken, "../access_token.txt");
        }
        /** 读取access_token */
    readAccessToken() {
        return readFileAsync("../access_token.txt");
    }

    /**验证access_token是否有效 */
    isValidAccessToken(data) {
        //检测传入参数是否有效
        if (!data && !data.access_token && !data.expires_in) {
            return false;
        }
        // 检测access_token是否在有效期内
        // if(data.expires_in < Date.now()){
        //     return false
        // }else{
        //     return true
        // }
        //简写
        return data.expires_in > Date.now();
    }

    /** 获取没有过期的access_token */
    async fetchAccessToken() {
        try {
            let result = await this.readAccessToken();
            if (this.isValidAccessToken(result)) {
                result = result;
            } else {
                let getResult = await this.getAccessToken();
                await this.saveAccessToken(getResult);
                result = getResult;
            }
            console.log(result)
            return result;
        } catch (error) {
            return error;
        }

    }

    /**--------基础支持jsapi_ticket相关------------------------------------------------------------------------------------------------------- */

    /**获取jsapi_ticket */
    async getTicket() {
        try {
            const data = await this.fetchAccessToken()
            let url = `${api.jsapi_ticket}?access_token=${data.access_token}&type=jsapi`;
            let result = await this.request({ url });
            //设置过期时间
            let expires_in = Date.now() + (result.expires_in - 5 * 60) * 1000;
            return { ticket: result.ticket, expires_in };
        } catch (error) {
            console.log("获取jsapi_ticket失败！");
            return error
        }
    }

    /** 保存jsapi_ticket */
    saveTicket(ticket) {
            return writeFileAsync(ticket, "../jsapi_ticket.txt");
        }
        /** 读取jsapi_ticket */
    readTicket() {
        return readFileAsync("../jsapi_ticket.txt");
    }

    /**验证jsapi_ticket是否有效 */
    isValidTicket(data) {
        //检测传入参数是否有效
        if (!data && !data.ticket && !data.expires_in) {
            return false;
        }
        return data.expires_in > Date.now();
    }

    /** 获取没有过期的jsapi_ticket */
    async fetchTicket() {
        try {
            let result = await this.readTicket();
            if (this.isValidTicket(result)) {
                result = result;
            } else {
                let getResult = await this.getTicket();
                await this.saveTicket(getResult);
                result = getResult;
            }
            return result;
        } catch (error) {
            return error;
        }

    }

    /**--------菜单相关----------------------------------------------------------------------------------------------------------------------------------------- */

    /** 创建菜单 */
    async createMenu(menu) {
            try {
                //创建之前要先删除菜单
                await this.deleteMenu();
                //获取access_token
                let data = await this.fetchAccessToken();
                let url = `${api.create_menu}?access_token=${data.access_token}`
                let result = await this.request({ method: "POST", url, body: menu });
                return result;
            } catch (error) {
                console.log(error)
            }

        }
        /** 删除菜单 */
    async deleteMenu() {
        try {
            //获取access_token
            let data = await this.fetchAccessToken();

            let url = `${api.delete_menu}?access_token=${data.access_token}`
            let result = await this.request({ url });
            return result;
        } catch (error) {
            console.log(error)
            return error
        }

    }


    /**--------网页授权access_token------------------------------------------------------------------------------------------------------------------------------------------- */

    /* 具体而言，网页授权流程分为四步：

         1、引导用户进入授权页面同意授权，获取code

         2、通过code换取网页授权access_token（与基础支持中的access_token不同）

         3、如果需要，开发者可以刷新网页授权access_token，避免过期

         4、通过网页授权access_token和openid获取用户基本信息（支持UnionID机制）*/


    /**通过code获取AccessToken（注意：这里是网页授权access_token，不是基础支持中的access_token）*/
    async getOauthAccessToken(code) {
        try {
            let url = `${api.oauth_access_token}?appid=${appID}&secret=${appsecret}&code=${code}&grant_type=authorization_code`;
            let result = await this.request({ url });
            return result;
        } catch (error) {
            console.log("获取网页授权access_token失败！");
            return error
        }
    }

    /**获取授权后的用户资料*/
    async getOauthUserinfo(oauth_access_token, openid) {
        try {
            let url = `${api.oauth_user_info}?access_token=${oauth_access_token}&openid=${openid}&lang=zh_CN`;
            let result = await this.request({ url });
            return result;
        } catch (error) {
            console.log("获取用户信息失败！");
            return error
        }
    }
}

module.exports = Wechat;