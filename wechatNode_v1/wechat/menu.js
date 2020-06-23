// 自定义菜单

module.exports = {
  "button":[
    {
      "type": "click", 
      "name": "今日特惠", 
      "sub_button": [ ]
    },
    {
      "type":"view",
      "name":"语音识别🎤",
      "url":``
    },
    {
      "type": "click", 
      "name": "更多", 
      "sub_button": [ 
        {
          "type": "view",
          "name": "新闻",
          "url": "http://www.atguigu.com"
        },
        {
          "type": "view",
          "name": "房产",
          "url": "http://www.atguigu.com"
        },
        {
          "type": "view",
          "name": "金融",
          "url": "http://www.atguigu.com"
        },
      ]
    },
  ]
}