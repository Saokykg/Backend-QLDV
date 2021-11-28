// const utils = require('../');
const db = require('./connection');
const share = require('../share');
var sqlChiBo = "select * from `chibo` ";

module.exports = class utilsChiBo{
    
    constructor(id, active, ten){
        this.id = id;
        this.active = active;
        this.ten = ten//share.encode(ten);
    }



    static getAll(){
        var sql = sqlChiBo;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqlChiBo + " where id = ?";
        return db.execute(sql,[id]);
    }

    static getByName(name){
        var sql = sqlChiBo + " where `Tên chi bộ` = ?";
        return db.execute(sql,[name]);
    }

    static update(info){
        var sqltop = "update `chibo` set ";

        var sqlmid ="";
        var inserts = [];
        sqlmid += ", `active` = ? ";  inserts.push(info.active);
        sqlmid += ", `Tên chi bộ` = ? ";  inserts.push(info.ten);

        var sqlbot = " where `id` = ? ";
        inserts.push(info.id);

        var sql = sqltop + sqlmid.substring(1) +sqlbot;
        return db.execute(sql, inserts);
    }
    static insert(info){
        var sql = "INSERT INTO `chibo` (`Active`, `Tên chi bộ`) VALUES (?,?)";
        var inserts = [info.active, info.ten];
        return db.execute(sql, inserts);
    }

    static active(id, act){
        var sql = "update chibo set active = ? where id IN (?)";
        sql = require('mysql').format(sql,[act,id]);
        return db.execute(sql);
    }




    /// phần này ko sữ dụng
    static getRandomChibo(){
        var sql = " select id from chibo order by rand() limit 1";
        return db.execute(sql);
    }

    static getRandomLocation(){
        var sql = " select id from ward order by rand() limit 1";
        return db.execute(sql);
    }

    static getRandomChucVu(){
        var sql = " select id from chucvu order by rand() limit 1";
        return db.execute(sql);
    }

}