const router= require('koa-router')();
const userRouter = require('./user');

// router.use 为路由分层，在根路由中注册子路由
router.use('/api', userRouter.routes())

module.exports = router
