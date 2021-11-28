var mysql = require('mysql2')
require('dotenv').config()


var pool = mysql.createPool({
    host: "localhost",
    user: process.env.db_user,
    password: process.env.db_pass,
    database: process.env.db_name
});


module.exports = pool.promise();
