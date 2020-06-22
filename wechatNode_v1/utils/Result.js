// 响应结果封装
// 调用成功时
  // new Result().success(res)
  // new Result('登录成功').success(res)
// 调用成功时，包含参数
  // new Result({ token }, '登录成功').success(res)
// 调用失败时
  // new Result('用户名或密码不存在').fail(res);

const {CODE_SUCCESS, CODE_ERROR, CODE_TOKEN_EXPIRED} = require('./constant');

class Result {
  constructor(data, msg = "操作成功", options) {
    this.data = null;
    if (arguments.length === 0) {
      this.msg = "操作成功";
    } else if (arguments.length === 1) {
      this.msg = data;
    } else {
      this.data = data;
      this.msg = msg;
      if (options) {
        this.options = options;
      }
    }
  }

  createResult() {
    if (!this.code) {
      this.code = CODE_SUCCESS;
    }
    let base = {
      Code: this.code,
      Message: this.msg,
      Data: []
    };
    if (this.data) {
      base.Data = this.data;
    }
    if (this.options) {
      base = { ...base, ...this.options };
    }
    console.log('base',base);
    return base;
  }

  json(res) {
    res.body = this.createResult();
  }

  success(res) {
    this.code = CODE_SUCCESS;
    this.json(res);
  }

  fail(res) {
    this.code = CODE_ERROR;
    this.json(res);
  }

  jwtError(res) {
    this.code = CODE_TOKEN_EXPIRED;
    this.json(res);
  }


}

module.exports = Result;