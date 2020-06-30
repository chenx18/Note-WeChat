
const path = require('path');
const Koa = require('koa')           // koa框架
const Template = require('koa-art-template');
const reply = require("./reply")

const app = new Koa()
const router = require('./routers/index');

// 配置 koa-art-template模板引擎
// 核心方法之一：将模板源代码编译成函数并立刻执行 template.render(source, data, options);
Template(app, {
  root: path.join(__dirname, 'views'),   // 视图的位置
  extname: '.html',  // 后缀名
  debug: process.env.NODE_ENV !== 'production' //是否开启调试模式
});


//接收处理所有消息
app.use(reply());

// 路由配置
app.use(router.routes(),router.allowedMethods())

app.listen(3000,() => console.log('服务器启动成功了~'))