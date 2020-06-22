

const auth = require('./wechat/auth');
const Koa = require('koa')           // koa框架
const app = new Koa()

app.use(auth())

 


app.listen(3000,() => console.log('服务器启动成功了~'))