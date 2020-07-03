// 自定义菜单
const {url} = require('./../config')
module.exports = {
  "button":[
    {
      "type":"view",
      "name":"硅谷电影6",
      "url":`${url}/search`
    },
    {
      "type":"view",
      "name":"语音识别1",
      "url":`${url}/wxAuthorize`
    },
    {
      "name": "戳我4",
      "sub_button": [
        {
          "type": "view",
          "name": "官网2",
          "url": "http://192.168.14.17:8082"
        },
        {
          "type": "click",
          "name": "帮助",
          "key": "help"
        }
      ]
    }
  ]
}