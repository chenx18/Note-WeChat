const router= require('koa-router')();
var base = require('./base');
var oauth = require('./oauth');

// router.use 为路由分层，在根路由中注册子路由
router.use('', base.routes())
router.use('', oauth.routes())

module.exports = router
