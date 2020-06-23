/*
  处理并分析用户发送的消息
  决定返回什么消息给用户
 */

module.exports = async message => {
  console.log('replyMSG', message)
  //定义options
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text'
  }
  
  //设置回复用户消息的具体内容
  let content = '';
  
  //判断用户发送消息的类型和内容，决定返回什么消息给用户
  if (message.MsgType === 'text') {
    if (message.Content === '1') {
      content = '大吉大利，今晚吃鸡';
    } else if (message.Content === '2') {
      content = '落地成盒';
    } else if (message.Content === '3') {
      //回复图文消息
      content = [{
        title: 'Nodejs开发',
        description: '微信公众号开发',
        picUrl: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75',
        url: 'http://nodejs.cn/'
      }, {
        title: 'web前端',
        description: '这里有最新、最强的技术',
        picUrl: 'https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1981851186,10620031&fm=58&s=6183FE1ECDA569015C69A554030010F3&bpow=121&bpoh=75',
        url: 'http://www.atguigu.com/'
      }];
      options.msgType = 'news';
      
    } else if (message.Content.match('爱')) {
      //模糊匹配，只要包含爱
      content = '我爱你~';
    } else {
      content = '您在说啥，我听不懂';
    }
  } else if (message.MsgType === 'image') {
    content = '您的图片地址为：' + message.PicUrl;
  } else if (message.MsgType === 'voice') {
    content = '语音识别结果：' + message.Recognition;
  } else if (message.MsgType === 'video') {
    content = '接受了视频消息';
  } else if (message.MsgType === 'shortvideo') {
    content = '接受了小视频消息';
  } else if (message.MsgType === 'location') {
    content = '纬度：' + message.Location_X + ' 经度：' + message.Location_Y
      + ' 缩放大小：' + message.Scale + ' 详情：' + message.Label;
  } else if (message.MsgType === 'link') {
    content = '标题：' + message.Title + ' 描述：' + message.Description + ' 网址：' + message.Url;
  } else if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      //用户订阅事件
      content = '欢迎您的订阅~';
      if (message.EventKey) {
        //扫描带参数的二维码的订阅事件
        content = '欢迎您扫二维码的关注';
      }
    } else if (message.Event === 'SCAN') {
      //已经关注了公众号，在扫描带参数二维码进入公众号
      content = '已经关注了公众号，在扫描带参数二维码进入公众号';
    } else if (message.Event === 'unsubscribe') {
      //用户取消关注
      console.log('无情取关~');
    } else if (message.Event === 'LOCATION') {
      //用户进行会话时，上报一次地理位置消息
      content = '纬度：' + message.Latitude + ' 经度：' + message.Longitude + ' 精度：' + message.Precision;
    } else if (message.Event === 'CLICK') {
      content = '点击了菜单~~~';
    } else if (message.Event === 'VIEW') {
      //用户点击菜单，跳转到其他链接
      console.log('用户点击菜单，跳转到其他链接');
    }
  }
  
  //将最终回复消息内容添加到options中
  options.content = content;

  //将最终的xml数据返回出去
  return options;
}
