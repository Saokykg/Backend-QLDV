const utils = require('../utils');
const db = require('./connection');

var sqltotnghiep = "select * from `hosototnghiep` ";

module.exports = class utilsTotNghiep{
    
    constructor(id, totnghiep){
        this.id = id;
        this.totnghiep = totnghiep;
    }

    static getAll(){
        var sql = sqltotnghiep;
        return db.execute(sql);
    }

    static getById(id){
        var sql = sqltotnghiep + " where id = ?";
        return db.execute(sql,[id]);
    }

    static update(info){
        var sqltop = "update `hosototnghiep` set ";

        var sqlmid ="";
        var inserts = [];
        if (info.totnghiep !=null ){ sqlmid += ", `Tốt nghiệp` = ? ";  inserts.push(info.totnghiep);}

        var sqlbot = " where `id` = ? ";

        inserts.push(info.id);
        var sql = sqltop + sqlmid +sqlbot;

        db.execute(sql, inserts);
    }
    static insert(info){
        var sql = "INSERT INTO `hosototnghiep` (`Tốt nghiệp`) VALUES (?)";
        var inserts = [info.totnghiep];
            
        db.execute(sql, inserts);
    }

}