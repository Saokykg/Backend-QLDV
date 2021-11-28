const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

module.exports = class utilsTrangthai{
    
    constructor(id, trangthai){
        this.id = id;
        this.trangthai = trangthai;
    }

    static getAll(){
        var sql = "select * from `trangthai`";
        return db.execute(sql);
    }

    static getById(id){
        var sql = "select * from `trangthai` where id = ? ";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "insert into `trangthai` (`Trạng thái`) values (?) ";
        return db.execute(sql,[info.trangthai]);
    }

    static update(info){
        var sql = "update `trangthai` set `Trạng thái` = ? where id = ? ";
        return db.execute(sql,[info.trangthai, info.id]);
    }

    static delete(id){
        var sql = "delete from `trangthai` where id = ? ";
        return db.execute(sql,[id]);
    }

    static getRandom(){
        var sql = "select id from trangthai order by rand() limit 1";
        return db.execute(sql);
    }
}