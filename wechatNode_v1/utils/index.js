
const { writeFile, readFile } = require('fs');
const { resolve } = require('path');
// 解析 xml 数据的库
const {parseString} = require('xml2js');

module.exports = {

  // 获取用户的消息，返回的数据格式是xml
  getUserDataAsync(req){
    // 用户数据是通过流的方式发送，通过绑定data事件接受数据
    return new Promise((resolve, reject)=>{
      let data = '';
      req.on('data', userData => {
        // 将流式数据全部拼接
        data +=userData;
      })
      .on('end',()=>{
        // 确保数据全部获取了
        resolve(data); 
      })
    })
  },

  // 将xml解析成js对象
  parseXMLAsync (xml) {
    return new Promise((resolve, reject) => {
      parseString(xml, {trim: true}, (err,data) => {
        if(!err) {
          // 解析成功
          resolve(data)
        }else{
          // 解析失败
          reject('parseXMLAsync 错误:' + err);
        }
      })
    })
  },

  // 格式化 xml解析成的js对象
  formatMessage(jsData) {
    const data = jsData.xml;
    // 初始化一个空的对象
    let message = {};
    // 判断数据是一个合法的数据
    if(typeof data === 'object'){
      // 循环遍历对象中的所有数据
      for(let key in data){
        // 获取属性值
        let value = data[key];
        // 过滤掉空的数据和空的数组
        if(Array.isArray(value)&&value.length>0){
          // 在新对象中添加属性和值
          message[key] = value[0];
        }
      }
    }
    // 将格式化后的数据返回出去
    return message;
  },

  // 创建写入
  writeFileAsync (data, fileName){
    // 将data转化为json字符串
    data = JSON.stringify(data);
    const filepath = resolve(__dirname, fileName);
    return new Promise((resolve,reject) => {
      writeFile(filepath, data, err => {
        if(!err) {
          console.log('文件写入成功！')
          resolve()
        }else{
          console.log('writeFileAsync 错误：',err)
          reject()
        }
      })
    })
  },

  // 读取
  readFileAsync(fileName) {
    const filepath = resolve(__dirname, fileName);
    return new Promise((resolve, reject) => {
      readFile(filepath, (err, data) => {
        if(!err) {
          console.log('文件读取成功')
          data = JSON.parse(data);
          resolve(data)
        }else{
          reject('readFileAsync 错误：', err)
        }
      })
    })
  }

}