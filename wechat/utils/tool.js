/**
 * 工具函数
 */
const xml2js = require("xml2js");
const template = require("../reply/template")
const { writeFile, readFile } = require("fs")
const path = require("path")

// xml2js
const parseXML = (xml) => {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml, { trim: true }, (err, content) => {
                if (err) reject(err)
                else resolve(content)
            })
        })
    }
    // 格式化数据
const formatMessage = result => {
        let message = {};

        if (typeof result === "object") {
            const keys = Object.keys(result);

            for (let i = 0; i < keys.length; i++) {
                let item = result[keys[i]];
                let key = keys[i];

                if (!(item instanceof Array) || item.length === 0) {
                    continue
                }
                if (item.length === 1) {
                    let val = item[0];
                    if (typeof val === "object") {
                        message[key] = formatMessage(val);
                    } else {
                        message[key] = (val || "").trim();
                    }
                } else {
                    message[key] = [];
                    for (let j = 0; i < item.length; j++) {
                        message[key].push(formatMessage(item[j]));
                    }
                }
            }
        }
        return message;
    }
    //生成xml数据
const tpl2xml = (content, message) => {
        let type = "text";

        if (Array.isArray(content)) {
            type = "news"
        }

        if (!content) content = "Empty News";
        if (content && content.type) {
            type = content.type;
        }

        let info = Object.assign({}, {
            content: content,
            msgType: type,
            createTime: new Date().getTime(),
            toUserName: message.FromUserName,
            fromUserName: message.ToUserName
        })

        return template(info)
    }
    //将access_token或者jsapi_ticket写入文件
const writeFileAsync = (data, fileName) => {
        data = JSON.stringify(data);
        return new Promise((resolve, reject) => {
            writeFile(path.resolve(__dirname, fileName), data, err => {
                if (!err) {
                    // console.log('文件保存成功');
                    resolve('文件保存成功')
                } else {
                    reject("文件保存失败")
                }
            });
        })
    }
    //读取文件内容
const readFileAsync = (fileName) => {
    return new Promise((resolve, reject) => {
        readFile(path.resolve(__dirname, fileName), (err, data) => {
            if (!err) {
                // console.log('文件读取成功');
                data = JSON.parse(data);
                resolve(data)
            } else {
                reject("文件读取失败")
            }
        });
    })
}
module.exports = {
    parseXML,
    formatMessage,
    tpl2xml,
    writeFileAsync,
    readFileAsync
}