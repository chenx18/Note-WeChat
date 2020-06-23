const {writeFileAsync, readFileAsync} = require('../utils')
//引入 config 模块
const config = require('../config')
//引入 axios 模块
const axios = require('axios');
//引入 api 模块
const Api = require('./../utils/api');
//引入 menu 模块
const menu = require('./menu');

class Wechat {
  constructor(opts){
  }

  // 获取access_token 
  getAccessToken () {
    const {appId, appsecret} = config; // 参数
    const url = `${Api.accessToken}&appid=${appId}&secret=${appsecret}`; // 请求地址
    // 用 promise 将回调函数中的数据返回出去
    return new Promise((resolve, reject)=>{
      axios.get(url).then(res => {
        console.log('getAccessToken成功', res.data)
        //设置access_token的过期时间 ： 当前时间 + (7200 - 5分钟) * 1000
        res.data.expires_in = Date.now() + (res.data.expires_in - 300) * 1000;
        resolve(res.data)
      }).catch(err => {
        // 请求失败
        reject('getAccessToken 错误：' + err);
      })
    })
  }

  // 创建写入 access_token.txt
  saveAccessToken (accessToken) {
    return writeFileAsync(accessToken,'access_token.txt')
  }

  // 读取凭据 access_token
  readAccessToken () {
    return readFileAsync('access_token.txt')
  }

  // 判断凭据是否过期 （未过期 true; 过期 false）
  isValidAccessToken(data) {
    if(!data || !data.access_token || !data.expires_in) return false;
    // 判断是否过期
    return data.expires_in > Date.now();
  }

  // 用来获取没有过期的access_token
  fetchAccessToken () {
    console.log('this',this);
    if(this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        access_token: this.access_token, 
        expires_in: this.expires_in
      });
    }
    return this.readAccessToken()
      .then(async res => {
        if(this.isValidAccessToken(res)){
          // 没有过期直接使用
          return Promise.resolve(res)
        }else {
          // 重新发送请求获取凭据
          const data = await this.getAccessToken();
          // 保存
          await this.saveAccessToken(data);
          // 将请求回来的凭据返回出去
          return Promise.resolve(data)
        }
      })
      .catch(async err => {
        console.log('fetchAccessToken: '+err);
        // 重新发送请求获取凭据
        const data = await this.getAccessToken();
        // 保存
        await this.saveAccessToken(data);
        // 将凭据返回出去
        return Promise.resolve(data);
      })
      .then(res => {
        //将其请求回来的凭据和过期时间挂载到this上
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        //指定fetchAccessToken方法返回值
        return Promise.resolve(res);
      })
  }


  /**
   * 用来创建自定义菜单
   * @param menu 菜单配置对象
   * @return {Promise<any>}
   */
  createMenu(menu) {
    return new Promise(async (resolve,reject) => {
      // try{
        //  获取access_token
        const data = await this.fetchAccessToken();
        // 请求地址
        const url = `${Api.menu.create}access_token=${data.access_token}`;
        //发送请求
        const headers = {headers:{'Content-Type': 'application/json'}}
        axios.post(url, menu,headers).then(res => {
          console.log(res)
        })
        // const res = await axios.post(url, menu,headers)
        // console.log(res.data)
      // } catch(e) {
      //   reject('deleteMenu方法出了问题：' + e);
      // }
    })
  }
}

module.exports = Wechat;
