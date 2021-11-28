const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

module.exports = class utilsTonGiao{
    
    constructor(id, ten){
        this.id = id;
        this.ten = ten;
    }

    static getAll(){
        var sql = "select * from `tongiao`";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select * from `tongiao` where id = ? ";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "insert into `tongiao` (`Tôn giáo`) values (?) ";
        return db.execute(sql,[info.ten]);
    }

    static update(info){
        var sql = "update `tongiao` set `Tôn giáo` = ? where id = ? ";
        console.log(mysql.format(sql,[info.ten, info.id]));
        return db.execute(sql,[info.ten, info.id]);
    }

    static delete(id){
        var sql = "delete from `tongiao` where id = ? ";
        return db.execute(sql,[id]);
    }

    static getRandom(){
        var sql = "select id from tongiao order by rand() limit 1";
        return db.execute(sql);
    }
}