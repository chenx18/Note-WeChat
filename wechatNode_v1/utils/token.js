const {TOKEN_KEY} = require('./constant');
const jwt = require('jsonwebtoken');   //引入jwt做token验证
const Result = require("./Result");

/* 生成一个期限为1小时的token */
async function createToken(payload) {
  return jwt.sign(payload, TOKEN_KEY, {expiresIn: '4h'});
}

// 验证token
async function verifyToken(ctx, next) {
	const {url} = ctx.request;
  if (url.includes('login') || url.includes('register')) {
    await next()
  } else {
		if (ctx.header && ctx.header.authorization) {
			const token = ctx.header.authorization.split(' ')[1];
			if(token){
				try{
					await jwt.verify(token,TOKEN_KEY,{complete: true});
					await next();
				}catch(err){
					if(err){
						ctx.status = 401;
						switch (err.name) {
							case 'JsonWebTokenError': // 无效的token
								new Result('无效的token').jwtError(ctx)
								break;
							case 'TokenExpiredError':  //token过期
								new Result('token过期').jwtError(ctx)
								break;
						}
					}
				}
			}else{
				ctx.status = 401;
				new Result('token过期').jwtError(ctx)
			}
		} else{
			ctx.status = 401
			new Result('token过期').jwtError(ctx)
		}
	} 
}


module.exports = {createToken, verifyToken}