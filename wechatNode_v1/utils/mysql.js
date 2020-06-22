const mysql = require('mysql');
const MYSQL_CONFIG = require('../config/DBconfig');

/*建立连接池*/
const pool = mysql.createPool(MYSQL_CONFIG.database)

/*连接数据库*/
const query = (sql, val) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if(err) reject(err)
      else {
        if(val) {
          connection.query(sql, val, (err, rows) => {
            if(err) reject(err) 
            else resolve(rows)
          })
        }else {
          connection.query(sql, (err, rows) => {
            if(err) reject(err)
            else resolve(rows);
          })
          connection.release();
        }
      }
    })
  })
}

module.exports = { query }