const db = require('./connection');
const mysql = require('mysql2');
const share = require('../share');

var sqlHSTT = "select idhs, idtt, DATE_FORMAT(`start`, '%d-%m-%Y') as start from `lichsu_trangthai` "

module.exports = class utilsHoSo_TrangThai{
    
    constructor(idhs, idtt, start){
        this.idhs = idhs;
        this.idtt = idtt;
        this.start = start
    }

    static getAll(){
        var sql = sqlHSTT;
        return db.execute(sql);
    }

    static getByIdHs(id){
        var sql = sqlHSTT + "where idhs = ? ";
        return db.execute(sql,[id]);
    }

    static getByIdTt(id){
        var sql = sqlHSTT + "where idtt = ? ";
        return db.execute(sql,[id]);
    }

    static insert(info){
        var sql = "insert into `lichsu_trangthai` (`idhs`, `idtt`, `start`) values (?,?,?) ";
        return db.execute(sql,[info.idhs, info.idtt, info.start]);
    }

    static update(infocu, infomoi){
        var sql = "update `lichsu_trangthai` set `idhs` = ?, `idtt` = ?, `start` = ? where idhs = ?, idtt = ? ";
        return db.execute(sql,[infomoi.idhs, infomoi.idtt, infomoi.start, infocu.idhs, infocu.idtt]);
    }

    static delete(info){
        var sql = "delete from `lichsu_trangthai` where idhs = ? and idtt  = ?";
        return db.execute(sql,[info.idhs, info.idtt]);
    }
}