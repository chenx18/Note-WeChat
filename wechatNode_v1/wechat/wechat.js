const {readFile, writeFile} = require('fs')
const config = require('../config')
const axios = require('axios');

// 用于存取 accessToke 的文件名；
const tokenFileName = 'accessToken.text';  
const baseUrl="https://api.weixin.qq.com/";
const WxApi={
    accessToken:baseUrl+"cgi-bin/token?grant_type=client_credential"
}
class Wechat {
  constructor(opts){
    
  }

  // 获取access_token 
  getAccessToken () {
    // 参数
    const {appId, appsecret} = config;
    // 请求地址
    const url = `${WxApi}&appid=${appId}&secret=${appsecret}`;

    // 用 promise 将回调函数中的数据返回出去
    return new Promise((resolve, reject)=>{
      axios.get(url).then(res => {
        // 请求成功
        console.log('axios', res)
        //重新赋值凭据的过期时间 ： 当前时间 + (7200 - 5分钟) * 1000
        res.data.expires_in = Date.now() + (res.data.expires_in - 300) * 1000;
      })
      .catch(err => {
        // 请求失败
        reject('getAccessToken 方法出问题' + err);
      })
    })
  }

  // 将凭据保存为一个文件
  saveAccessToken () {
    return new Promise((resolve, reject) => {
      // 将凭据保存为一个文件
      writeFile(tokenFileName, data, err => {
        if(!err) {
          //写入成功
          resolve();
        }else {
          //写入失败
          reject('saveAccessToken:' + err)
        }
      })
    })
  }

  // 读取凭据
  readAccessToken () {
    return new Promise((resolve, reject) => {
      readFile(tokenFileName, (err, data) => {
        if(!err) {
          // 将读写的 Buffer 数据转化为 json 字符串
          data = data.toString();
          // 将 json 字符串转化为对象
          data = JSON.parse(data);
          // 读取成功
          resolve(data);
        }else {
          // 读取失败
          reject('readAccessToken:'+ err)
        }
      })
    })
  }

  // 判断凭据是否过期 （未过期 true; 过期 false）
  isValidAccessToken(data) {

    if(!data || !data.access_token || !data.expires_in) return false;
    // 判断是否过期
    return data.expires_in > Date.now();
  }

  fetchAccessToken () {
    console.log(this);
    if(this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      let obj = {access_token: this.access_token, expires_in: this.expires_in};
      return Promise.resolve(obj);
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
}

module.exports = Wechat;
