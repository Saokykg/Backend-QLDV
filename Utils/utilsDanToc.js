const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

module.exports = class utilsDanToc{
    
    constructor(id, ten){
        this.id = id;
        this.ten = ten;
    }

    static getAll(){
        var sql = "select * from `dantoc`";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select * from `dantoc` where id = ? ";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "insert into `dantoc` (`Dân tộc`) values (?) ";
        return db.execute(sql,[info.ten]);
    }

    static update(info){
        var sql = "update `dantoc` set `Dân tộc` = ? where id = ? ";
        return db.execute(sql,[info.ten, info.id]);
    }

    static delete(id){
        var sql = "delete from `dantoc` where id = ? ";
        return db.execute(sql,[id]);
    }

    static getRandom(){
        var sql = "select id from dantoc order by rand() limit 1";
        return db.execute(sql);
    }
}